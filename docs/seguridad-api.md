# Seguridad en la API

Este documento cubre dos prácticas esenciales en el backend de Noteflow: evitar **inyección SQL** y proteger **secretos** (como el connection string de Neon) mediante variables de entorno.

---

## Inyección SQL

La **inyección SQL** ocurre cuando la entrada del usuario se **concatena directamente** en una consulta. El motor de base de datos no puede distinguir qué parte del texto es estructura SQL y qué parte es dato; un atacante puede inyectar fragmentos que alteran la consulta.

### Ejemplo vulnerable

Supón un endpoint que busca notas por título:

```typescript
// ❌ Vulnerable: concatenación directa
const title = req.body.title;
// Vector de ataque: "'; DROP TABLE notes;--"
const sql = "SELECT * FROM notes WHERE title = '" + title + "'";
await db.execute(sql);
```

Si el atacante envía:

```text
'; DROP TABLE notes;--
```

La consulta que llega a PostgreSQL queda así:

```sql
SELECT * FROM notes WHERE title = ''; DROP TABLE notes;--'
```

El motor puede interpretar dos sentencias: primero un `SELECT` vacío y después un `DROP TABLE notes`, con consecuencias graves (pérdida de datos, lectura de tablas ajenas, etc.). Otros payloads típicos fuerzan condiciones siempre verdaderas (`' OR '1'='1`) para listar filas sin autorización.

### Por qué ocurre

| Factor | Riesgo |
|--------|--------|
| Entrada controlada por el cliente | Cualquier campo del body, query string o cabecera puede ser malicioso |
| Concatenación de strings | El SQL y los datos comparten el mismo canal |
| Confianza implícita | El servidor asume que el texto es “solo un título” |

La regla práctica: **nunca** interpolar valores de usuario en SQL con `+`, template literals o `format()`.

---

## Consultas parametrizadas

Las **consultas parametrizadas** envían la **estructura** de la consulta y los **valores** por separado. La base de datos precompila el SQL con placeholders (`$1`, `$2`, … en PostgreSQL) y trata cada parámetro **estrictamente como dato**, nunca como código ejecutable.

### Ejemplo seguro

```typescript
// ✅ Seguro: consulta parametrizada
const sql = "SELECT * FROM notes WHERE title = $1";
await db.query(sql, [req.body.title]);
```

Aunque `req.body.title` sea `'; DROP TABLE notes;--`, PostgreSQL lo compara como un literal de texto en la columna `title`. No ejecuta `DROP TABLE` como sentencia independiente.

### Cómo lo hace Noteflow

El módulo `noteflow-api/lib/db.ts` centraliza el acceso a Neon:

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

Uso correcto en una ruta:

```typescript
// Buscar por id
const rows = await query<NoteRow>(
  "SELECT * FROM notes WHERE id = $1",
  [req.params.id],
);

// Insertar
await query(
  "INSERT INTO notes (id, title, content) VALUES ($1, $2, $3)",
  [id, title, content],
);
```

| Práctica | Motivo |
|----------|--------|
| Placeholders `$1`, `$2`, … | Orden fijo; el driver enlaza valores de forma segura |
| Array de parámetros separado | El SQL no contiene datos del usuario |
| Función `query()` compartida | Un solo punto donde revisar que no haya concatenación |

**Nota:** En Neon 1.x hay que usar `sql.query(text, params)`, no `sql("SELECT …")` con interpolación. La API bloquea el uso inseguro por defecto.

### Qué no sustituye a las consultas parametrizadas

- Validar tipos y longitudes en el servidor sigue siendo necesario (errores 400, datos coherentes).
- Parametrizar **nombres de columnas o tablas** no es posible con `$1`; si hiciera falta, usa una lista blanca fija en código, nunca entrada del usuario.

---

## Variables de entorno y secretos

Una **variable de entorno** es un valor de configuración que el sistema operativo o el proceso de Node expone en tiempo de ejecución, fuera del código fuente. En Noteflow, el más crítico es `DATABASE_URL`: la connection string de Neon (usuario, contraseña, host, base de datos).

### Por qué no hardcodear el connection string

