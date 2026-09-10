/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_IDENTIFY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
