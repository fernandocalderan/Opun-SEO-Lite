# Imagen base ligera con Python 3.11
FROM python:3.11-slim

# Define el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de dependencias
COPY requirements.txt .

# Instala dependencias del proyecto
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código fuente
COPY . .

# Expone el puerto 8000 (por defecto en FastAPI/Streamlit)
EXPOSE 8000

# Comando por defecto (modifícalo según tu framework)
# Si usas FastAPI:
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Si usas Streamlit, reemplaza la línea anterior por:
# CMD ["streamlit", "run", "app.py", "--server.port=8000", "--server.address=0.0.0.0"]
