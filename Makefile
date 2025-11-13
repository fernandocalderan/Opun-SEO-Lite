PYTHON ?= python3
VENV ?= .venv
BIN := $(VENV)/bin

.PHONY: install run cli clean

install:
	$(PYTHON) -m venv $(VENV)
	$(BIN)/pip install --upgrade pip
	$(BIN)/pip install -r requirements.txt

run:
	$(BIN)/streamlit run app.py

cli:
	$(BIN)/python cli.py crawl

clean:
	rm -f outputs/json/*.json outputs/csv/*.csv
