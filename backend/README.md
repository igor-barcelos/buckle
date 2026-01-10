# Backend - API FastAPI

Ce dossier contient l'API backend développée avec FastAPI pour traiter les calculs et fournir les données au frontend.

## Architecture

```
backend/
├── main.py                 # Point d'entrée de l'application FastAPI
├── api.py                  # Routes API et endpoints
├── mcp_tools.py           # Outils MCP pour les calculs
├── utils/                 # Modules utilitaires
│   └── calculations.py    # Fonctions de calcul métier
├── tests/                 # Tests unitaires
│   ├── __init__.py
│   └── test_api.py       # Tests des routes API
├── requirements.txt       # Dépendances Python
└── pytest.ini           # Configuration pytest
```

## Installation et lancement

### 1. Environnement virtuel

```bash
python3 -m venv env
source env/bin/activate  # Windows: .\env\Scripts\activate
```

### 2. Installation des dépendances

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Lancement du serveur

```bash
python3 main.py
```

Le serveur sera accessible sur `http://localhost:8000`

## API Endpoints

### POST /api/analysis

Endpoint principal pour traiter les données de calcul.

**Corps de la requête** : Objet JSON contenant les paramètres à traiter
**Réponse** : Objet JSON avec les valeurs calculées mises à jour

### GET /health

Endpoint de vérification de santé pour le monitoring

### GET /ready

Endpoint de vérification de disponibilité pour Kubernetes

## Documentation API

La documentation interactive est disponible sur :
- Swagger UI : `http://localhost:8000/docs`
- ReDoc : `http://localhost:8000/redoc`

## Tests

### Lancement des tests

```bash
# Tests basiques
python -m pytest tests/ --verbose

# Tests avec couverture
python -m pytest tests/ --cov=. --cov-report=term-missing --verbose

# Tests d'un fichier spécifique
python -m pytest tests/test_api.py --verbose
```

### Structure des tests

- `tests/test_api.py` : Tests des routes API
- Configuration pytest dans `pytest.ini`

## Développement

### Ajouter une nouvelle fonction de calcul

1. Implémenter la logique dans `utils/calculations.py`
2. Ajouter les tests dans `tests/`
3. Mettre à jour la route dans `api.py` si nécessaire

### Ajouter une nouvelle route API

1. Définir la route dans `api.py`
2. Écrire les tests correspondants
3. Documenter avec des docstrings

## Configuration

### Variables d'environnement

- `ENVIRONMENT` : Mode d'exécution (development/production)
- Variables de configuration dans `.env` à la racine du projet

### Mode développement

En mode développement, le serveur se lance avec :
- Rechargement automatique (`reload=True`)
- CORS configuré pour accepter toutes les origines
- Proxy vers le frontend React sur le port 3000

## Déploiement

Le backend est conteneurisé via Docker et déployé automatiquement via GitLab CI/CD sur Google Kubernetes Engine.

### Santé de l'application

- `/health` : Vérification basique de l'état du serveur
- `/ready` : Vérification de disponibilité pour Kubernetes

## Dépendances principales

- **FastAPI** : Framework web moderne et rapide
- **Uvicorn** : Serveur ASGI pour FastAPI
- **pytest** : Framework de tests
- **httpx** : Client HTTP pour les tests
- **python-dotenv** : Gestion des variables d'environnement