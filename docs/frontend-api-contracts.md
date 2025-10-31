# API Contracts – Frontend Expectations (Draft)

> Ultima actualizacion: 31 Oct 2025

Este documento describe los contratos de datos que el frontend espera recibir/producir para la nueva plataforma.

## 1. Auditorias

### GET `/v1/audits/summary`
```json
{
  "completed": 128,
  "avg_duration_seconds": 760,
  "critical_open": 7
}
```

### GET `/v1/audits/queue`
```json
[
  {
    "id": "queue-1",
    "project": "Brand / Landing principal",
    "type": "full",
    "status": "running",
    "started_at": "2025-10-31T16:20:00Z",
    "eta_seconds": 300
  }
]
```

### GET `/v1/audits/history?limit=20`
```json
[
  {
    "id": "hist-1",
    "project": "Brand / Landing principal",
    "completed_at": "2025-10-30T15:54:00Z",
    "score": 84,
    "critical_issues": 2,
    "owner": "seo_ops"
  }
]
```

## 2. Reputacion

### GET `/v1/reputation/sentiment/timeline?range=7d`
```json
[
  { "date": "2025-10-25", "sentiment_score": 70, "mentions_positive": 14, "mentions_negative": 5 }
]
```

### GET `/v1/reputation/channels`
```json
[
  { "channel": "serp_top_stories", "share": 0.34, "sentiment": "positive", "exposure": "high" }
]
```

### GET `/v1/reputation/mentions?state=open`
```json
[
  {
    "id": "mention-1",
    "source": "reddit",
    "sentiment": "negative",
    "summary": "El soporte tarda en responder...",
    "published_at": "2025-10-31T13:00:00Z",
    "reach": 14000,
    "recommended_action": "coordinate_pr_response"
  }
]
```

## 3. Plan de acciones

### GET `/v1/plan/board`
```json
{
  "columns": [
    {
      "title": "pending",
      "items": [
        {
          "id": "plan-1",
          "title": "Responder hilo negativo",
          "impact": "high",
          "effort": "medium",
          "owner": "pr",
          "due_date": "2025-11-02"
        }
      ]
    }
  ]
}
```

### GET `/v1/plan/table?limit=50`
```json
[
  {
    "id": "plan-table-1",
    "category": "seo_technical",
    "task": "Corregir canonical duplicado",
    "impact": "high",
    "effort": "low",
    "status": "in_progress",
    "owner": "seo_ops",
    "due_date": "2025-11-02"
  }
]
```

## 4. Reportes

### GET `/v1/reports`
```json
[
  {
    "id": "report-1",
    "title": "Monthly Reputation Overview",
    "project": "brand_hq",
    "generated_at": "2025-10-30T09:10:00Z",
    "status": "ready",
    "formats": ["pdf", "html"],
    "download_url": "https://cdn.opun.dev/reports/report-1.pdf"
  }
]
```

### GET `/v1/reports/templates`
```json
[
  {
    "id": "tpl-1",
    "name": "Executive Reputation Brief",
    "description": "Resumen ejecutivo con KPIs principales",
    "last_updated": "2025-10-20"
  }
]
```

### POST `/v1/reports/generate`
```json
{
  "project_id": "brand_hq",
  "template_id": "tpl-1",
  "format": "pdf",
  "range": {
    "from": "2025-10-01",
    "to": "2025-10-31"
  }
}
```

## 5. Autenticacion y metadatos
- Todas las peticiones deben incluir `Authorization: Bearer <token>` o `x-api-key`.
- Respuestas paginadas usaran `next_cursor`.
- Los timestamps se expresan en ISO8601 UTC.

> Estos contratos se revisaran cuando arranque el desarrollo backend para garantizar consistencia y versionado.
