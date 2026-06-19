# Noteflow API

Backend REST de **Noteflow** — **Next.js App Router**, **Neon PostgreSQL**, autenticación **JWT** (web) y **Firebase** (móvil).

Persiste notas, ideas y checklists en la tabla `notes`, con `note_tags`, `checklist_items` y `note_attachments`. Imágenes en **AWS S3** (o disco local en dev) servidas vía **`GET /api/media/...`**.

---

## Setup

### Requisitos

- Node.js 20+
- Proyecto [Neon](https://neon.tech)
- (Producción) [Vercel](https://vercel.com) + AWS S3

### Instalación

Desde la raíz del monorepo:

```bash
npm install
npm run db:migrate
npm run api
```

API local: `http://localhost:3000/api`

### Variables de entorno

Archivo **`.env.local` en la raíz del monorepo** (`noteflow2/.env.local`):

```env
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=clave-aleatoria-32-bytes-minimo
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-north-1
AWS_S3_BUCKET=noteflow2-images
FIREBASE_PROJECT_ID=noteflow2-18554
```

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string Neon (**pooler**) |
| `JWT_SECRET` | Firma JWT; fallback dev si falta |
| `AWS_*` | Subida y lectura S3; omitir en dev local → disco |
| `FIREBASE_PROJECT_ID` | Verificar tokens Firebase (móvil) |

Carga: `lib/load-env.ts`, `next.config.ts`.

### Health check

```bash
curl http://localhost:3000/api/health
# {"ok":true,"db":true}
```

---

## Despliegue en Vercel

1. [vercel.com/new](https://vercel.com/new) → mismo repo
2. **Root Directory:** `noteflow-api`
3. Variables: `DATABASE_URL`, `JWT_SECRET`, `AWS_*`
4. Deploy → verifica `/api/health`

App web (otro proyecto Vercel, raíz del repo):

```env
EXPO_PUBLIC_API_URL=https://TU-API.vercel.app/api
```

---

## Autenticación

Cabecera en rutas protegidas:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

| Plataforma | Token |
|------------|-------|
| Web | JWT de `/api/auth/login` |
| Móvil | Firebase ID Token |

---

## Endpoints principales

### Sistema

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api` | No | Info del servicio |
| `GET` | `/api/health` | No | Estado + conexión DB |

### Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | No | Registro → `{ token, user }` |
| `POST` | `/api/auth/login` | No | Login → `{ token, user }` |
| `GET` | `/api/auth/me` | Sí | Perfil actual |
| `PATCH` | `/api/auth/me` | Sí | Actualizar `{ bio?, avatarUrl? }` |

**Respuesta user:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Nombre",
  "bio": "Mi bio",
  "avatarUrl": "https://api.example.com/api/media/avatars/userId/file.jpg"
}
```

### Imágenes

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/uploads/direct` | Sí | Subida multipart (web) |
| `POST` | `/api/uploads/presign` | Sí | Presigned URL (móvil) |
| `GET` | `/api/media/[...path]` | No | Proxy S3 / disco local |

### Notas

| Método | Ruta | Auth |
|--------|------|------|
| `GET` | `/api/notes` | Sí |
| `POST` | `/api/notes` | Sí |
| `GET` | `/api/notes/:id` | Sí |
| `PATCH` | `/api/notes/:id` | Sí |
| `DELETE` | `/api/notes/:id` | Sí |
| `GET/POST` | `/api/notes/:id/attachments` | Sí |
| `GET/POST` | `/api/notes/:id/checklist-items` | Sí |
| `PATCH/DELETE` | `/api/checklist-items/:itemId` | Sí |

Detalle y ejemplos JSON: [`../docs/api-notes.md`](../docs/api-notes.md)

---

## Estructura

```
noteflow-api/
  app/api/              # Route Handlers
  lib/
    db.ts               # Neon (sql.query)
    load-env.ts         # Carga .env.local monorepo
    auth.ts             # JWT + bcrypt
    s3.ts               # S3 put/get/presign
    media-url.ts        # buildPublicMediaUrl()
    require-auth.ts     # JWT / Firebase
    notes.ts            # Lógica de notas
  requests/             # Colección HTTP (IDE)
```

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo (puerto 3000) |
| `npm run build` | Build producción |
| `npm run start` | Servidor producción |

Desde la raíz: `npm run api` equivale a `npm run dev --prefix noteflow-api`.

---

## Documentación

- [`../docs/configuracion-aws-s3.md`](../docs/configuracion-aws-s3.md)
- [`../docs/flujo-subida-imagenes-s3.md`](../docs/flujo-subida-imagenes-s3.md)
- [`../docs/seguridad-api.md`](../docs/seguridad-api.md)
- [`../docs/backend-teoria.md`](../docs/backend-teoria.md)
