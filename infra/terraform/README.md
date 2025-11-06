# Infraestructura AWS (Terraform)

Esqueleto para desplegar el backend de Opun-SEO-Lite en AWS usando:
- ECR para imágenes Docker
- ECS Fargate (sin servidores) para ejecutar el contenedor
- ALB para exponer HTTP (puerto 80)
- VPC con 2 subnets públicas (tareas con IP pública para simplificar)
- CloudWatch Logs

Nota importante: El backend actual persiste datos en ficheros `.data` (no apto producción). Para producción, migrar a una base de datos (RDS/DynamoDB) o S3.

## Requisitos
- Terraform >= 1.6
- AWS CLI v2 con SSO configurado (`aws configure sso`)

## Variables principales
- `project_name` (string): prefijo de recursos (p. ej. `opun-seo-lite`)
- `aws_region` (string): región AWS (por defecto `us-east-1`)
- `container_image` (string): imagen del contenedor (`<account>.dkr.ecr.<region>.amazonaws.com/opun-seo-lite:TAG`)
- `container_port` (number): puerto del contenedor (por defecto 3333)

## Uso rápido (AWS SSO, eu-west-1)
```bash
cd infra/terraform

# Inicializar providers y módulos
terraform init

# Iniciar sesión con SSO y seleccionar el perfil (ej. "default" o "sso-opun")
aws sso login --profile <AWS_PROFILE>
export AWS_PROFILE=<AWS_PROFILE>
export AWS_REGION=eu-west-1
export ACCOUNT_ID=285392455781
export REPO=opun-seo-lite
export ECR_URL="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO:latest"

# Crear sólo el ECR primero (para poder publicar la imagen)
terraform apply -target=module.ecr -var "project_name=$REPO" -var "aws_region=$AWS_REGION"

# Login en ECR y publicar la imagen local del backend
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
docker tag opun-backend:local $ECR_URL
docker push $ECR_URL

# Plan completo con la imagen ya publicada
terraform plan -var "project_name=$REPO" -var "aws_region=$AWS_REGION" -var "container_image=$ECR_URL"

# Aplicar
terraform apply -var "project_name=$REPO" -var "aws_region=$AWS_REGION" -var "container_image=$ECR_URL"
```

## Flujo sugerido de CI/CD
1. GitHub Actions (archivo `.github/workflows/ci-cd.yml`) publica la imagen a ECR y aplica Terraform.
2. Para usar OIDC desde GitHub, habilita el rol IAM en Terraform:
   - `-var 'enable_github_oidc=true' -var 'github_repo=<OWNER/REPO>' -var 'github_branch=main'`
   - Si ya tienes un OIDC provider, pásalo con `-var 'github_oidc_provider_arn=arn:aws:iam::<ACCOUNT>:oidc-provider/token.actions.githubusercontent.com'`.
3. En repositorio GitHub define el secreto `AWS_ROLE_TO_ASSUME` con el ARN del rol de salida `github_actions_role_arn`.
4. El workflow usa `eu-west-1` y tu cuenta `285392455781`. Ajusta `ECR_REPOSITORY` si deseas otro nombre.

## Certificado TLS (opcional)
- Listener HTTPS 443 soportado: pasa `-var "acm_certificate_arn=arn:aws:acm:eu-west-1:285392455781:certificate/xxxxxxxx"`.
- El SG del ALB permite 80/443. Si no pasas `acm_certificate_arn`, sólo quedará activo el listener 80.
