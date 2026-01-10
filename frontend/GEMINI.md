# Project Overview

This is a web-based Finite Element Method (FEM) application for structural analysis. It allows users to create, visualize, and analyze 3D structural models. The application is built with a modern web stack, including:

*   **Frontend:** React, TypeScript
*   **3D Graphics:** Three.js
*   **UI Components:** Material-UI (MUI)
*   **State Management:** MobX
*   **Build Tool:** Vite

The core of the application is the `Model` class (`src/model/Model.ts`), which manages the 3D scene, all structural elements (nodes, members, loads, etc.), and the various tools for interacting with the model.

# Building and Running

*   **Install Dependencies:**
    ```bash
    npm install
    ```
*   **Run Development Server:**
    ```bash
    npm run dev
    ```
*   **Build for Production:**
    ```bash
    npm run build
    ```
*   **Lint the Code:**
    ```bash
    npm run lint
    ```
*   **Preview Production Build:**
    ```bash
    npm run preview
    ```

# Development Conventions

*   **Component-Based Architecture:** The UI is built with React components, primarily located in `src/ui` and `src/pages`.
*   **Styling:** The application uses Material-UI for UI components and styling. A custom dark theme is defined in `src/App.tsx`.
*   **State Management:** MobX is used for managing the application state, with the central `Model` class being observable.
*   **3D Model:** The 3D visualization is handled by the `three.js` library. The main `Model` class in `src/model/Model.ts` encapsulates all the `three.js` logic.
*   **FEM Core:** The application's logic for FEM analysis seems to be handled by a combination of the frontend code and a backend service (as suggested by the `axios` dependency and the `runAnalysis` function in `src/ui/Model/Model.jsx`).
