variable "project_name" {
  description = "Nombre base para recursos (p. ej. opun-seo-lite)"
  type        = string
}

variable "aws_region" {
  description = "Región AWS"
  type        = string
  default     = "eu-west-1"
}

variable "container_image" {
  description = "Imagen del contenedor (ECR URL + tag)"
  type        = string
}

variable "container_port" {
  description = "Puerto expuesto por el contenedor"
  type        = number
  default     = 3333
}

variable "desired_count" {
  description = "Número de tareas Fargate"
  type        = number
  default     = 1
}

variable "cpu" {
  description = "CPU para la tarea Fargate"
  type        = number
  default     = 256
}

variable "memory" {
  description = "Memoria para la tarea Fargate (MB)"
  type        = number
  default     = 512
}

variable "health_check_path" {
  description = "Ruta para healthcheck del ALB"
  type        = string
  default     = "/v1/overview"
}

variable "acm_certificate_arn" {
  description = "ARN del certificado ACM para HTTPS en el ALB (eu-west-1). Si se deja vacío, sólo se crea listener HTTP 80."
  type        = string
  default     = ""
}

variable "redirect_http_to_https" {
  description = "Si hay certificado, redirige HTTP:80 a HTTPS:443"
  type        = bool
  default     = true
}

variable "enable_github_oidc" {
  description = "Si true, crea rol IAM para que GitHub Actions asuma via OIDC"
  type        = bool
  default     = false
}

variable "github_repo" {
  description = "Repositorio GitHub con formato owner/repo para OIDC (p. ej. org/Opun-SEO-Lite)"
  type        = string
  default     = ""
}

variable "github_branch" {
  description = "Rama permitida para asumir el rol via OIDC"
  type        = string
  default     = "main"
}

variable "github_oidc_provider_arn" {
  description = "ARN de un OIDC provider existente para GitHub (opcional). Si vacío y enable_github_oidc=true, se crea uno."
  type        = string
  default     = ""
}
