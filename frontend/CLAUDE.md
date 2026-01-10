# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Buckle UI is a finite element analysis (FEA) frontend application built with React, TypeScript, Three.js, and Vite. It provides a 3D structural modeling interface for creating and analyzing structural frames, including nodes, members (beams/columns), boundary conditions, and loads. The application communicates with a backend solver via a FastAPI server.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
tsc && vite build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Core Model System

The application uses a centralized `Model` class (`src/model/Model.ts`) that manages the entire 3D scene and structural model state. This class is observable using MobX and is provided to the React component tree via the `AppContext` (`src/model/Context.ts`).

**Key responsibilities of the Model class:**
- Three.js scene, renderer, camera management
- Collections of structural elements (nodes, members, boundary conditions, loads)
- Interactive tools (selector, snapper, line drawing tool)
- Visualization components (grid helper, labeler, post-processing)


### Element System

Structural elements inherit from base classes and are responsible for their own Three.js geometry creation and lifecycle:

- **Node** (`src/model/Elements/Node/Node.ts`): Point elements in 3D space
- **ElasticBeamColumn** (`src/model/Elements/ElasticBeamColumn/ElasticBeamColumn.ts`): Frame members connecting two nodes
- **BoundaryCondition** (`src/model/BoundaryCondition/BoundaryCondition.ts`): Constraints on node degrees of freedom (dx, dy, dz, rx, ry, rz)
- **Load** (`src/model/Load/Load.ts`): Forces applied to nodes or members

Each element typically has:
- An `id` property for tracking
- A reference to the `Model` instance
- `create()` or `createOrUpdate()` methods for adding to scene
- `dispose()` or `delete()` methods for cleanup
- Visual representation using Three.js meshes

### Layer System

The application uses Three.js layers to manage visibility at different building levels. The `levels` array defines floor elevations, and the `layer` property on the Model tracks the current active level. The `worldPlane` is adjusted when switching levels to constrain drawing operations to the current elevation.

### UI Architecture

The UI uses Material-UI (MUI) components with a dark theme and is organized into:

- **Layout**: Main application shell with TopBar, LeftBar, StatusBar (`src/ui/Layout/`)
- **Model UI**: Dialogs for adding/editing nodes, members, sections, materials, boundary conditions, loads (`src/ui/Model/`)
- **Results UI**: Post-processing visualization (diagrams, displacements, reactions) (`src/ui/Results/`)
- **Draw UI**: Tools for interactive drawing (`src/ui/Draw/`)

Components access the model via the `useModel()` or `useAppContext()` hooks defined in `src/model/Context.ts`.


### Import/Export System

Helper functions in `src/helpers.ts` handle model serialization:

- `exportModelJson(model)`: Converts model state to JSON
- `buildModelOnjson(model, path)`: Loads model from JSON file, clearing existing state first

## Type System

The `src/types.ts` file defines all structural types:

- **Sections**: `RectangularSection`, `CircularSection`, `HollowCircularSection`, `ISection`
- **Materials**: `ElasticIsotropicMaterial` with Young's modulus (E), Poisson's ratio (nu)
- **Loads**: `NodalLoad` (point forces), `LinearLoad` (distributed forces on members)
- Mock data is provided: `mockMaterials`, `mockSections`, `mockLevels`

## Coordinate System

The application uses a right-handed coordinate system with Three.js conventions, but the viewport gizmo swaps Y and Z labels to match typical structural engineering conventions (Z-up). The `worldPlane` normal is `(0, 1, 0)` in Three.js space.

## State Management

MobX is used for reactive state management on the Model class. When model properties change, React components that observe them automatically re-render via `mobx-react-lite`.

## Key Patterns

1. **Element Creation**: Elements are instantiated, given a reference to the model, then `create()` is called to add them to the scene and relevant collections.

2. **Disposal**: Always call `dispose()` or similar cleanup methods when removing elements to prevent memory leaks from Three.js geometries and materials.

3. **Snapper**: The `Snapper` class provides snap-to-grid and snap-to-endpoint functionality during interactive drawing operations.

4. **Selector**: The `Selector` class handles raycasting and selection of elements in the 3D view.

5. **Labeler**: The `Labeler` class manages CSS2D labels for annotating elements (loads, efforts, dimensions).

## Important Notes

- The Model instance is created once in `src/pages/viewer/index.tsx` and properly disposed on unmount.
- Three.js objects should be managed through the Model class, not created independently.
- When adding new element types, follow the existing pattern of having create/dispose methods and maintaining references in Model collections.
- The application expects strict TypeScript mode with `noUnusedLocals` and `noUnusedParameters` disabled.
