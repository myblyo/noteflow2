# Noteflow2

App de notas, ideas y checklists multiplataforma (iOS, Android y web) con backend REST en Next.js y base de datos PostgreSQL en Neon.

## Características

- **Notas** — texto libre con favoritos y búsqueda
- **Ideas** — tarjetas con color, etiquetas y descripción
- **Checklists** — items con progreso y estado completado
- **Autenticación** — JWT vía API y Firebase Auth
- **Perfil** — avatar e imagen de perfil (S3 en producción)
- **Tema** — claro / oscuro
- **Responsive** — layout adaptado a móvil y escritorio

## Stack

| Capa | Tecnología |
|------|------------|
| App | Expo 56, React Native 0.85, expo-router, Zustand |
| API | Next.js App Router (`noteflow-api/`) |
| Base de datos | Neon PostgreSQL |
| Auth | JWT + Firebase (`@react-native-firebase`) |
| Almacenamiento | AWS S3 (adjuntos e imágenes) |

## Estructura del repositorio

```
noteflow2/
├── app/                 # Pantallas (expo-router)
├── components/          # UI reutilizable
├── lib/                 # Cliente API, auth, Firebase, uploads
├── store/               # Estado global (Zustand)
├── noteflow-api/        # Backend Next.js (puerto 3000)
├── server/              # Scripts SQL y migraciones
├── docs/                # Documentación técnica
├── google-services.json # Firebase Android
└── GoogleService-Info.plist  # Firebase iOS
```

## Requisitos

- Node.js 20+
- Cuenta en [Neon](https://neon.tech)
- Proyecto en [Firebase Console](https://console.firebase.google.com)
- Para build nativo Android: Android Studio, SDK, emulador o dispositivo físico
- (Opcional) Cuenta AWS S3 para subida de imágenes en producción

## Instalación

```bash
git clone <repo-url> noteflow2
cd noteflow2
npm install
npm install --prefix noteflow-api
```

### Variables de entorno

Copia `.env.example` a `.env.local` en la raíz:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
JWT_SECRET=una-clave-larga-y-aleatoria
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Conexión Neon (solo servidor) |
| `JWT_SECRET` | Firma de tokens JWT (solo servidor) |
| `EXPO_PUBLIC_API_URL` | URL base de la API para la app |

Para S3 y Firebase Admin en la API, añade también las variables descritas en `.env.example` y en [`noteflow-api/README.md`](noteflow-api/README.md).

### Base de datos

```bash
npm run db:migrate
npm run db:test   # opcional: verificar conexión
```

### Firebase

Los archivos `google-services.json` y `GoogleService-Info.plist` deben estar en la raíz del proyecto. El plugin ya está configurado en `app.json`:

```json
"plugins": ["expo-router", "@react-native-firebase/app", "@react-native-firebase/auth"]
```

El `android.package` e `ios.bundleIdentifier` deben coincidir con los registrados en Firebase (`com.myblyo.noteflow2`).

## Desarrollo

Abre **dos terminales** en la raíz del proyecto.

**Terminal 1 — API**

```bash
npm run api
```

La API queda en `http://localhost:3000/api`.

**Terminal 2 — App**

```bash
npm start
```

- **Web:** pulsa `w` o abre el enlace en el navegador
- **Expo Go / dev client:** escanea el QR
- **Emulador Android:** pulsa `a` (con emulador encendido)

### URL de la API según plataforma

| Plataforma | URL por defecto |
|------------|-----------------|
| Web | `http://localhost:3000/api` |
| Emulador Android | `http://10.0.2.2:3000/api` |
| Móvil físico (misma WiFi) | IP del PC detectada automáticamente vía Metro |

Puedes forzar la URL con `EXPO_PUBLIC_API_URL` en `.env.local`.

## Build nativo

Requiere prebuild (genera carpetas `android/` e `ios/`):

```bash
npx expo prebuild
npx expo run:android
npx expo run:ios
```

En Windows, si Gradle falla por rutas largas:

```powershell
npm run android:setup-win   # copia el proyecto a C:\nf\noteflow2
npm run android:win         # build desde la ruta corta
```

Asegúrate de tener `ANDROID_HOME` en el PATH y un emulador o dispositivo conectado (`adb devices`).

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Metro / Expo dev server |
| `npm run android` | Build e instala en Android |
| `npm run ios` | Build e instala en iOS |
| `npm run web` | App en navegador |
| `npm run api` | API Next.js en desarrollo |
| `npm run db:migrate` | Aplica el esquema SQL en Neon |
| `npm run db:test` | Prueba la conexión a la base de datos |

## Documentación

- [`noteflow-api/README.md`](noteflow-api/README.md) — endpoints REST, deploy en Vercel
- [`docs/backend-teoria.md`](docs/backend-teoria.md) — arquitectura y modelo de datos
- [`docs/seguridad-api.md`](docs/seguridad-api.md) — JWT, SQL injection, variables de entorno
- [`docs/api-notes.md`](docs/api-notes.md) — ejemplos de respuestas de la API
- [`docs/flujo-subida-imagenes-s3.md`](docs/flujo-subida-imagenes-s3.md) — adjuntos e imágenes

## Despliegue

Necesitas **dos proyectos en Vercel** (o uno para la API y otro para la web):

### 1. API (backend)

1. Importa el repo en [vercel.com/new](https://vercel.com/new).
2. **Root Directory:** `noteflow-api`
3. Variables: `DATABASE_URL`, `JWT_SECRET` (+ S3/Firebase si aplica).
4. Deploy.

### 2. App web (Expo)

1. Crea **otro** proyecto en Vercel con el mismo repo.
2. **Root Directory:** deja la raíz del repo (`.`), no `noteflow-api`.
3. Vercel usará `vercel.json` → `npm run build:web` → carpeta `dist/`.
4. Variable de entorno:
   - `EXPO_PUBLIC_API_URL` = `https://TU-API.vercel.app/api`
5. Deploy.

> No despliegues la raíz sin `build:web`: Vercel podría mostrar código suelto (`index.ts`) en lugar de la app.

- **App móvil (iOS/Android):** builds con [EAS Build](https://docs.expo.dev/build/introduction/) (`eas.json` incluido). En producción usa la misma `EXPO_PUBLIC_API_URL`.

## Licencia

Proyecto privado.
