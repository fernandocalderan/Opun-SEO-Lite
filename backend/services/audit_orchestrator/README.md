# Audit Orchestrator Service (Skeleton)

Este servicio se encargará de recibir las solicitudes de auditoría desde el API Gateway, validar parámetros y distribuir el trabajo en colas especializadas (`audit_requests`, `fetch_queue`, `analysis_queue`).

## Pendiente
- Definir contratos Pydantic para `AuditRequest` y `AuditResult`.
- Integrar con Kafka/RabbitMQ y Redis para orquestación.
- Implementar workers autoscalables para los distintos tipos de auditoría.
- Registrar métricas (OpenTelemetry) y eventos (`audit.completed`).
