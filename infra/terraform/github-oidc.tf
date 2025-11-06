locals {
  gha_enabled = var.enable_github_oidc && var.github_repo != ""
}

resource "aws_iam_openid_connect_provider" "github" {
  count = var.enable_github_oidc && var.github_oidc_provider_arn == "" ? 1 : 0

  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [
    # GitHub Actions OIDC root CAs (may rotate; update as needed)
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "a031c46782e6e6c662c2c87c76da9aa62ccabd8e"
  ]
}

locals {
  gha_oidc_provider_arn = var.github_oidc_provider_arn != "" ? var.github_oidc_provider_arn : (length(aws_iam_openid_connect_provider.github) > 0 ? aws_iam_openid_connect_provider.github[0].arn : "")
}

data "aws_iam_policy_document" "gha_assume" {
  count = local.gha_enabled && local.gha_oidc_provider_arn != "" ? 1 : 0

  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [local.gha_oidc_provider_arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:ref:refs/heads/${var.github_branch}"]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  count              = local.gha_enabled && local.gha_oidc_provider_arn != "" ? 1 : 0
  name               = "${local.name}-gha-oidc"
  assume_role_policy = data.aws_iam_policy_document.gha_assume[0].json
  tags               = local.tags
}

resource "aws_iam_role_policy_attachment" "gha_admin" {
  count      = local.gha_enabled && local.gha_oidc_provider_arn != "" ? 1 : 0
  role       = aws_iam_role.github_actions[0].name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

output "github_actions_role_arn" {
  description = "ARN del rol que GitHub Actions asume via OIDC"
  value       = try(aws_iam_role.github_actions[0].arn, null)
}

