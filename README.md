# SR Fitness Gym — Control de cuotas

Web app mobile-first para que el profe vea de un vistazo **quién pagó, cuándo vence cada uno y quién debe**, sin revisar chat por chat. Se instala en el celular como una app (PWA).

**Stack:** Vite + React + TypeScript · Tailwind CSS · Firebase Authentication + Cloud Firestore · Firebase Hosting

## Funcionalidades

- **Inicio:** contadores de socios activos, al día, por vencer (próximos 5 días) y vencidos. Tocar una tarjeta filtra el listado.
- **Socios:** tarjetas con estado en color (verde / naranja / rojo, "vencido hace X días"), buscador por nombre, apellido o celular, filtros por plan y estado, orden por vencimiento.
- **Alta y edición** de socios con validaciones. El vencimiento es la fecha de pago + 1 mes, y se puede cambiar.
- **Registrar pago** con un toque: fecha, plan y monto precargados. Actualiza el vencimiento y guarda el pago en el historial.
- **WhatsApp** (wa.me con prefijo 549 y mensaje según el estado) y **llamada** con un toque.
- **Recordatorios:** recorre los vencidos (o los que están por vencer) uno por uno para mandarles el WhatsApp.
- **Detalle** del socio con historial de pagos. **Dar de baja / reactivar** o eliminar con confirmación.
- **Ajustes:** precios de cada plan (autocompletan el monto) y cierre de sesión.
- **Recordatorios automáticos por email** 1 día antes del vencimiento y a 1, 3 y 7 días de vencida (ver más abajo).
- **Resumen mensual en PDF:** cobrado en el mes (total y por plan), detalle de pagos, cuotas vencidas y por vencer, altas y bajas y listado de socios activos. Se descarga o se comparte desde el celu (Ajustes → Resumen mensual en PDF).
- Datos en tiempo real (`onSnapshot`) y caché offline. Sin señal, la app sigue mostrando los datos y sincroniza cuando vuelve.

## Modelo de datos (Firestore)

```
socios/{id}
  nombre, apellido: string
  celular: string            // 10 dígitos, ej: 3364123456
  plan: "2 veces" | "3 veces" | "libre"
  fechaUltimoPago: timestamp
  fechaVencimiento: timestamp
  montoUltimoPago?: number
  notas?: string
  activo: boolean
  creadoEn, actualizadoEn: timestamp

socios/{id}/pagos/{pagoId}
  fecha: timestamp, monto: number, plan: string, creadoEn: timestamp

config/precios
  "2 veces": number, "3 veces": number, "libre": number
```

## Estructura

```
src/
  components/   layout (navegación, encabezados), ui (botones, modal, toasts…), socios, dashboard
  context/      proveedores de auth, toasts, socios en tiempo real y modal de pago
  hooks/        useAuth, useSocios, usePagos, usePrecios, useToast…
  lib/          firebase, fechas, formatos ($, celular), WhatsApp, filtros
  pages/        una pantalla por ruta
  services/     acceso a Firestore y Auth
  types/        tipos de TypeScript
```

## 1. Configurar Firebase

