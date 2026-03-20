# Frontend Architecture (Nuxt, Vue & Nuxt UI)
- The frontend lives inside the `app/` directory (`app/pages/`, `app/components/`, `app/layouts/`).
- Use Vue Composition API exclusively with `<script setup lang="ts">`.
- Do not use the Options API.
- Use Nuxt's auto-imports for components, composables, and Vue APIs (e.g., `ref`, `computed`, `watch`).

# UI Components & Styling (Nuxt UI)
- **CRITICAL**: Maximize the use of Nuxt UI (`@nuxt/ui`) components for all interface elements (e.g., `<UButton>`, `<UCard>`, `<UTable>`, `<UForm>`, `<UIcon>`).
- Do not build custom components from scratch (like modals, dropdowns, or tables) or write custom CSS if a Nuxt UI equivalent exists.
- For layout, spacing, and responsive design, exclusively use Tailwind CSS utility classes. Nuxt UI is built on Tailwind, so they integrate seamlessly.
- Use the built-in Nuxt UI icons (`<UIcon name="i-heroicons-...">`) instead of loading external SVGs manually.
- Utilize Nuxt UI's composables like `useToast()` for notifications or `useColorMode()` for theme handling.

# State Management & Data Fetching
- Use `useFetch` or `useAsyncData` for SSR-friendly data fetching from the internal Nitro API.
- Keep state local whenever possible. If global state is needed, use `useState`.

# Documentation & MCP Tools
- You have access to Model Context Protocol (MCP) servers for Nuxt (`nuxt-docs`) and Nuxt UI (`nuxt-ui`).
- If you are unsure about the latest Nuxt features, syntax, or specific Nuxt UI component props, ALWAYS use these MCP tools to query the official documentation before generating code. Do not guess component APIs.