# Backend Architecture (Nuxt Nitro)
- The backend lives inside the `server/` directory (`server/api/`, `server/utils/`).
- All API routes must use `defineEventHandler`.
- The backend acts as a BFF (Backend-for-Frontend) and communicates with external DHB (Deutscher Handballbund) services.

# Data Handling & API Rules
- Always validate incoming query parameters and request bodies.
- Use the utility functions in `server/utils/` (like `dhbUtils.ts` and `dhbPlayerUtils.ts`) to parse and transform the raw external data.
- Ensure proper error handling using `createError()` to send meaningful HTTP status codes to the frontend.

# Server Build & Nitro Configuration
- The Nitro server engine is configured for Cloudflare deployments.
- When suggesting changes to `nuxt.config.ts` or server API routes, keep the Cloudflare preset (e.g., `cloudflare-pages`) and its specific routing/caching behaviors in mind.
- Prefer Cloudflare KV, D1, or external APIs for storage instead of local file operations.

# Documentation & MCP Tools
- You have access to the Model Context Protocol (MCP) server for Nuxt (`nuxt-docs`).
- **CRITICAL**: Use this MCP tool to query the official Nuxt/Nitro documentation whenever you are working on server API routes (`server/api/`), server utilities, or storage/caching configurations.
- Since the deployment targets Cloudflare Edge, always use the `nuxt-docs` MCP server to verify if a specific Nitro feature or built-in function is fully supported in an edge environment before implementing it.