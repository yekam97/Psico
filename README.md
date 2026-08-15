# Minerva — SaaS de gestión para centros de psicología

**Stack:** Next.js 16 · Vercel (serverless functions) · Neon (PostgreSQL) · Prisma ORM · NextAuth JWT

---

## Arquitectura

```text
Browser → Vercel (Next.js + API Routes) → Neon PostgreSQL (via Prisma)
```

Cada `src/app/api/**/route.ts` es una función serverless de Vercel. No hay microservicio externo — todo está en este repositorio.

---

## Setup local

Crear `.env.local` con las variables del dashboard de Vercel (Settings > Environment Variables):

```env
DATABASE_URL=        # Connection string de Neon
NEXTAUTH_SECRET=     # Mismo valor que en Vercel
NEXTAUTH_URL=http://localhost:3000
```

```bash
npm install
npm run dev
```

> **Nota para devs en red Meli/VPN:** usar `npm ci` en lugar de `npm install`. La red corporativa bloquea `registry.npmjs.org` y debe ir contra `https://npm.artifacts.furycloud.io/` (configurado en tu `~/.npmrc` global). El proyecto NO commitea `.npmrc` (está en `.gitignore`) para que cada dev use su config local. `npm install` re-resuelve dependencias y puede pedir versiones cuyo tarball Fury aún no replicó (ej. `recharts@3.8.1`); `npm ci` respeta el `package-lock.json` exacto y evita ese problema.

---

## Pruebas locales con datos seed

Para probar en local con datos de ejemplo:

```bash
npx prisma db push    # Sincroniza schema con la DB
npx prisma db seed    # Carga datos desde prisma/tenants.json
```

El seed crea usuarios, perfiles, asignaciones psicólogo-paciente y disponibilidad. Los usuarios de prueba están listados en la sección "Datos para login" más abajo.

---

## Google Calendar