1. Entrá a la [consola de Firebase](https://console.firebase.google.com/) y creá un proyecto.
2. **Authentication** → *Comenzar* → *Método de acceso* → habilitá **Correo electrónico/contraseña**.
3. **Firestore Database** → *Crear base de datos* → elegí la ubicación (ej: `southamerica-east1`) y modo producción.
4. **Configuración del proyecto** (⚙️) → *Tus apps* → agregá una **app web** (`</>`) y copiá los valores de `firebaseConfig`.
5. Copiá `.env.example` como `.env.local` y completalo:

   ```bash
   cp .env.example .env.local
   ```

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

## 2. Crear el usuario del profe

No hay registro público. Los usuarios se crean a mano:

**Authentication** → **Usuarios** → **Agregar usuario** → email y contraseña.

Con ese email y contraseña se entra a la app. Repetí el paso si querés más de un usuario.

## 3. Correr en local

Requiere **Node 24 o superior** (la versión LTS de https://nodejs.org). Con versiones más viejas `npm run dev` no arranca.

```bash
npm install
npm run dev
```

Abrí http://localhost:5173. Para probarlo desde el celular en la misma red: `npm run dev -- --host` y entrá a la IP de la compu.

Otros comandos: `npm run build`, `npm run preview`, `npm run lint`, `npm run typecheck`, `npm run format`.

### Opcional: emulators de Firebase

Para desarrollar sin tocar los datos reales (requiere Java):

```bash
npx firebase-tools emulators:start --only auth,firestore --project demo-srfitness
```

En `.env.local` usá `VITE_FIREBASE_PROJECT_ID=demo-srfitness` y agregá `VITE_USE_EMULATORS=true`. Los usuarios de prueba se crean desde la UI de los emulators (http://localhost:4000).

## 4. Deploy (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
cp .firebaserc.example .firebaserc   # y poné el id de tu proyecto
npm run build
firebase deploy --only hosting,firestore:rules
```

`firebase.json` ya está configurado: publica `dist/`, redirige todas las rutas a `index.html` y no cachea el service worker. Las reglas de `firestore.rules` solo permiten leer y escribir a usuarios autenticados.

Después del deploy, en el celular abrí la URL (`https://tu-proyecto.web.app`):

- **Android (Chrome):** menú ⋮ → *Instalar app*, o desde **Ajustes** dentro de la app.
- **iPhone (Safari):** Compartir → *Agregar a inicio*.

## Deploy alternativo (Vercel)

1. Importá el repositorio en Vercel. Detecta Vite solo: build `npm run build`, salida `dist`.
2. En **Settings → Environment Variables** cargá las mismas variables `VITE_FIREBASE_*` de tu `.env.local`.
3. En Firebase → **Authentication → Configuración → Dominios autorizados**, agregá el dominio de Vercel (ej: `sr-fitness.vercel.app`).

`vercel.json` redirige todas las rutas a `index.html`. Nunca subas `node_modules` ni `.env.local` al repositorio (ya están en `.gitignore`).

## Recordatorios automáticos por email (EmailJS + Vercel Cron)

Todos los días a las 9 (hora de Argentina) Vercel ejecuta `api/recordatorios.ts`, que manda un email a cada socio activo **con email cargado**:

- 1 día antes del vencimiento (o el mismo día si ese día no corrió),
- a 1, 3 y 7 días de vencida la cuota.

Cada aviso sale una sola vez por vencimiento; cuando el socio paga, se reinician. Los enviados se ven en la ficha del socio. Desde **Ajustes → Recordatorios por email** se puede mandar un email de prueba, ver a quién le toca hoy o enviar en el momento.

### 1. EmailJS
1. En [EmailJS](https://dashboard.emailjs.com) conectá el servicio de email (ej: el Gmail del gym) y anotá el **Service ID** (ej: `service_sidjj7g`).
2. **Email Templates → Create New Template**:
   - **Subject:** `{{asunto}}`
   - **To Email:** `{{to_email}}`
   - **From Name:** `SR Fitness Gym`
   - **Reply To:** el email del gym
   - **Content:** tocá *Edit Content → Code Editor* y pegá el contenido de [`docs/emailjs-template.html`](docs/emailjs-template.html).
   - Guardá y anotá el **Template ID**.
3. **Account → General:** copiá la **Public Key**. En **Account → Security** activá *"Allow EmailJS API for non-browser applications"* y *"Use Private Key"*, y copiá la **Private Key**.

El plan gratis de EmailJS permite 200 emails por mes: alcanza para unos 80 socios (no a todos les toca aviso todos los meses).

### 2. Cuenta de servicio de Firebase
Firebase → ⚙️ **Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**. Se descarga un `.json`: es una contraseña, no la subas al repositorio.

### 3. Variables en Vercel
En **Settings → Environment Variables** (además de las `VITE_FIREBASE_*`):

| Variable | Valor |
|---|---|
| `EMAILJS_SERVICE_ID` | ej: `service_sidjj7g` |
| `EMAILJS_TEMPLATE_ID` | el Template ID |
| `EMAILJS_PUBLIC_KEY` | la Public Key |
| `EMAILJS_PRIVATE_KEY` | la Private Key |
| `FIREBASE_SERVICE_ACCOUNT` | el contenido completo del `.json` de la cuenta de servicio |
| `CRON_SECRET` | una contraseña larga inventada (Vercel la usa para llamar al cron) |

Después hacé **Redeploy**. El horario está en `vercel.json` (`0 12 * * *` = 12 UTC = 9 hs de Argentina).

> Los recordatorios funcionan en la app publicada en Vercel; con `npm run dev` los botones de Ajustes muestran un aviso.

## Aviso

Este proyecto se desarrolló con asistencia de herramientas de inteligencia artificial. El código fue revisado y probado, pero conviene revisarlo antes de cambios importantes.
