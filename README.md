# Opun SEO Lite — Streamlit Base

El repositorio fue reiniciado para quedarse únicamente con la base funcional que vivía en `legacy/streamlit`. Ahora todo el código productivo es la aplicación de auditoría SEO en Streamlit más el CLI auxiliar.

## Requisitos
- Python 3.10+ (recomendado 3.11)
- OpenAI API Key (para los módulos de IA)
- Acceso opcional a SerpAPI y claves PSI/CrUX si se van a usar esos endpoints

## Puesta en marcha rápida
```bash
make install      # crea .venv e instala dependencias
make run          # lanza streamlit run app.py dentro de la venv
```
> También puedes ejecutar `python -m venv .venv && source .venv/bin/activate` y luego `pip install -r requirements.txt` si prefieres no usar Make.

## Variables de entorno
Define las claves en tu `.env` o directamente en el entorno antes de ejecutar Streamlit:

- `OPENAI_API_KEY` – obligatorio para la generación de planes y resúmenes.
- `OPENAI_MODEL_GENERAL`, `OPENAI_MODEL_COPY` – opcionales (por defecto `gpt-4o-mini`).
- `OPUN_PSI_API_KEY`, `OPUN_CRUX_API_KEY`, `OPUN_GSC_*`, `OPUN_CSE_*`, `OPUN_SAFEBROWSING_API_KEY`, `OPUN_WEBRISK_API_KEY`, `OPUN_KG_API_KEY` – claves usadas por los módulos de datos si quieres conectarte a esos servicios.
- `ENABLE_*` flags en `config.py` permiten apagar selectivamente integraciones externas.

Crea un fichero `.env` en la raíz para que `ai_service.py` lo cargue automáticamente (usa `python-dotenv`).

## CLI legado
El CLI sirve para lanzar un crawl muy simple y exportar issues a CSV.

```bash
make cli                       # usa data/urls.txt (personaliza antes)
python cli.py crawl --max-pages 5
python cli.py export
```

- Edita `data/urls.txt` con una URL por línea (se incluye `https://example.com` como placeholder).
- Los JSON se guardan en `outputs/json/` y los CSV en `outputs/csv/`. Puedes limpiarlos con `make clean`.

## Estructura relevante
```
.
├── app.py               # entrada Streamlit
├── ai_service.py        # helpers para OpenAI
├── audit_*.py           # módulos de auditoría (meta, social, wpo, crawl)
├── ui_components.py     # componentes visuales reutilizables
├── report_builder.py    # HTML para reportes exportables
├── serp_service.py      # integración con SerpAPI
├── utils.py / fetch.py  # red, parsing y helpers
├── assets/              # coloca aquí logos/imágenes opcionales
├── data/urls.txt        # seed para el CLI
├── outputs/             # resultados del CLI (gitkeep)
├── requirements.txt
└── Makefile
```

## Próximos pasos sugeridos
1. Completar las credenciales/API keys necesarias y probar la app con sitios reales.
2. Añadir tests puntuales para los módulos críticos (p. ej. normalización de URLs y cálculo de relevancia de keywords) si se planea evolucionar esta base.
3. Diseñar un plan de refactorización progresiva si se quiere volver a un backend modular, partiendo de estos módulos como fuente de verdad.