La integración con Google Calendar usa una Service Account. Variables requeridas en `.env.local`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=   # Email de la Service Account
GOOGLE_PRIVATE_KEY=             # Private key (con \n escapados)
GOOGLE_CALENDAR_ID=             # ID del calendario (o email del owner)
GOOGLE_IMPERSONATE_EMAIL=       # (Opcional) Email a impersonar para Domain-Wide Delegation
```

**Google Meet:** Para que se generen links de Meet automáticamente, se requiere:
1. Habilitar Domain-Wide Delegation en la Service Account (Google Cloud Console)
2. Autorizar los scopes en Google Workspace Admin Console (`Admin > Security > API Controls > Domain-wide Delegation`)
3. Configurar `GOOGLE_IMPERSONATE_EMAIL` con un usuario del dominio

Sin Domain-Wide Delegation, los eventos se crean correctamente pero sin conferencia de Meet.

---

## Estado del proyecto

### ✅ Backend listo (API Routes operativas en Neon)

| Endpoint | Métodos | Descripción |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | POST | Auth con bcrypt + JWT (role, companyId, profileId) |
| `/api/admin/users` | GET, POST | Listar y crear usuarios; asignación de psicólogos (máx. 2) |
| `/api/admin/users/[id]` | PUT, DELETE | Editar/eliminar usuario con cleanup en cascada |
| `/api/admin/stats` | GET | Citas del mes, pacientes activos, cancelaciones, gráfica 3 meses |
| `/api/admin/reports` | GET | Reporte semanal: virtual vs presencial, cancelaciones con razón |
| `/api/admin/therapy` | GET, POST | Inventario de sesiones por paciente y recargas |
| `/api/admin/therapy/history/[patientId]` | GET | Historial de transacciones de terapia |
| `/api/admin/appointments` | GET, PATCH | Citas desde vista admin |
| `/api/admin/settings` | GET, PUT | Configuración del centro |
| `/api/appointments/status` | PATCH | Cambiar estado de cita; al cancelar desde SCHEDULED devuelve la sesión al saldo |
| `/api/patient/appointments` | POST | Agendar cita con validación de salas físicas disponibles |
| `/api/patient/availability/[psychologistId]` | GET | Slots disponibles por fecha; filtra por disponibilidad real y citas existentes |
| `/api/patient/psychologists` | GET | Psicólogos disponibles para agendar |
| `/api/patient/dashboard` | GET | Dashboard del paciente |
| `/api/psychologist/appointments` | GET | Citas del día y próximas 30 días |
| `/api/psychologist/patients` | GET | Pacientes asignados |
| `/api/psychologist/notes/[patientId]` | GET, POST | Notas clínicas (valida asignación) |
| `/api/psychologist/waitlist` | GET | Lista de espera |
| `/api/psychologist/availability` | GET, PUT | Disponibilidad del psicólogo (horarios por día) |
| `/api/profile` | GET, PUT | Perfil propio del usuario logueado (nombre, teléfono, avatar) |
| `/api/branding` | GET | Branding multi-tenant por dominio |
| `/api/chat/messages` | GET, POST | Mensajería interna |
| `/api/chat/contacts` | GET | Contactos del chat |

---

### ⏳ Frontend: conectar vistas a las APIs (datos mockeados → reales)

- [x] **Admin > Usuarios** — CRUD completo: crear admin/paciente/psicólogo, editar todos los roles, validación de correo duplicado, asociar y desasociar psicólogo a paciente
- [ ] **Admin > Dashboard** — tarjetas y gráfica a `/api/admin/stats`
- [X] **Admin > Reporte semanal** — conectar a `/api/admin/reports`
- [x] **Admin > Terapias** — historial de terapias funciona; agregar saldo de citas por paciente funciona
- [X] **Admin > Usuarios recientes** — listar psicólogos con teléfono
- [x] **Psicólogo > Calendario** — eventos del día a `/api/psychologist/appointments`
- [x] **Psicólogo > Próximas citas** — conectar a `/api/psychologist/appointments`
- [x] **Psicólogo > Lista de pacientes** — conectar a `/api/psychologist/patients`
- [X] **Psicólogo > Notas clínicas** — guardar e historial a `/api/psychologist/notes/[patientId]`
- [x] **Psicólogo > Disponibilidad** — guardar horarios a `/api/psychologist/availability`
- [ ] **Psicólogo > Lista de espera** — conectar a `/api/psychologist/waitlist`
- [x] **Paciente > Agendar cita** — funciona contra `/api/patient/appointments`; respeta disponibilidad del psicólogo, filtra horas pasadas y requiere 1h de antelación
- [X] **Perfil** — Agregar sección de logo/branding

---

### ✅ Funcionalidades validadas en pruebas

- [x] **Autenticación** — validación de email y contraseña para acceder a la plataforma
- [x] **Chat entre usuarios** — funciona entre roles; cada rol solo ve sus propias conversaciones (psicólogo ve sus pacientes y admin del mismo centro; paciente solo ve sus chats)
- [x] **Psicólogo > Cancelar citas** — el psicólogo puede cancelar sus propias citas
- [x] **Psicólogo > Sesión completada** — botón de marcar sesión completada funciona correctamente
- [x] **Descuento automático de saldo** — el saldo de citas del paciente se descuenta al agendar y se devuelve si la cita se cancela
- [x] **Notificación interna al agendar cita** — al crear una cita se envía mensaje interno al psicólogo (y al paciente si la crea el admin). Sin duplicados: se usa un único sender para evitar mensajes repetidos en el chat.
- [x] **Evento en Google Calendar** — las citas se sincronizan con Google Calendar incluyendo attendees, descripción con timezone correcto (America/Bogota), y tipo de modalidad. El link de Meet aparece en la vista si está disponible.

---

### ⏳ Funcionalidades sin implementar aún

- [x] **Disponibilidad del psicólogo** — guardar horarios y filtrar slots en el booking (implementado para paciente y admin; psicólogo no aplica porque no agenda citas)
- [X] **Confirmación/rechazo de cita** — psicólogo aprueba o rechaza con razón visible al paciente
- [ ] **Track de citas en calendario** — marcar si se realizó o no (con razón si no se hizo) (validar obligatoriedad del campo)
- [ ] **Tip de bienestar** — contenido dinámico para vista del psicólogo
- [ ] **Notificación de sesiones por vencer** — alerta cuando quedan pocas sesiones pagadas
- [x] **Descarga de reportes** — exportar reporte semanal en CSV (opcional)
- [ ] **Responsive mobile** — ajuste de vistas para pantallas pequeñas
- [ ] **Reformular lista de espera como citas prioritarias del día:** La lista de espera debe corresponderse a citas prioritarias que se agendan en el mismo día.
- [ ] **Cita prioritaria desde el paciente:** El paciente puede marcar una cita como prioritaria al agendarla; se agenda en cualquier espacio pero entra en la lista de espera del psicólogo para ser confirmada o rechazada. Debe llegar una notificación y un badge al psicólogo indicando que tiene algo en lista de espera.
- [x] **Modal de razón de cancelación:** El popup actual de razón de cancelación debería ser un modal consistente con el de crear cita.
- [x] **Notificación al paciente cuando el psicólogo cancela:** Notificar con un mensaje al paciente cuando el psicólogo cancela una cita.
- [x] **Ventana de agendamiento con antelación máxima:** Se deben poder agendar citas en distintas fechas con un máximo de 2 meses de antelación para pacientes y 3 meses para el admin. (Implementado: paciente máximo 2 meses, admin máximo 3 meses, mínimo 1 hora de antelación)
- [ ] **Notificaciones por email/WhatsApp de citas próximas:** Agregar envío de notificaciones por email o WhatsApp al celular dependiendo de las citas próximas.

---

### ⏳ Landing (baja prioridad)

- [ ] Limpiar copy para nicho de psicología
- [ ] Actualizar página "Nosotros"
- [ ] Eliminar página de Servicios
- [ ] Agregar clientes actuales en Home

---

## Roles

| Rol | Acceso |
| --- | --- |
| `ADMIN` | Usuarios, estadísticas, reportes, terapias, configuración |
| `PSYCHOLOGIST` | Calendario, pacientes, notas clínicas, lista de espera |
| `PATIENT` | Agendar citas, ver próximas citas |

Multi-tenant: cada compañía tiene dominio y branding propio (colores, logo) en la tabla `Company`.


Datos para login:

| Rol | Email | Password |
| --- | --- | --- |
| Admin | `admin@minerva.com` | `123` |
| Psicólogo | `psicologo@minerva.com` | `123` |
| Paciente | `paciente@minerva.com` | `123` |
| Admin | `nicolay.dev@outlook.com` | `123456` |
| Paciente | `nicolay.jg@outlook.com` | `123456` |
| Psicólogo | `ncly.jg@gamil.com` | `123456` |
| Paciente | `ncly2.jg@gamil.com` | `123456` |


### 🐛 Bugs confirmados

- [x] ~~**Landing — popup fantasma:**~~ Confirmado: no era un popup real, era la tarjeta decorativa "Nueva Cita / Dr. Roberto Casas" (`animate-bounce`, posicionada absolute sobre la imagen del hero en `src/app/page.tsx`) que visualmente parecía una notificación emergente. Se eliminó, como se había decidido provisionalmente.
- [x] ~~**Landing — formulario de contacto roto:**~~ Sigue sin haber SDK de email en el proyecto (ni credenciales para configurar uno), así que en vez de fingir un envío que no ocurre, el formulario (ahora en `src/components/landing/ContactForm.tsx`, client component) arma un `mailto:` con los datos y abre el cliente de correo del propio visitante — cero dependencias nuevas, y el botón ya hace algo real. Un envío server-side de verdad requeriría elegir un proveedor (Resend, etc.) y sus credenciales.
- [x] ~~**Landing — texto no copiable:**~~ No se encontró ningún `user-select: none` en el proyecto que lo explique, pero el contenedor tenía `cursor-pointer` sin ningún `onClick`, invitando a un click que no hacía nada. Se convirtieron en enlaces reales `mailto:`/`tel:` (con `select-text` explícito por si acaso), así que ahora si se pueden copiar y además abren el cliente de correo/teléfono.
- [~] **Perfil — subir imagen no funciona:** Implementado del lado de la app (input de archivo real, sube a Firebase Storage con `firebase/storage`, guarda la URL en `User.avatarUrl` vía nuevo endpoint `PUT /api/profile`, `prisma db push` ya aplicado) — pero el proyecto de Firebase (`healthsaas-c8a16`) tiene las reglas de Storage por defecto, que exigen `request.auth != null`; como NextAuth no está enlazado a Firebase Auth, la subida falla con 403/CORS en la consola. Necesita que alguien con acceso a la consola de Firebase ajuste las Storage Rules (o comparta credenciales de Admin SDK para subir server-side) — no es algo que se pueda resolver solo con código.
- [X] **Recordatorios de citas — UI sin backend:** Los toggles de recordatorio en Admin > Ajustes son solo decorativos. Confirmado por código: `src/app/api/admin/settings` no guarda ningún campo de recordatorio y no existe ningún cron job, worker ni integración de email/notificaciones en todo el proyecto. (Los mismos toggles decorativos existían también en Perfil > Notificaciones para paciente/psicólogo — sin `onClick`, siempre "encendidos" — y se eliminaron por la misma razón.)
- [x] ~~**Badge "Verificado" — hardcodeado:**~~ No existe ningún flujo real de verificación (de email, identidad, etc.) en el proyecto, así que en vez de inventar un campo `verified` falso se cambió el badge a "Activo" (`src/app/dashboard/profile/page.tsx`), que sí es una afirmación cierta para cualquier cuenta que puede iniciar sesión.
- [ ] **Contraste de fuentes en tema dark:** Revisar fuentes con bajo contraste en tema dark; validar si afecta otras vistas además de las identificadas.
- [x] **Time slots sin contraste en tema claro:** Los botones de horarios en la vista de booking del paciente no tenían color de texto definido, causando que fueran ilegibles en tema claro. Corregido agregando `text-gray-700`.
- [ ] **Notas del psicólogo — fuente sin contraste:** En la vista de notas del psicólogo la fuente no se visualiza en contraste con el fondo (blanco).
- [x] **Login — fuente con poco contraste en tema claro y dark:** Corregido: se mejoró el contraste de textos (`gray-400` → `gray-500/600`), placeholders, y se agregaron variantes `dark:` para soporte completo de tema oscuro.
- [x] ~~**Concurrencia de citas en el mismo horario:**~~ Ambas rutas de creación de citas (`admin/appointments`, `patient/appointments`) validan solapamiento contra el psicólogo antes de crear la cita y devuelven 400 si ya existe una cita `SCHEDULED` en ese rango.
- [x] ~~**Hora programada inconsistente entre vistas:** La hora agendada no se guarda o visualiza correctamente; desde la vista del psicólogo aparece una hora diferente a la que el paciente programó.~~ (Causa raíz real encontrada y corregida: el fix anterior solo aplicó `formatInTimeZone` a los *strings* de notificación/calendario, pero la escritura seguía haciendo `new Date(startTime)` sobre un string naive `YYYY-MM-DDTHH:mm:00` — se interpreta en la timezone del proceso Node, que es America/Bogota en local pero UTC en Vercel, produciendo un desfase de 5h en producción. Además el booking de admin convertía a UTC en el navegador (`toISOString()`) mientras que el de paciente enviaba el string naive tal cual, así que ambos flujos ya eran inconsistentes entre sí incluso en local. Se creó `src/lib/timezone.ts` con `parseClinicDateTime`/`formatClinicTime`/`clinicDayBounds`/`dayOfWeekForDateString`, que interpretan siempre America/Bogota sin importar la timezone del servidor, y se aplicó en ambas rutas de creación de citas y ambas rutas de slots de disponibilidad. Verificado extremo a extremo: paciente agenda 8:00 PM → psicólogo ve 20:00 → admin cuenta la cita como "hoy".)

---

### ⚠️ Decisiones de diseño pendientes

- [x] ~~**Protección del último admin:**~~ El endpoint DELETE de usuarios ahora cuenta los admins activos de la compañía antes de eliminar y rechaza el borrado del último admin con 400.
- [x] ~~**Agendamiento sin saldo (paciente):**~~ Decisión tomada por consistencia con el flujo de admin (que ya bloqueaba): `POST /api/patient/appointments` ahora rechaza el agendamiento con 400 ("No tienes sesiones disponibles...") cuando `remaining <= 0`, en vez de permitirlo silenciosamente.
- [x] ~~**Agendamiento sin saldo (admin):**~~ Ya estaba implementado en `POST /api/admin/appointments` (verificado por código); solo faltaba marcarlo aquí.
- [X] ~~**Vista por defecto del admin:** Al ingresar, el admin llega a una pantalla que no es la más útil. Se sugiere que la vista inicial sea la lista de pacientes.~~ (Fuera de scope: no es tan doliente y ya existe el botón para acceder de forma rápida a la pantalla de usuarios; el admin quiere ver el resumen fácilmente en su primera pantalla)
- [X] ~~**Acceso rápido para agendar (admin):** Programar citas desde la vista admin no es ágil. Se propone agregar un acceso directo desde el dashboard o la lista de pacientes.~~ (Fuera de scope: no es tan doliente y ya existe el botón para acceder de forma rápida a la pantalla de usuarios; el admin quiere ver el resumen fácilmente en su primera pantalla)
- [X] ~~**Cargar saldo desde más pantallas:** El saldo de citas solo se puede cargar desde Admin > Terapias. Se propone habilitarlo también desde la edición de paciente y desde la lista de pacientes.~~ (Fuera de scope: no es tan doliente y ya existe el botón para acceder de forma rápida a la pantalla de usuarios; el admin quiere ver el resumen fácilmente en su primera pantalla)
- [X] ~~**Edición de marca por múltiples admins:** ¿Si dos admins editan la configuración de marca del centro al mismo tiempo, cuál prevalece? No hay control de concurrencia.~~ (Fuera de scope: no es tan prioritario por ahora, probablemente solo hay un admin o dos)

---

### 🔍 Validaciones pendientes

- [ ] **Cascade al eliminar paciente:** Funciona en la práctica: el DELETE ejecuta una transacción manual que borra `patientPsychologist`, `therapyInventory`, `appointment`, `clinicalNote`, `availability`, `waitlist`, `profile` y finalmente `user`. Sin embargo, el schema de Prisma no tiene `onDelete: Cascade`, por lo que una eliminación directa fuera de esta ruta dejaría huérfanos. Considerar agregar el cascade al schema.
- [ ] **Chat entre sesiones distintas:** El chat usa polling HTTP cada 5 segundos (`src/components/chat/ChatWidget.tsx`). No hay WebSockets ni Server-Sent Events. Latencia mínima de 5s. Funciona entre computadores distintos pero no es en tiempo real.
- [ ] **Email de contacto de la landing:** Verificar si `hola@healthsaas.com` (o el dominio configurado) está activo y recibe mensajes. (Se dejará quemado de momento el email de nexus)
- [ ] **Validación de formularios:** Confirmado por código: los formularios solo usan el atributo HTML nativo `required`. No hay `zod`, `react-hook-form`, `yup` ni ninguna librería de validación. Sin validación de formato de email, longitud de contraseña ni mensajes de error personalizados. Tampoco hay validación de schema en las API routes.
- [ ] **Capacidad de la plataforma:** Revisar el plan actual de Vercel para conocer el límite de datos almacenados en Neon y el número de requests por minuto antes de degradación.
- [ ] **Escalabilidad del calendario al ampliar antelación:** Cuando se habilite agendar a más días, revisar si la lista de citas actuales del psicólogo en su vista principal escala correctamente.

---

### ✅ Resuelto en esta sesión

- ~~**Domingo ausente en Disponibilidad del psicólogo:**~~ El día domingo tenía soporte completo en el backend (`DAY_MAP`/`REVERSE_DAY_MAP` ya lo incluían) pero el array `days` del frontend y el schedule por defecto del `GET` lo omitían — un psicólogo no podía habilitarlo nunca por la UI. Agregado en ambos lados.
- ~~**"Conectar Calendar" (sincronización personal) no hacía nada:**~~ Botón decorativo sin `onClick` en Disponibilidad del psicólogo. Como no hay flujo de OAuth por-usuario implementado (la integración actual usa una Service Account server-to-server, no per-user), se le agregó un toast honesto de "aún no disponible" en vez de dejarlo como un click muerto.
- ~~**Perfil > Nombre no se guardaba de verdad:**~~ `handleSave` solo llamaba `updateSession({ name })`, que actualiza el JWT en el navegador pero nunca escribe en la base de datos — el cambio se revertía en el siguiente login. Se creó `PUT /api/profile` (también `GET` para precargar el teléfono) que persiste `name`/`avatarUrl` en `User` y `phone` en `Profile`; el campo de teléfono tampoco se mostraba en el formulario pese a existir en el estado.
- ~~**Psicólogo > Disponibilidad no guardaba:**~~ El botón de guardar solo mostraba animación sin persistir datos. Corregido: se creó API `/api/psychologist/availability` (GET/PUT) y se conectó el frontend. El seed ahora crea disponibilidad por defecto (Lun-Vie 9:00-17:00) para psicólogos nuevos.
- ~~**Timezone de citas inconsistente:**~~ La hora del evento y la descripción mostraban diferencia de 5 horas (UTC vs America/Bogota). Corregido usando `formatInTimeZone` de `date-fns-tz` en ambas rutas de appointments.
- ~~**Mensajes duplicados al agendar:**~~ El paciente y psicólogo veían 2 mensajes cada uno. Corregido: admin envía ambos mensajes; para citas de paciente solo se notifica al psicólogo.
- ~~**Link de Google Meet no visible:**~~ El botón de "Unirse a Google Meet" ahora aparece con estilos del tema (`text-primary bg-primary/10`) en ambos dashboards.
- ~~**Portal paciente — orden de citas invertido:**~~ Las citas se mostraban con las más antiguas primero. Corregido para mostrar las citas más próximas arriba.
- ~~**Portal paciente — fecha de cita incompleta:**~~ El portal del paciente mostraba solo mes y día de las citas, sin el año. Corregido para mostrar la fecha completa (mes, día y año).
- ~~**Validación de correo duplicado:**~~ Al intentar crear un usuario con un correo ya registrado, el sistema lo rechaza correctamente.
- ~~**Dónde se carga el saldo de citas:**~~ Se gestiona desde Admin > Terapias. Funciona correctamente.
- ~~**Alcance del admin en multi-tenant:**~~ Confirmado por código: todas las queries de la API filtran por `companyId` extraído de la sesión. Un admin solo ve datos de su propio centro.
- ~~**Logo por defecto de la empresa:**~~ Confirmado por código: `src/app/api/branding/route.ts` tiene tres niveles de fallback. Si no hay logo configurado, devuelve `logoUrl: null` y colores por defecto. El cliente siempre recibe una respuesta bien formada.

---

### 🚀 Features futuros

- [x] ~~**Integración con Google Calendar:** Generar links de Google Meet automáticamente para las citas virtuales y sincronizar con el calendario personal del psicólogo.~~ (Implementado: eventos se crean en Google Calendar con attendees y descripción. ⚠️ Google Meet requiere Domain-Wide Delegation en Google Workspace Admin para generar links automáticamente)
- [x] **Disponibilidad del psicólogo en el agendamiento:** ~~La disponibilidad configurada por el psicólogo no se refleja en ninguna de las pantallas de agendamiento.~~ (Implementado para paciente y admin: el booking consulta `/api/patient/availability/[psychologistId]` o `/api/admin/availability/[psychologistId]` que filtra por disponibilidad real, excluye citas existentes y aplica regla de 1h mínimo. Psicólogo no aplica porque no agenda citas)
- [ ] **Notificaciones de citas vía WhatsApp:** Enviar recordatorios o confirmaciones de cita por WhatsApp a pacientes y psicólogos.
