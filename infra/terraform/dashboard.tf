resource "aws_cloudwatch_dashboard" "app" {
  dashboard_name = "${local.name}-dashboard"
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "ECS CPU Utilization %"
          region = var.aws_region
          view   = "timeSeries"
          stat   = "Average"
          period = 60
          yAxis = {
            left = { min = 0, max = 100 }
          }
          metrics = [
            ["AWS/ECS", "CPUUtilization", "ClusterName", local.name, "ServiceName", local.name]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "ECS Memory Utilization %"
          region = var.aws_region
          view   = "timeSeries"
          stat   = "Average"
          period = 60
          yAxis = {
            left = { min = 0, max = 100 }
          }
          metrics = [
            ["AWS/ECS", "MemoryUtilization", "ClusterName", local.name, "ServiceName", local.name]
          ]
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "ALB 4XX/5XX"
          region = var.aws_region
          view   = "timeSeries"
          stat   = "Sum"
          period = 60
          metrics = [
            ["AWS/ApplicationELB", "HTTPCode_ELB_4XX_Count", "LoadBalancer", module.alb.arn_suffix],
            ["AWS/ApplicationELB", "HTTPCode_ELB_5XX_Count", "LoadBalancer", module.alb.arn_suffix]
          ]
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "TargetGroup Healthy Host Count"
          region = var.aws_region
          view   = "timeSeries"
          stat   = "Average"
          period = 60
          metrics = [
            ["AWS/ApplicationELB", "HealthyHostCount", "TargetGroup", values(module.alb.target_groups)[0].arn_suffix]
          ]
        }
      }
    ]
  })
}

