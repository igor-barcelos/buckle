/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly OPENSEES_SERVER_PATH: string
  // Add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
