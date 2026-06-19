# Scripts SQL y migraciones (`server/`)

Esta carpeta contiene **scripts de base de datos** para Neon PostgreSQL. **No** es la API en producción.

| Componente | Ubicación | Puerto |
|----------|-----------|--------|
| **API REST (producción)** | `noteflow-api/` | 3000 |
| **Scripts SQL (este folder)** | `server/` | — |

---

## Comandos (desde la raíz del monorepo)

```bash
npm run db:migrate   # Aplica server/sql/schema.sql en Neon
npm run db:test      # Prueba conexión (DATABASE_URL en .env.local)
```

Equivalente manual:

```bash
cd server
npm run db:migrate
npm run db:test
```

---

## Configuración

`DATABASE_URL` en `.env.local` de la **raíz del repo**.

`server/src/loadEnv.ts` carga:

1. `../../.env.local` (raíz)
2. `../.env` (server)

---

## Esquema

Archivo principal: `server/sql/schema.sql`

Tablas principales:

- `users` — email, password_hash, name, bio, avatar_url, firebase_uid
- `notes` — notas, ideas, checklists unificadas (`type`)
- `note_tags`, `checklist_items`, `note_attachments`

---

## Módulo de conexión

`server/src/lib/db.ts` — mismo patrón que `noteflow-api/lib/db.ts`:

```typescript
await sql.query("SELECT * FROM users WHERE id = $1", [userId]);
```

---

## Nota histórica

Existió un servidor Express en `server/` (`server/src/index.ts`, puerto 3001, `db.json`). La app actual usa **`noteflow-api`** (Next.js). Estos scripts se mantienen para migraciones y pruebas de Neon.

Documentación API: [`noteflow-api/README.md`](../noteflow-api/README.md)