```typescript
// ❌ Nunca en el repositorio
const sql = neon(
  "postgresql://usuario:contraseña_secreta@ep-xxx.neon.tech/neondb?sslmode=require",
);
```

| Problema | Consecuencia |
|----------|--------------|
| Commit en Git | El historial conserva el secreto aunque lo borres después |
| Repos públicos o forks | Cualquiera con acceso al repo obtiene credenciales de la BD |
| Mismo valor en dev y prod | Rotar contraseñas obliga a cambiar código y redesplegar |
| Cliente Expo / bundle móvil | Si el string estuviera en la app, estaría en el dispositivo del usuario |

El **connection string es equivalente a la llave de la base de datos**. Quien lo posee puede leer, modificar y borrar todos los datos.

### Configuración en Noteflow

1. **Desarrollo local:** archivo `.env.local` en la raíz del proyecto (ignorado por Git):

   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
   ```

2. **Plantilla sin secretos:** `.env.example` con la clave vacía, sí commiteable:

   ```env
   DATABASE_URL=
   ```

3. **Carga en el servidor:** `noteflow-api/lib/load-env.ts` y `next.config.ts` leen `.env.local` de la raíz del monorepo antes de arrancar.

4. **Uso en código:** solo la referencia al nombre de la variable:

   ```typescript
   const sql = neon(process.env.DATABASE_URL!);
   ```

5. **Producción:** definir `DATABASE_URL` en el panel del hosting (Vercel, Railway, etc.), no en archivos del repo.

### Reglas rápidas

- El connection string **solo** en el servidor; la app cliente habla con `/api`, nunca con Neon directamente.
- No pegar `DATABASE_URL` en chats, issues, capturas ni documentación con valores reales.
- Si un secreto se filtró, **rotar** la contraseña en la [consola de Neon](https://console.neon.tech) y actualizar `.env.local` / variables del deploy.

---

## Autenticación JWT

Tras el login, el servidor devuelve un **JSON Web Token** firmado con `JWT_SECRET`. El cliente lo envía en cada petición protegida:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Flujo

1. `POST /api/auth/register` o `POST /api/auth/login` → `{ token, user }`.
2. El servidor nunca devuelve `password_hash`; solo guarda el hash en Neon.
3. Las rutas `/api/notes` llaman a `requireAuth()` y rechazan peticiones sin token (`401`).
4. El payload del JWT incluye `sub` (user id) y `email`; expira en 7 días.

### Almacenamiento en la app móvil

| Método | Seguridad | Uso en Noteflow |
|--------|-----------|-----------------|
| AsyncStorage | Texto plano en disco | ❌ No para tokens |
| **expo-secure-store** | Cifrado en Keychain (iOS) / Keystore (Android) | ✅ Token JWT |

```typescript
import * as SecureStore from "expo-secure-store";
await SecureStore.setItemAsync("noteflow_auth_token", token);
```

En web, el fallback usa `sessionStorage` (solo desarrollo).

### Variables de entorno de auth

| Variable | Dónde | Nunca en |
|----------|-------|----------|
| `JWT_SECRET` | Servidor / Vercel (proyecto API) | Cliente Expo, Git |
| `DATABASE_URL` | Servidor / Vercel (proyecto API) | Cliente Expo, Git |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Servidor / Vercel (proyecto API) | Cliente Expo, Git |
| `EXPO_PUBLIC_API_URL` | App web / móvil (proyecto web Vercel) | No es secreto; apunta a la API |

---

## Resumen

```
Entrada del usuario  ──►  consulta parametrizada ($1, $2, …)  ──►  Neon
                              │
                              └── valores como datos, no como SQL

DATABASE_URL  ──►  .env.local / variables del hosting  ──►  process.env  ──►  solo servidor
```

- **SQL injection:** concatenar entrada del usuario en SQL permite manipular la consulta.
- **Consultas parametrizadas:** separan estructura y valores; previenen que el payload se ejecute como código.
- **Variables de entorno:** mantienen secretos fuera del código y del cliente; `DATABASE_URL` y `JWT_SECRET` nunca en el repo ni en la app.
- **JWT + Secure Store:** autenticación stateless; el token viaja en cabecera, no en la URL; se guarda cifrado en el dispositivo.
