# Configuración de AWS S3 en NoteFlow

NoteFlow sube imágenes (avatar y adjuntos de notas) a **Amazon S3** usando **Presigned URLs**. Las credenciales de AWS **solo** viven en el servidor (`noteflow-api`); la app móvil nunca las ve.

---

## Flujo resumido

```
App autenticada
    → POST /api/uploads/presign  (API genera URL firmada)
    → PUT directo a S3           (app sube el archivo)
    → Guarda publicUrl en Firestore (avatar) o PostgreSQL (adjuntos)
```

Diagrama completo: [`flujo-subida-imagenes-s3.md`](./flujo-subida-imagenes-s3.md)

---

## Paso 1 — Crear bucket S3

1. Entra en [AWS Console → S3](https://s3.console.aws.amazon.com/s3/).
2. **Create bucket**
3. Nombre único, por ejemplo: `noteflow2-images`
4. Región: anótala (ej. `eu-west-1`)
5. Para URLs públicas directas, desactiva **Block all public access** (solo si aceptas lectura pública de imágenes).

---

## Paso 2 — Política de lectura pública (bucket)

**Permissions → Bucket policy** (sustituye el nombre del bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::noteflow2-images/*"
    }
  ]
}
```

Así las imágenes se ven con URLs como:

`https://noteflow2-images.s3.eu-west-1.amazonaws.com/avatars/...`

---

## Paso 2b — CORS del bucket (obligatorio para web / Vercel)

Desde el **navegador**, la app hace `PUT` directo a S3. Sin CORS el navegador bloquea la petición con **"Failed to fetch"**.

1. Bucket → **Permissions** → **Cross-origin resource sharing (CORS)**
2. **Edit** → pega esto (sustituye tu dominio de Vercel):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": [
      "https://TU-FRONT.vercel.app",
      "http://localhost:8081",
      "http://localhost:19006"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

> Sustituye `https://TU-FRONT.vercel.app` por la URL exacta de tu frontend (copia la de la barra del navegador).  
> Para probar rápido puedes usar `"*"` en `AllowedOrigins` (menos restrictivo).

---

## Paso 3 — Usuario IAM para la API

1. [IAM → Users → Create user](https://console.aws.amazon.com/iam/) → `noteflow-api`
2. Crea una policy inline:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::noteflow2-images/*"
    }
  ]
}
```

3. **Security credentials → Create access key** (Application running outside AWS).
4. Guarda **Access Key ID** y **Secret Access Key**.

---

## Paso 4 — Variables de entorno

### Local (`.env.local` en la raíz o `noteflow-api/.env.local`)

```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-1
AWS_S3_BUCKET=noteflow2-images
AWS_S3_PUBLIC_URL=https://noteflow2-images.s3.eu-west-1.amazonaws.com
```

### Vercel (proyecto API, Root Directory = `noteflow-api`)

| Variable | Valor |
|----------|--------|
| `AWS_ACCESS_KEY_ID` | tu access key |
| `AWS_SECRET_ACCESS_KEY` | tu secret |
| `AWS_REGION` | `eu-west-1` |
| `AWS_S3_BUCKET` | `noteflow2-images` |
| `AWS_S3_PUBLIC_URL` | URL base pública del bucket |

**Redeploy** del proyecto API tras añadir las variables.

---

## Paso 5 — Probar la conexión

1. Arranca la API: `npm run api`
2. Inicia sesión en la app.
3. **Perfil → Cambiar foto de perfil → Guardar cambios**
4. En DevTools → **Network**:
   - `POST .../api/uploads/presign` → 200
   - `PUT https://noteflow2-images.s3...` → 200

### Sin AWS (solo desarrollo)

Si **no** configuras las variables `AWS_*`, la API usa almacenamiento local automáticamente (`/api/uploads/local`). Las imágenes se guardan en `noteflow-api/public/uploads/`.

---

## Código relevante

| Archivo | Función |
|---------|---------|
| `noteflow-api/lib/s3.ts` | Cliente S3 + Presigned URL |
| `noteflow-api/app/api/uploads/presign/route.ts` | Endpoint presign |
| `lib/s3Upload.ts` | App: pide URL y sube con PUT |
| `lib/uploadToAWS.ts` | Avatar + Firestore (móvil) |
| `components/RemoteImage.tsx` | Muestra imágenes con caché |

---

## Errores frecuentes

| Síntoma | Solución |
|---------|----------|
| **Failed to fetch** al subir (web/Vercel) | Configura **CORS** en el bucket S3 (Paso 2b) |
| Error interno en presign | Faltan variables AWS en el proyecto **API** |
| PUT a S3 → 403 | IAM sin permiso `s3:PutObject` o región incorrecta (`AWS_REGION`) |
| Imagen no se ve | Bucket sin lectura pública o `AWS_S3_PUBLIC_URL` incorrecta |
| Funciona local, no en Vercel | Variables solo en `.env.local`, no en Vercel |

---

## Seguridad

- Las claves AWS **nunca** van en la app Expo.
- Cada Presigned URL expira en **5 minutos**.
- Las rutas en S3 incluyen el `userId`: `avatars/{userId}/...`, `notes/{userId}/...`.
- El presign exige usuario autenticado (`Authorization: Bearer`).
