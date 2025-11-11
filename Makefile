UID := $(shell id -u)
GID := $(shell id -g)
FE_CONTAINER := opun-frontend-dev
NODE_IMAGE := node:20.19

.PHONY: fe-up fe-down fe-logs fe-clean be-up be-down be-logs be-migrate

fe-up:
	-@docker rm -f $(FE_CONTAINER) >/dev/null 2>&1 || true
	@cd frontend && docker run -d \
		--name $(FE_CONTAINER) \
		--user $(UID):$(GID) \
		--add-host=host.docker.internal:host-gateway \
		-e NEXT_PUBLIC_API_BASE_URL=$${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8000} \
		-e CHOKIDAR_USEPOLLING=1 \
		-p 3002:3000 \
		-v "$$PWD":/app \
		-w /app \
		$(NODE_IMAGE) \
		bash -lc 'npm ci && npm run dev -- --hostname 0.0.0.0 -p 3000'

fe-down:
	-@docker rm -f $(FE_CONTAINER) >/dev/null 2>&1 || true

fe-logs:
	@docker logs -f $(FE_CONTAINER)

fe-clean:
	@cd frontend && docker run --rm -v "$$PWD":/mnt alpine sh -c 'rm -rf /mnt/.next && chown -R $(UID):$(GID) /mnt/node_modules 2>/dev/null || true'

be-up:
	@docker compose up -d api worker beat postgres redis

be-down:
	@docker compose down --remove-orphans

be-logs:
	@docker compose logs -f api worker beat

be-migrate:
	@docker compose exec api alembic upgrade head

