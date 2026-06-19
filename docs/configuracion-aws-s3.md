# Configuración de AWS S3 en NoteFlow

NoteFlow sube imágenes (avatar de perfil y adjuntos de notas) a **Amazon S3**. Las credenciales AWS **solo** viven en el servidor (`noteflow-api`); la app nunca las ve.

Las imágenes se **muestran** a través del proxy de la API (`GET /api/media/...`), así que **no hace falta** hacer el bucket público.

---

## Flujo resumido

```
App autenticada
    → Web:     POST /api/uploads/direct  (subida server-side, sin CORS)
    → Móvil:   POST /api/uploads/presign → PUT a S3
    → API devuelve publicUrl = https://TU-API/api/media/avatars/...
    → Perfil:  PATCH /api/auth/me { bio, avatarUrl }
    → Pantalla: GET /api/media/avatars/... (proxy S3 o disco local)
```

Diagrama completo: [`flujo-subida-imagenes-s3.md`](./flujo-subida-imagenes-s3.md)

---

## Paso 1 — Crear bucket S3

1. [AWS Console → S3](https://s3.console.aws.amazon.com/s3/)
2. **Create bucket** → nombre único, p. ej. `noteflow2-images`
3. Anota la **región** (p. ej. `eu-north-1`)
4. Puedes dejar **Block all public access** activado (el bucket puede ser privado)

---

## Paso 2 — Usuario IAM para la API

1. [IAM → Users → Create user](https://console.aws.amazon.com/iam/) → `noteflow-api`
2. Policy inline (sustituye el nombre del bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::noteflow2-images/*"
    }
  ]
}
```

- `s3:PutObject` — subir imágenes
- `s3:GetObject` — servir imágenes vía `/api/media` (proxy)

3. **Security credentials → Create access key** → guarda Access Key ID y Secret

---

## Paso 3 — Variables de entorno

### Local (`.env.local` en la raíz del repo)

```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-north-1
AWS_S3_BUCKET=noteflow2-images
AWS_S3_PUBLIC_URL=https://noteflow2-images.s3.eu-north-1.amazonaws.com
```

La API carga `.env.local` desde la raíz (`noteflow-api/lib/load-env.ts` y `next.config.ts`).

### Vercel (proyecto API, Root Directory = `noteflow-api`)

| Variable | Valor |
|----------|--------|
| `AWS_ACCESS_KEY_ID` | Access key IAM |
| `AWS_SECRET_ACCESS_KEY` | Secret IAM |
| `AWS_REGION` | Región del bucket |
| `AWS_S3_BUCKET` | Nombre del bucket |
| `AWS_S3_PUBLIC_URL` | Opcional; URL base del bucket |

**Redeploy** tras añadir o cambiar variables.

---

## Paso 4 — Probar

1. `npm run api` + `npm start`
2. Inicia sesión → **Perfil**
3. Cambiar foto de perfil → **Guardar cambios**
4. DevTools → Network:

| Petición | Esperado |
|----------|----------|
| `POST /api/uploads/direct` | 200 (web) |
| `PATCH /api/auth/me` | 200 con `avatarUrl` |
| `GET /api/media/avatars/...` | 200 (imagen visible) |

Tras cerrar sesión y volver a entrar, la foto debe persistir.

---

## Sin AWS (solo desarrollo local)

Si **no** configuras `AWS_*`, la API guarda en disco:

- Ruta: `noteflow-api/public/uploads/`
- URL pública: `/api/media/avatars/...`

En **Vercel** sin AWS la subida devuelve error 503 (configura las variables en el proyecto API).

---

## Código relevante

| Archivo | Función |
|---------|---------|
| `noteflow-api/lib/s3.ts` | Cliente S3, presign, getObject |
| `noteflow-api/lib/media-url.ts` | Construye URL `/api/media/...` |
| `noteflow-api/app/api/uploads/direct/route.ts` | Subida server-side (web) |
| `noteflow-api/app/api/uploads/presign/route.ts` | Presign (móvil) |
| `noteflow-api/app/api/media/[...path]/route.ts` | Proxy de imágenes |
| `lib/s3Upload.ts` | Cliente: direct (web) o presign+PUT (móvil) |
| `lib/mediaUrl.ts` | Normaliza URLs para mostrar en la app |
| `components/RemoteImage.tsx` | Componente de imagen remota |
| `components/ProfileNavButton.tsx` | Avatar en barra lateral |
| `app/perfil.tsx` | Pantalla de perfil |

---

## Errores frecuentes

| Síntoma | Solución |
|---------|----------|
| Error 503 al subir en Vercel | Añade `AWS_*` en el proyecto **API**, no en el web |
| Imagen no se ve (icono roto) | Comprueba `GET /api/media/...` → 200; IAM necesita `s3:GetObject` |
| Error interno al login | Revisa `DATABASE_URL` real de Neon (no placeholder `@HOST`) |
| Error 405 en la app web | `EXPO_PUBLIC_API_URL` debe apuntar a la **API**, no al frontend |
| Foto no persiste tras logout | Pulsa **Guardar cambios** después de elegir la foto |
| Spinner infinito en avatar lateral | Actualizado: `ProfileNavButton` desactiva loader en avatares pequeños |

---

## Seguridad

- Claves AWS **nunca** en la app Expo ni en Git.
- Presigned URLs expiran en **5 minutos** (móvil).
- Rutas S3 incluyen `userId`: `avatars/{userId}/...`, `notes/{userId}/...`.
- Subida y presign exigen `Authorization: Bearer`.
- `/api/media` solo sirve claves con formato `avatars/...` o `notes/...` (validación en servidor).
