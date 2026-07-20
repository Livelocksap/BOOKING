# Reservas de pistas de padel

Aplicacion web para que los socios de la comunidad reserven las dos pistas
de padel (Pista 1 y Pista 2).

## Reglas de negocio

- Alta de socio con nombre, portal, planta, puerta, usuario y contrasena.
- Ventana de reserva movil: se puede reservar desde hoy hasta dentro de 2
  dias (la ventana avanza sola cada medianoche, hora de Madrid).
- Horario reservable: de 11:00 a 21:00 en franjas de 1 hora.
- Un socio solo puede tener una reserva activa por dia (en cualquiera de las
  2 pistas).
- Las reservas se pueden cancelar en cualquier momento.
- Rol de administrador: ve y cancela cualquier reserva, y gestiona la lista
  de socios.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS.
- Prisma ORM (generador `prisma-client`) sobre Turso (libSQL) via
  `@prisma/adapter-libsql`.
- Sesion con `iron-session` (cookie cifrada) y contrasenas con `bcryptjs`.

## Desarrollo local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y ajusta los valores (ver detalle abajo).

3. Aplica el esquema a la base de datos local:

   ```bash
   npm run db:migrate
   ```

4. Crea las pistas y el socio admin inicial:

   ```bash
   npm run db:seed
   ```

5. Arranca el servidor de desarrollo:

   ```bash
   npm run dev
   ```

### Variables de entorno

| Variable            | Uso                                                                 |
| ------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`      | Usada solo por la CLI de Prisma (migraciones), apunta a un archivo SQLite local. |
| `TURSO_DATABASE_URL`| Usada por la app en tiempo de ejecucion (`lib/db.ts`). En local puede ser el mismo archivo SQLite; en produccion, tu base de datos Turso. |
| `TURSO_AUTH_TOKEN`  | Token de Turso (vacio en local, obligatorio en produccion).          |
| `SESSION_PASSWORD`  | Clave para cifrar la cookie de sesion. Genera una con `openssl rand -base64 32`. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credenciales del socio admin que crea `prisma/seed.ts`. |

## Despliegue en Vercel + Turso

SQLite guarda los datos en un archivo local, y Vercel no ofrece almacenamiento
persistente en sus funciones. Por eso en produccion se usa
[Turso](https://turso.tech) (SQLite alojado), compatible con el mismo cliente
Prisma via `@prisma/adapter-libsql`.

1. Instala la CLI de Turso y crea la base de datos:

   ```bash
   turso db create pistas-padel
   turso db show pistas-padel --url
   turso db tokens create pistas-padel
   ```

2. Aplica el esquema a Turso ejecutando el SQL de las migraciones generadas
   localmente (Prisma Migrate no soporta Turso directamente):

   ```bash
   turso db shell pistas-padel < prisma/migrations/<timestamp>_init/migration.sql
   turso db shell pistas-padel < prisma/migrations/<timestamp>_member_cascade_delete/migration.sql
   ```

   (aplica cada carpeta de `prisma/migrations` en orden; si en el futuro
   anades una migracion nueva, aplica tambien su `migration.sql`).

3. En Vercel, crea el proyecto a partir del repositorio de GitHub y define
   las variables de entorno: `TURSO_DATABASE_URL` (la URL `libsql://...` del
   paso 1), `TURSO_AUTH_TOKEN`, `SESSION_PASSWORD`, `ADMIN_USERNAME` y
   `ADMIN_PASSWORD`.

4. Tras el primer despliegue, ejecuta el seed una vez apuntando a Turso (por
   ejemplo desde tu maquina, con `TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` de
   produccion en el entorno):

   ```bash
   npm run db:seed
   ```

## Estructura

- `prisma/schema.prisma` — modelo de datos (Member, Court, Reservation).
- `lib/db.ts` — cliente Prisma con el adaptador libSQL.
- `lib/auth.ts` — sesion (iron-session) y hashing de contrasenas.
- `lib/dates.ts` — ventana de reserva y franjas horarias (huso Europe/Madrid).
- `lib/reservations.ts` — logica de negocio de reservas y cancelaciones.
- `app/` — paginas (login, registro, reservas, mis-reservas, admin) y sus
  Server Actions.
- `proxy.ts` — protege las rutas segun sesion y rol (equivalente al
  middleware clasico de Next.js, renombrado a "Proxy" en Next.js 16).
