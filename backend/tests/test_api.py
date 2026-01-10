import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ajouter le répertoire parent au PATH pour importer main
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock des variables d'environnement nécessaires pour main.py
os.environ.setdefault("REACT_APP_PLATFORM_API_URL", "http://test")
os.environ.setdefault("ENVIRONMENT", "test")

from main import app


@pytest.fixture
def client():
    """Fixture pour créer le client de test"""
    return TestClient(app)


class TestAnalysisRoute:
    """Tests pour la route /analysis"""
    
    def test_analysis_calculation(self, client):
        """Test du calcul de surface et volume"""
        test_data = {
            "length": {"value": 10},
            "width": {"value": 5},
            "height": {"value": 2},
            "surface": {"value": 0},
            "volume": {"value": 0}
        }
        
        response = client.post("/api/analysis", json=test_data)
        assert response.status_code == 200
        result = response.json()

        assert isinstance(result["surface"], dict)
        assert result["surface"]["value"] == 50
        assert result["surface"]["unit"]["label"] == "m2"

        assert isinstance(result["volume"], dict)
        assert result["volume"]["value"] == 100
        assert result["volume"]["unit"]["label"] == "m3"
    


class TestHealthRoutes:
    """Tests pour les routes de santé"""
    
    def test_health_endpoint(self, client):
        """Test du endpoint de santé"""
        response = client.get("/health")
        
        assert response.status_code == 200
        result = response.json()
        assert result["status"] == "healthy"
        assert "timestamp" in result
        assert "version" in result
    
    def test_ready_endpoint(self, client):
        """Test du endpoint de disponibilité"""
        response = client.get("/ready")
        
        assert response.status_code == 200
        result = response.json()
        assert result["status"] == "ready"
        assert "timestamp" in result


class TestErrorHandling:
    """Tests pour la gestion d'erreurs"""
    
    def test_invalid_json(self, client):
        """Test avec JSON invalide"""
        response = client.post(
            "/api/analysis", 
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 422  # FastAPI validation error
    
    def test_missing_body(self, client):
        """Test sans body"""
        response = client.post("/api/analysis")
        
        assert response.status_code == 422  # FastAPI validation error