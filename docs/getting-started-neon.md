# Get started with Neon

Guía para conectar Noteflow con [Neon](https://neon.tech) (PostgreSQL serverless).

La API principal está en **`noteflow-api/`** (Next.js, puerto 3000). La carpeta **`server/`** contiene scripts de migración y prueba de conexión.

---

## 1. Crear proyecto en Neon

1. [console.neon.tech](https://console.neon.tech)
2. Crea un proyecto (p. ej. `noteflow`)
3. **Connect** → copia la connection string del **pooler** (termina en `-pooler...`)

Ejemplo:

```text
postgresql://neondb_owner:****@ep-xxxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## 2. Configurar `.env.local`

En la **raíz del repo** (no en `.env.example`):

```env
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

> Usa la URL **real** de Neon. El placeholder `@HOST` de la documentación provoca `ENOTFOUND host`.

La API carga este archivo desde `noteflow-api/lib/load-env.ts` y `noteflow-api/next.config.ts`.

---

## 3. Probar la conexión

Desde la raíz del monorepo:

```bash
npm run db:test
```

Salida esperada:

```text
Neon connected successfully
PostgreSQL 16.x ...
```

---

## 4. Crear tablas

```bash
npm run db:migrate
```

Aplica `server/sql/schema.sql` en Neon:

- `users` (con `name`, `bio`, `avatar_url`, `firebase_uid`)
- `notes`, `note_tags`, `checklist_items`, `note_attachments`, …

La API también aplica parches incrementales al arrancar (`noteflow-api/lib/db.ts`).

---

## 5. Arrancar la API

```bash
npm run api
```

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000/api` | Info del servicio |
| `http://localhost:3000/api/health` | `{"ok":true,"db":true}` |

---

## Módulo `noteflow-api/lib/db.ts`

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = params
    ? await sql.query(text, params)
    : await sql.query(text);
  return result as T[];
}
```

**Importante (Neon 1.x):** usa `sql.query(text, params)`. No llames `sql("SELECT...")` directamente.

---

## Vercel

En el proyecto **API** (Root Directory `noteflow-api`):

```env
DATABASE_URL=postgresql://...@ep-xxxx-pooler.../neondb?sslmode=require
```

Usa siempre el endpoint **pooler** para serverless.

---

## Siguiente paso

- Registrar usuario: `POST /api/auth/register`
- Documentación API: [`noteflow-api/README.md`](../noteflow-api/README.md)
- Seguridad: [`seguridad-api.md`](./seguridad-api.md)
