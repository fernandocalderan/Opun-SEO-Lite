resource "aws_resourcegroups_group" "app" {
  name = "${local.name}-app"
  tags = local.tags

  resource_query {
    query = jsonencode({
      ResourceTypeFilters = [
        "AWS::AllSupported"
      ],
      TagFilters = [
        {
          Key    = "Project"
          Values = [local.name]
        }
      ]
    })
    type = "TAG_FILTERS_1_0"
  }
}

