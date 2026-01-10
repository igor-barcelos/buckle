from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from bson.objectid import ObjectId
import httpx
import pathlib
import os
import json
from datetime import datetime, timezone
from websockets.exceptions import ConnectionClosed

# Importer le routeur depuis le fichier api.py
from routes.auth import router as auth_router
from auth.dependencies import get_current_user
from models.user import User
from mcp_tools import mcp_server
import mcp_tools
from opensees import run_analysis

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()

app = FastAPI(
    title="SDK Webapp Python",
    description="API pour le SDK Webapp Python",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lambda app: mcp_server.session_manager.run()
)

# Configurer CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Récupération de la variable d'environnement
env_path = pathlib.Path(__file__).parent.parent / '.env'  # Chemin vers .env.development
load_dotenv(dotenv_path=env_path)  # Charger les variables d'environnement
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")


# Chemin vers le dossier build de l'application React
build_dir = os.path.join(os.path.dirname(__file__), '../frontend', 'build')

# Inclure les routeurs
app.include_router(auth_router)

# En mode développement, rediriger les requêtes frontend vers le serveur React
@app.middleware("http")
async def proxy_middleware(request: Request, call_next):
    if ENVIRONMENT == "development" and not request.url.path.startswith("/api") and not request.url.path.startswith("/mcp"):
        # Vérifier si la requête est destinée au frontend
        if (request.url.path.startswith("/static") or 
            request.url.path == "/" or 
            request.url.path.startswith("/applications")):
            # Rediriger vers le serveur de développement React
            async with httpx.AsyncClient() as client:
                try:
                    url = f"http://localhost:3000{request.url.path}"
                    if request.url.query:
                        url = f"{url}?{request.url.query}"
                    
                    # Copier les en-têtes de la requête
                    headers = dict(request.headers)
                    headers.pop("host", None)
                    # Supprimer les en-têtes de compression qui peuvent causer des problèmes
                    headers.pop("accept-encoding", None)
                    
                    # Rediriger la requête
                    method = request.method
                    if method == "GET":
                        response = await client.get(url, headers=headers, follow_redirects=True)
                    elif method == "POST":
                        body = await request.body()
                        response = await client.post(url, content=body, headers=headers, follow_redirects=True)
                    else:
                        # Méthodes supplémentaires si nécessaire
                        return await call_next(request)
                    
                    # Préparer les en-têtes pour la réponse, en excluant content-encoding
                    response_headers = dict(response.headers)
                    response_headers.pop("content-encoding", None)
                    response_headers.pop("transfer-encoding", None)
                    
                    # Retourner la réponse du serveur React
                    return HTMLResponse(
                        content=response.content,
                        status_code=response.status_code,
                        headers=response_headers
                    )
                except httpx.RequestError as e:
                    # Si le serveur React n'est pas disponible, continuer avec le serveur FastAPI
                    print(f"Erreur de proxy: {e}")
                    pass
    
    # Si ce n'est pas une requête pour le frontend ou si le serveur React n'est pas disponible
    return await call_next(request)

# Serve the static files from the React build directory only in production
if ENVIRONMENT != "development":
    app.mount("/static", StaticFiles(directory=os.path.join(build_dir, 'static')), name="static")
    
    @app.get("/")
    async def read_index():
        return FileResponse(os.path.join(build_dir, 'index.html'))
        
    @app.get("/applications/{applicationId}")
    async def read_application(applicationId: str):
        return FileResponse(os.path.join(build_dir, 'index.html'))
    
    @app.get("/applications/{applicationId}/models/{modelId}")
    async def read_application_model(applicationId: str, modelId: str):
        return FileResponse(os.path.join(build_dir, 'index.html'))

@app.get("/remoteEntry.js")
async def read_remote_entry():
    if ENVIRONMENT != "development":
        return FileResponse(os.path.join(build_dir, 'remoteEntry.js'))
    else:
        # En développement, proxy vers le serveur React
        async with httpx.AsyncClient() as client:
            try:
                url = "http://localhost:3000/remoteEntry.js"
                response = await client.get(url, follow_redirects=True)
                return HTMLResponse(
                    content=response.content,
                    status_code=response.status_code,
                    headers={k: v for k, v in response.headers.items() 
                             if k.lower() not in ("content-encoding", "transfer-encoding")}
                )
            except httpx.RequestError:
                return HTMLResponse(content="Error loading remoteEntry.js", status_code=500)


@app.get("/health")
async def health_check():
    """Endpoint de vérification de santé pour Kubernetes"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }

@app.get("/ready")
async def readiness_check():
    """Endpoint de vérification de disponibilité pour Kubernetes"""
    # Vous pouvez ajouter ici des vérifications de base de données, etc.
    return {
        "status": "ready",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/benchmarks")
async def get_benchmarks():
  benchmarks_dir = pathlib.Path(__file__).parent / "tests" / "benchmarks"
  benchmarks = []
  for json_file in benchmarks_dir.glob("*.json"):
    try:
      with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        # Extract only the metadata field
        if "metadata" in data:
          benchmarks.append(data["metadata"])
    except (json.JSONDecodeError, IOError) as e:
      # Skip files that can't be read or parsed
      print(f"Error reading benchmark file {json_file}: {e}")
      continue
  
  return benchmarks

@app.get("/benchmark/{id}")
async def get_benchmark(id: str):
  benchmarks_dir = pathlib.Path(__file__).parent / "tests" / "benchmarks"
  
  for json_file in benchmarks_dir.glob("*.json"):
    try:
      with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        if "metadata" in data and data["metadata"].get("id") == id:
          return data
    except (json.JSONDecodeError, IOError) as e:
      print(f"Error reading benchmark file {json_file}: {e}")
      continue
  raise HTTPException(status_code=404, detail=f"Benchmark with id '{id}' not found")

@app.post("/analysis")
async def get_analysis(model : dict):
  try :
    output = run_analysis(model)
    return {
      "status": "Analysis completed successfully",
      "output": output
    }
    
  except Exception as e:
    print('ERROR: ', e)
    raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
  await manager.connect(websocket)
  mcp_tools.client_connection = websocket
  try:
    while True:
      data = await websocket.receive_text() 
      message = json.loads(data)
      mcp_tools.messages.append(message)
  
  except WebSocketDisconnect:
    manager.disconnect(websocket)
    await manager.broadcast(f"Client #{client_id} left the chat")
  
  except Exception as e:
    print(f"WebSocket error: {e}") 


app.mount("/", mcp_server.streamable_http_app())

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)