# Noteflow API

Backend REST de **Noteflow** construido con **Next.js App Router**, **Neon PostgreSQL** y autenticación **JWT**.

## Descripción

La API persiste notas, ideas y checklists en una tabla unificada `notes`, con etiquetas (`note_tags`) e items de checklist (`checklist_items`) relacionados por clave foránea y `ON DELETE CASCADE`.

Todos los endpoints de notas requieren autenticación mediante `Authorization: Bearer <token>`.

---

## Setup paso a paso

### 1. Requisitos

- Node.js 20+
- Cuenta en [Neon](https://neon.tech) con un proyecto PostgreSQL
- (Producción) Cuenta en [Vercel](https://vercel.com)

### 2. Instalar dependencias

```bash
cd noteflow-api
npm install
```

### 3. Variables de entorno

Copia la plantilla y rellena los valores en `.env.local` en la **raíz del monorepo** (`noteflow2/.env.local`) o en `noteflow-api/.env.local`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
JWT_SECRET=una-clave-larga-y-aleatoria
```

| Variable | Dónde | Descripción |
|----------|-------|-------------|
| `DATABASE_URL` | Solo servidor | Connection string de Neon |
| `JWT_SECRET` | Solo servidor | Firma de tokens JWT (mín. 32 caracteres en producción) |

### 4. Migrar el esquema

Desde la raíz del monorepo:

```bash
npm run db:migrate
```

Crea las tablas `users`, `notes`, `note_tags`, `checklist_items`, etc.

### 5. Arrancar en desarrollo

```bash
cd noteflow-api
npm run dev
```

API local: `http://localhost:3000/api`

### 6. Desplegar en Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. Establece **Root Directory** en `noteflow-api`.
3. En **Environment Variables** añade:
   - `DATABASE_URL` — connection string de Neon (usa el **pooler**)
   - `JWT_SECRET` — clave secreta para JWT
4. Deploy.

Verifica tras el deploy:

```bash
curl https://TU-PROYECTO.vercel.app/api
curl -X POST https://TU-PROYECTO.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"secret12"}'
```

Actualiza la app Expo:

```env
EXPO_PUBLIC_API_URL=https://TU-PROYECTO.vercel.app/api
```

---

## Endpoints

Cabecera común para rutas protegidas:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### `GET /api`

**Auth:** no

**Respuesta `200`:**

```json
{
  "service": "noteflow-api",
  "status": "ok",
  "endpoints": { ... }
}
```

---

### `POST /api/auth/register`

**Auth:** no

**Body:**

```json
{
  "name": "María",
  "email": "maria@example.com",
  "password": "secret12"
}
```

**Respuesta `201`:**

```json
{
  "token": "eyJhbG...",
  "user": { "id": "uuid", "email": "maria@example.com", "name": "María" }
}
```

**Errores:** `400` validación, `409` email duplicado

---

### `POST /api/auth/login`

**Auth:** no

**Body:**

```json
{
  "email": "maria@example.com",
  "password": "secret12"
}
```

**Respuesta `200`:**

```json
{
  "token": "eyJhbG...",
  "user": { "id": "uuid", "email": "maria@example.com", "name": "María" }
}
```

**Errores:** `400` validación, `401` credenciales incorrectas

---

### `GET /api/notes`

**Auth:** sí

**Respuesta `200`:** array de notas del usuario (sin expandir tags/items en listado)

---

### `POST /api/notes`

**Auth:** sí

**Body:**

```json
{
  "title": "Mi nota",
  "type": "note",
  "content": "Texto opcional",
  "color": "#6366F1",
  "tags": ["backend"],
  "items": [{ "task": "Tarea", "is_completed": false }]
}
```

`type`: `"note"` | `"checklist"` | `"idea"`

**Respuesta `201`:** nota creada con `tags` e `items` si aplica

---

### `GET /api/notes/:id`

**Auth:** sí

**Respuesta `200`:** nota con `tags` e `items`

**Errores:** `404` no encontrada o de otro usuario

---

### `PATCH /api/notes/:id`

**Auth:** sí

**Body (parcial):**

```json
{
  "title": "Nuevo título",
  "is_favorite": true,
  "tags": ["docs"],
  "items": [{ "task": "Hecho", "is_completed": true }]
}
```

**Respuesta `200`:** nota actualizada

---

### `DELETE /api/notes/:id`

**Auth:** sí

**Respuesta `204`:** sin body (cascade borra tags e items)

---

### `GET /api/notes/:id/checklist-items`

**Auth:** sí

**Respuesta `200`:** array de items

---

### `POST /api/notes/:id/checklist-items`

**Auth:** sí

**Body:**

```json
{ "task": "Nueva tarea", "is_completed": false }
```

**Respuesta `201`:** item creado

---

### `PATCH /api/checklist-items/:itemId`

**Auth:** sí

**Body:** vacío (toggle) o `{ "is_completed": true }`

**Respuesta `200`:** item actualizado

---

### `DELETE /api/checklist-items/:itemId`

**Auth:** sí

**Respuesta `204`:** sin body

---

## Estructura del proyecto

```
noteflow-api/
  app/api/          # Route Handlers
  lib/
    db.ts           # Conexión Neon
    auth.ts         # JWT + bcrypt
    require-auth.ts # Middleware de autenticación
    notes.ts        # Lógica de notas
  requests/         # Colección HTTP (IDE)
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |

## Documentación relacionada

- `../docs/backend-teoria.md` — arquitectura, REST, SQL, JOINs
- `../docs/seguridad-api.md` — SQL injection, env vars, JWT
- `../docs/api-notes.md` — respuestas reales capturadas en pruebas
