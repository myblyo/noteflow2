# Noteflow2

App de notas, ideas y checklists multiplataforma (iOS, Android y web) con backend REST en Next.js y base de datos PostgreSQL en Neon.

## Características

- **Notas** — texto libre con favoritos, búsqueda e imágenes embebidas
- **Ideas** — tarjetas con color, etiquetas y descripción
- **Checklists** — items con progreso y estado completado
- **Autenticación** — JWT en web; Firebase Auth en móvil nativo
- **Perfil** — biografía y foto de perfil (S3 o almacenamiento local)
- **Tema** — claro / oscuro
- **Responsive** — layout adaptado a móvil y escritorio

## Stack

| Capa | Tecnología |
|------|------------|
| App | Expo 56, React Native, expo-router, Zustand |
| API | Next.js App Router (`noteflow-api/`) |
| Base de datos | Neon PostgreSQL |
| Auth web | JWT + bcrypt |
| Auth móvil | Firebase Auth + Firestore (perfil) |
| Imágenes | AWS S3 + proxy `/api/media` (bucket puede ser privado) |

## Estructura del repositorio

```
noteflow2/
├── app/                 # Pantallas (expo-router)
├── components/          # UI reutilizable
├── lib/                 # Cliente API, auth, uploads, mediaUrl
├── store/               # Estado global (Zustand)
├── noteflow-api/        # Backend Next.js (puerto 3000)
├── server/              # Scripts SQL y migraciones (Neon)
├── docs/                # Documentación técnica
├── google-services.json # Firebase Android
└── GoogleService-Info.plist  # Firebase iOS
```

## Requisitos

- Node.js 20+
- Cuenta en [Neon](https://neon.tech)
- Proyecto en [Firebase Console](https://console.firebase.google.com) (solo móvil nativo)
- Cuenta AWS S3 para imágenes en producción (Vercel)
- Android Studio / emulador (opcional, build nativo)

## Instalación

```bash
git clone <repo-url> noteflow2
cd noteflow2
npm install
```

(`postinstall` instala también las dependencias de `noteflow-api`.)

### Variables de entorno

Copia `.env.example` → `.env.local` en la **raíz del repo**:

```env
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
EXPO_PUBLIC_API_URL=http://localhost:3000/api
JWT_SECRET=                          # opcional en local; recomendado en Vercel
AWS_ACCESS_KEY_ID=                   # imágenes (proyecto API)
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-north-1
AWS_S3_BUCKET=noteflow2-images
FIREBASE_PROJECT_ID=noteflow2-18554  # móvil nativo
```

| Variable | Dónde se usa | Obligatoria |
|----------|--------------|-------------|
| `DATABASE_URL` | API (`noteflow-api`) | Sí |
| `EXPO_PUBLIC_API_URL` | App Expo | Sí |
| `JWT_SECRET` | API | Local: no / Vercel: sí |
| `AWS_*` | API (subida y visualización de imágenes) | Vercel: sí |
| `FIREBASE_PROJECT_ID` | API móvil (verificar tokens) | Móvil |

> Los secretos van **solo** en `.env.local` (gitignored). Nunca en `.env.example` ni en el repositorio.

### Base de datos

```bash
npm run db:migrate   # crea tablas en Neon
npm run db:test      # prueba la conexión
```

Guía: [`docs/getting-started-neon.md`](docs/getting-started-neon.md)

### Firebase (móvil nativo)

Archivos en la raíz: `google-services.json`, `GoogleService-Info.plist`.

Guía: [`docs/autenticacion-movil-firebase.md`](docs/autenticacion-movil-firebase.md)

## Desarrollo

Abre **dos terminales** en la raíz:

```bash
# Terminal 1 — API
npm run api

# Terminal 2 — App
npm start
```

| Plataforma | URL de la API |
|------------|---------------|
| Web (navegador) | `http://localhost:3000/api` |
| Emulador Android | `http://10.0.2.2:3000/api` |
| Móvil físico (WiFi) | IP del PC detectada vía Metro |

Configura `EXPO_PUBLIC_API_URL` en `.env.local` si hace falta forzar la URL.

Comprueba la API: `http://localhost:3000/api/health` → `{"ok":true,"db":true}`

## Perfil e imágenes

1. **Perfil** → Cambiar foto de perfil (sube a S3 o almacenamiento local)
2. Editar biografía
3. **Guardar cambios** → persiste `bio` y `avatarUrl` en PostgreSQL (web)
4. La foto se muestra vía `/api/media/avatars/...` (no hace falta bucket S3 público)

Guías: [`docs/configuracion-aws-s3.md`](docs/configuracion-aws-s3.md), [`docs/flujo-subida-imagenes-s3.md`](docs/flujo-subida-imagenes-s3.md)

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Metro / Expo dev server |
| `npm run web` | App en navegador |
| `npm run api` | API Next.js en desarrollo |
| `npm run build:web` | Export estático para Vercel (web) |
| `npm run db:migrate` | Aplica esquema SQL en Neon |
| `npm run db:test` | Prueba conexión a Neon |
| `npm run android` | Build e instala en Android |

## Documentación

Índice completo: [`docs/README.md`](docs/README.md)

- [`docs/autenticacion-movil-firebase.md`](docs/autenticacion-movil-firebase.md)
- [`docs/configuracion-aws-s3.md`](docs/configuracion-aws-s3.md)
- [`docs/flujo-subida-imagenes-s3.md`](docs/flujo-subida-imagenes-s3.md)
- [`noteflow-api/README.md`](noteflow-api/README.md)
- [`docs/backend-teoria.md`](docs/backend-teoria.md)
- [`docs/seguridad-api.md`](docs/seguridad-api.md)
- [`docs/api-notes.md`](docs/api-notes.md)
- [`docs/getting-started-neon.md`](docs/getting-started-neon.md)

## Despliegue en Vercel

Necesitas **dos proyectos** con el mismo repositorio.

### 1. API (backend)

| Campo | Valor |
|-------|--------|
| Root Directory | `noteflow-api` |
| Framework | Next.js |

**Variables de entorno:**

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string Neon (pooler) |
| `JWT_SECRET` | Clave aleatoria (32+ bytes) |
| `AWS_ACCESS_KEY_ID` | IAM con `s3:PutObject` + `s3:GetObject` |
| `AWS_SECRET_ACCESS_KEY` | Secret IAM |
| `AWS_REGION` | Región del bucket |
| `AWS_S3_BUCKET` | Nombre del bucket |

Verifica: `https://TU-API.vercel.app/api/health` → `{"ok":true,"db":true}`

### 2. App web (frontend Expo)

| Campo | Valor |
|-------|--------|
| Root Directory | *(vacío — raíz)* |
| Build Command | `npm run build:web` |
| Output Directory | `dist` |

**Variable de entorno:**

```env
EXPO_PUBLIC_API_URL=https://TU-API.vercel.app/api
```

(`vercel.json` en la raíz ya define build/output.)

> **Importante:** la web llama a la **API**, no a sí misma. Si ves error 405, revisa `EXPO_PUBLIC_API_URL`.

### App móvil (producción)

Builds con [EAS Build](https://docs.expo.dev/build/introduction/). Usa la misma `EXPO_PUBLIC_API_URL` apuntando a la API en Vercel.

## Licencia

Proyecto privado.
