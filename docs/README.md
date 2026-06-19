# Documentación de Noteflow2

Índice de guías técnicas del proyecto.

---

## Empezar

| Documento | Contenido |
|-----------|-----------|
| [README principal](../README.md) | Instalación, desarrollo, despliegue en Vercel |
| [Getting started con Neon](./getting-started-neon.md) | Base de datos PostgreSQL |
| [noteflow-api/README.md](../noteflow-api/README.md) | API REST, endpoints, variables de entorno |

---

## Funcionalidades

| Documento | Contenido |
|-----------|-----------|
| [Autenticación móvil (Firebase)](./autenticacion-movil-firebase.md) | Auth nativa, Firestore, puente con Neon |
| [Configuración AWS S3](./configuracion-aws-s3.md) | Bucket, IAM, variables, proxy de imágenes |
| [Flujo de subida de imágenes](./flujo-subida-imagenes-s3.md) | Avatar, adjuntos, `/api/media` |
| [API de notas](./api-notes.md) | Ejemplos de `/api/notes` |

---

## Arquitectura y seguridad

| Documento | Contenido |
|-----------|-----------|
| [Backend: teoría](./backend-teoria.md) | REST, capas, modelo de datos |
| [Seguridad en la API](./seguridad-api.md) | SQL injection, env vars, JWT |

---

## Scripts SQL (`server/`)

| Documento | Contenido |
|-----------|-----------|
| [server/README.md](../server/README.md) | Migraciones y prueba de conexión a Neon |

---

## Despliegue rápido (Vercel)

Necesitas **dos proyectos**:

1. **API** — Root Directory: `noteflow-api`  
   Variables: `DATABASE_URL`, `JWT_SECRET`, `AWS_*`

2. **Web** — Raíz del repo  
   Variable: `EXPO_PUBLIC_API_URL=https://TU-API.vercel.app/api`

Detalle completo en el [README principal](../README.md#despliegue).
