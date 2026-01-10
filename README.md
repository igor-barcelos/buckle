# Buckle

Finite element analysis web application for 3D structural frame modeling and analysis.

## Tutorial

Learn how to use Buckle :

- [01 - Frame Analysis](https://youtu.be/WKQdDsRB_pE)

## Tech Stack

### Frontend
- **React 18**
- **TypeScript**
- **Vite**
- **Three.js**
- **Material-UI (MUI)**
- **MobX**

### Backend
- **FastAPI**
- **OpenSeesPy**
- **MongoDB** 
- **Pydantic**

## Project Organization

The project is organized into two main directories:

```
buckle/
├── frontend/          # React TypeScript frontend application
│   ├── src/
│   │   ├── model/     # Core model system (Three.js scene, elements, state)
│   │   ├── ui/        # UI components (Layout, Model dialogs, Results)
│   │   ├── pages/     # Application pages
│   │   ├── components/# Reusable UI components
│   │   └── types.ts   # TypeScript type definitions
│   ├── public/        # Static assets and examples
│   └── package.json   # Frontend dependencies
│
├── backend/           # FastAPI Python backend
│   ├── main.py        # FastAPI application entry point
│   ├── opensees/      # OpenSees analysis integration
│   ├── routes/        # API route handlers
│   ├── models/        # Data models
│   ├── schemas/       # Pydantic schemas
│   ├── tests/         # Test suite
│   └── requirements.txt # Python dependencies
│
└── README.md          # This file
```

### Frontend Architecture

#### Core Model System
The frontend uses a centralized `Model` class (`src/model/Model.ts`) that manages:
- Three.js scene, renderer, and camera
- Collections of structural elements (nodes, members, boundary conditions, loads)
- Interactive tools (selector, snapper, line drawing)
- Visualization components (grid helper, labeler, post-processing)

#### Element System
Structural elements inherit from base classes and manage their own Three.js geometry:
- **Node**: Point elements in 3D space
- **ElasticBeamColumn**: Frame members connecting two nodes
- **BoundaryCondition**: Constraints on node degrees of freedom
- **Load**: Forces applied to nodes or members

#### UI Components
The UI is organized into:
- **Layout**: Main application shell (TopBar, LeftBar, StatusBar)
- **Model UI**: Dialogs for adding/editing structural elements
- **Results UI**: Post-processing visualization (diagrams, displacements, reactions)
- **Draw UI**: Interactive drawing tools

### Backend Architecture

#### API Routes
- `/analysis` - Run FEA analysis on structural models
- `/health` - Health check endpoint
- `/ready` - Readiness check for Kubernetes
- `/benchmarks` - Retrieve benchmark models
- `/ws/{client_id}` - WebSocket endpoint for real-time communication (not used at the moment)

#### Analysis Engine
The backend integrates with OpenSeesPy for finite element analysis, supporting:
- Linear static analysis
- Various section types (rectangular, circular, I-sections, etc.)
- Elastic materials
- Multiple load types (nodal and distributed loads)

## Installation

### Prerequisites

- **Node.js** (v18 or higher) and npm
- **Python** (v3.12 or higher)
- **MongoDB** (optional, for user authentication features)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in the terminal).

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
# Windows
python -m venv env
.\env\Scripts\activate

# macOS/Linux
python3 -m venv env
source env/bin/activate
```

3. Install dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

4. Start the backend server:
```bash
python main.py
```

The backend API will be available at `http://localhost:8000`.

5. Access API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Development

### Frontend Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Support

For issues, questions, or contributions, please refer to the project repository or contact the maintainers.

