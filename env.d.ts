/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    readonly VITE_APP_TITLE: string
    readonly VITE_APP_VERSION: string
    readonly VITE_NODE_ENV: string
    // Add more environment variables as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// Declare module for image imports
declare module '*.png' {
    const src: string
    export default src
}

declare module '*.jpg' {
    const src: string
    export default src
}

declare module '*.jpeg' {
    const src: string
    export default src
}

declare module '*.gif' {
    const src: string
    export default src
}

declare module '*.svg' {
    const src: string
    export default src
}

declare module '*.webp' {
    const src: string
    export default src
}

// Declare Vue components
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

// Specific declaration for Dashboard.vue
declare module '@/layouts/Dashboard.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}