output "alb_dns_name" {
  description = "DNS del Application Load Balancer"
  value       = module.alb.dns_name
}

output "ecr_repository_url" {
  description = "URL del repositorio ECR"
  value       = module.ecr.repository_url
}

output "ecs_cluster_name" {
  description = "Nombre del cluster ECS"
  value       = aws_ecs_cluster.this.name
}

output "cloudwatch_dashboard_name" {
  description = "Nombre del dashboard unificado"
  value       = aws_cloudwatch_dashboard.app.dashboard_name
}

output "resource_group_arn" {
  description = "ARN del AWS Resource Group (visible en SSM Application Manager)"
  value       = aws_resourcegroups_group.app.arn
}
