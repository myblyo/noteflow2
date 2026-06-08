# Get started with Neon

Guía para conectar Noteflow con [Neon](https://neon.tech) (PostgreSQL serverless).

---

## 1. Crear proyecto en Neon

1. Entra en [console.neon.tech](https://console.neon.tech).
2. Crea un proyecto (por ejemplo `noteflow`).
3. Copia la **connection string** (usa el **pooler** para serverless).

---

## 2. Configurar variables de entorno

En la raíz del repo, crea `.env.local` (ya está en `.gitignore`):

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
```

Plantilla sin secretos: `.env.example`

```env
DATABASE_URL=
```

Nunca subas `.env.local` ni pegues la connection string en el código.

---

## 3. Probar la conexión

```bash
cd server
npm run db:test
```

Salida esperada:

```
Neon connected successfully
PostgreSQL 16.x ...
```

---

## 4. Crear tablas

```bash
cd server
npm run db:migrate
```

Crea en Neon:

- `notes`
- `ideas`
- `checklists`

El SQL está en `server/sql/schema.sql`.

---

## 5. Arrancar la API

```bash
cd server
npm run dev
```

| URL | Descripción |
|-----|-------------|
| `http://localhost:3001/` | Info de la API |
| `http://localhost:3001/api/health` | Estado + `database: connected` |

---

## Módulo `lib/db.ts`

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const result = params ? await sql.query(text, params) : await sql.query(text);
  return result as T[];
}
```

Usa `sql.query()` para consultas con `$1`, `$2`, etc. No llames `sql("SELECT...")` directamente (Neon 1.x lo bloquea por seguridad).

---

## Siguiente paso

La API sigue usando `server/data/db.json` como almacén temporal. El siguiente paso es migrar las rutas (`/api/notes`, etc.) para leer y escribir en Neon con `query()`.
