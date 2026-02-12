import type { ModuleOptions } from '@nuxthub/core'

export const hub: ModuleOptions = {
    cache: {
        driver: 'cloudflare-kv-binding',
        namespaceId: '622b3d207e21450db456b09ce3cf34c0',
    },
    db: {
        dialect: 'sqlite',
        driver: 'd1',
        connection: {
            databaseId: '29f5103a-ddac-4821-b783-060504afe479',
        },
    },
}
