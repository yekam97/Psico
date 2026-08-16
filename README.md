# Minerva — SaaS de gestión para centros de salud (multi-especialidad)

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

## Multi-especialidad, Planes y Super Admin

La plataforma dejó de ser solo para psicología. Hay un nivel por encima de `ADMIN` (que sigue existiendo, scoped a un solo centro):

| Rol | Alcance |
| --- | --- |
| `SUPER_ADMIN` | Toda la plataforma. Crea centros (`Company`) y su primer `ADMIN`, asigna/edita planes. No pertenece a ningún centro — su `companyId` es solo un placeholder técnico requerido por el schema; nunca se usa para filtrar datos (ver `src/app/api/branding/route.ts`). |
| `ADMIN` | Como antes: un solo centro (`Company`). |
| `PSYCHOLOGIST` | Como antes — es el rol genérico de "profesional que atiende pacientes", sin importar la especialidad del centro. **No se renombró** a algo como `PROFESSIONAL`: las rutas `/dashboard/psychologist/**` y `/api/psychologist/**` siguen llamándose así internamente mientras sirven a cualquier especialidad, para evitar un refactor masivo de nombres sobre una app ya probada. La UI sí muestra la etiqueta correcta ("Panel de Odontólogo", etc.) vía `src/lib/specialty.ts`. |
| `PATIENT` | Como antes. |

**Especialidad por centro** (`Company.specialty`, enum `Specialty` en el schema): `PSYCHOLOGY`, `DENTISTRY`, `ORTHODONTICS`, `INTERNAL_MEDICINE`, `PEDIATRICS`, `ANESTHESIOLOGY`, `GYNECOLOGY_OBSTETRICS`, `GENERAL_SURGERY`, `OPTOMETRY`. Impacta tres cosas dinámicamente según `src/lib/specialty.ts`:
- **La etiqueta del profesional** ("Panel de Odontólogo", "Asignar Optómetras", etc. — `professionalLabel()`), aplicada en el dashboard, Admin > Usuarios, el booking del paciente, y errores/notificaciones server-side.
- **La palabra para una sesión/cita** ("Terapias" solo para psicología; "Sesiones", "Consultas" o "Procedimientos" para el resto — `sessionLabel()`), porque "terapia" no tiene sentido para un odontólogo o cirujano. El modelo/campo sigue llamándose `TherapyInventory`/`remaining` en el schema (ver nota de alcance más abajo); solo el texto mostrado cambia.
- **El módulo clínico** que reemplaza las notas de texto: `DENTISTRY`/`ORTHODONTICS` → odontograma, `OPTOMETRY` → registro de optometría, el resto → notas de texto genéricas. Agregar un módulo clínico propio para otra especialidad no requiere cambio de arquitectura: se agrega el modelo Prisma, la ruta API con el mismo patrón de auth, un componente de UI, y una condición más en `src/components/clinical/ClinicalDocumentationPanel.tsx` (el componente compartido que decide cuál renderizar).

**Planes** (`Plan` model): cada `Company` tiene un `planId` opcional (`null` = ilimitado/todos los módulos, útil para no romper centros existentes al agregar el sistema de planes). Un plan define `maxPatients`, `maxProfessionals` (`null` = sin límite, aplicado en `POST /api/admin/users`) y `modules` (array de strings, gestionable desde `/dashboard/super-admin/plans`). Módulos que existen hoy (`src/lib/specialty.ts` → `PLAN_MODULES`):

| Módulo | Qué hace si falta |
| --- | --- |
| `PORTAL_ACCESS` | Sin este módulo, el admin puede seguir creando pacientes/profesionales (para notas y organización interna), pero esos `User` se crean con `portalAccess: false` — nunca pueden iniciar sesión (bloqueado en `authorize()`, `src/lib/auth-options.ts`, con mensaje explícito en vez de "credenciales inválidas"). El admin del centro siempre puede iniciar sesión sin importar el plan. Ver "Documentación clínica sin acceso al portal" abajo — es la pieza que hace que esto funcione de verdad. |
| `ODONTOGRAM` | El centro ve notas de texto en vez del odontograma, aunque su especialidad sea DENTISTRY/ORTHODONTICS (banner explicando por qué en la vista del paciente). |
| `OPTOMETRY_RECORD` | Igual que arriba pero para el registro de optometría en centros OPTOMETRY. |
| `CHAT` | El widget de chat interno no se renderiza (`src/app/dashboard/layout.tsx`). |

Planes de ejemplo ya seedeados (`prisma/seed.ts` → `seedPlatformDefaults()`), pensados como jerarquía Básico → Intermedio → Pro:

| Plan | maxPatients | maxProfessionals | Módulos |
| --- | --- | --- | --- |
| Básico | 50 | 3 | *(ninguno — sin acceso al portal)* |
| Intermedio | 300 | 15 | `PORTAL_ACCESS` |
| Pro | sin límite | sin límite | `PORTAL_ACCESS`, `ODONTOGRAM`, `OPTOMETRY_RECORD`, `CHAT` |

⚠️ **Correo/WhatsApp no están en esta lista a propósito:** no existe ninguna integración de email ni WhatsApp en el proyecto (ver sección de notificaciones más abajo) — agregar esos nombres como "módulos" del plan Pro sin que hicieran nada habría sido exactamente el mismo tipo de bug que ya se corrigió varias veces en este README (toggles decorativos que no hacen nada). Cuando se implementen de verdad, agregarlos ahí.

**Documentación clínica sin acceso al portal:** si un centro está en un plan sin `PORTAL_ACCESS`, sus profesionales *nunca pueden iniciar sesión* — lo cual significa que nadie podría escribir la nota/odontograma/registro de una cita a menos que el admin pudiera hacerlo en su nombre. Por eso `ClinicalDocumentationPanel` (`src/components/clinical/`) es un componente compartido montado en dos lugares: la vista propia del profesional (`/dashboard/psychologist/patients/[id]`) y una vista nueva para el admin (`/dashboard/admin/patients/[id]`, enlazada desde el botón de notas en Admin > Usuarios). Cuando el admin escribe, el registro queda atribuido al profesional asignado (`psychologistId`/`doctorId` en el modelo, no al admin) — si el paciente tiene más de un profesional asignado, el admin elige a cuál se lo atribuye. Las tres rutas API (`/api/psychologist/notes`, `/api/professional/tooth-records`, `/api/professional/optometry-records`) aceptan tanto `PSYCHOLOGIST` (auto-atribuido a su propia sesión) como `ADMIN` (requiere `psychologistId` explícito, validado contra la asignación real).

**Odontograma** (v1, deliberadamente simple — no numeración FDI clínica completa, sin superficies ni códigos de tratamiento): 32 dientes clickeables (`src/components/dental/Odontogram.tsx`), cada click abre un campo de texto libre para anotar el procedimiento de esa sesión (`ToothRecord` model, `/api/professional/tooth-records/[patientId]`).

**Registro de Optometría** (v1, mismo espíritu simple que el odontograma pero con una forma distinta — un formulario por consulta en vez de clicks por unidad, porque así es como funciona un examen de refracción): esfera/cilindro/eje/agudeza visual para OD y OS, más notas (`OptometryRecord` model, `src/components/optometry/OptometryRecordPanel.tsx`, `/api/professional/optometry-records/[patientId]`).

**Bootstrap del Super Admin:** no hay formulario público de registro (por seguridad). Se crea con `npx prisma db seed` (ver `seedPlatformDefaults()` en `prisma/seed.ts`) — por defecto `super@minerva.com` / `super123`. Cámbialo antes de producción.

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
- [x] ~~**Responsive mobile**~~ — resultó estar mayormente ya implementado de una sesión anterior (drawer de sidebar, tarjetas en vez de tabla en mobile, grids que colapsan) — no marcado en este README. El único bug real encontrado: todos los modales (crear usuario, agendar cita, terapias, historial) se desbordaban del viewport en mobile por el problema clásico de flexbox `min-width: auto` en sus contenedores `w-full max-w-*`; se agregó `min-w-0` a los 6 modales (`src/app/dashboard/admin/users/page.tsx`, `admin/therapy/page.tsx`, `psychologist/page.tsx`).
- [ ] **Reformular lista de espera como citas prioritarias del día:** La lista de espera debe corresponderse a citas prioritarias que se agendan en el mismo día.
- [ ] **Cita prioritaria desde el paciente:** El paciente puede marcar una cita como prioritaria al agendarla; se agenda en cualquier espacio pero entra en la lista de espera del psicólogo para ser confirmada o rechazada. Debe llegar una notificación y un badge al psicólogo indicando que tiene algo en lista de espera.
- [x] **Modal de razón de cancelación:** El popup actual de razón de cancelación debería ser un modal consistente con el de crear cita.
- [x] **Notificación al paciente cuando el psicólogo cancela:** Notificar con un mensaje al paciente cuando el psicólogo cancela una cita.
- [x] **Ventana de agendamiento con antelación máxima:** Se deben poder agendar citas en distintas fechas con un máximo de 2 meses de antelación para pacientes y 3 meses para el admin. (Implementado: paciente máximo 2 meses, admin máximo 3 meses, mínimo 1 hora de antelación)
- [ ] **Notificaciones por email de citas próximas:** Decidido: se usará Resend. Pendiente que se cree la cuenta en resend.com, se verifique un dominio de envío, y se agregue `RESEND_API_KEY` al `.env` para poder implementarlo.
- [ ] **Notificaciones por WhatsApp:** Fuera de alcance por decisión explícita — el API oficial de Meta requiere verificación de negocio (semanas de aprobación), no es algo resoluble en una sesión de desarrollo. Retomar cuando haya una cuenta de WhatsApp Business API (vía Twilio u otro BSP) ya aprobada.
- [ ] **Terminología "psicólogo/terapia" hardcodeada en el resto de la app:** Al agregar multi-especialidad solo se adaptaron dinámicamente el landing, los títulos de header del dashboard y el módulo clínico (notas vs. odontograma). El resto de las pantallas (Admin > Usuarios, listado de pacientes, lista de espera, formularios de creación, "Terapias Restantes", etc.) siguen diciendo literalmente "Psicólogo"/"Terapias" sin importar la especialidad real del centro. Funciona correctamente para cualquier especialidad, solo el copy no es específico — usar `professionalLabel()`/`specialtyLabel()` de `src/lib/specialty.ts` para ir reemplazando donde importe.
- [ ] **Super Admin no puede eliminar centros ni desactivar profesionales/pacientes por límite de plan retroactivo:** Si un centro ya tiene más pacientes que el nuevo `maxPatients` de su plan, no pasa nada automáticamente (correcto: no se borra a nadie), pero tampoco hay ninguna alerta visible para el Super Admin de que el centro está "sobre el límite". El límite solo bloquea *crear* usuarios nuevos.

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

- ~~**"Terapias" seguía apareciendo en centros no-psicológicos:**~~ El barrido de terminología de la sesión anterior cubrió `professionalLabel()` pero no el concepto de "sesión/terapia" en sí — "Terapias Restantes", "Gestionar Terapias", "Historial de Terapias", mensajes de error de saldo, etc. seguían diciendo "terapia" para un centro de ortodoncia o cirugía. Se agregó `sessionLabel()` en `src/lib/specialty.ts` (Terapia/Terapias solo para psicología; Sesión/Sesiones, Consulta/Consultas o Procedimiento/Procedimientos para el resto) y se aplicó en Admin > Usuarios, dashboard admin, Admin > Terapias, la lista de pacientes del profesional, y los errores de saldo insuficiente de ambas rutas de citas. El modelo `TherapyInventory` y sus campos siguen llamándose así internamente — mismo criterio que con `PSYCHOLOGIST`: cambiar el nombre del dato es un refactor de schema, cambiar la palabra que ve el usuario no.
- ~~**Nadie podía documentar una cita si el profesional no tiene acceso al portal:**~~ Vacío funcional real, no cosmético: en un plan sin `PORTAL_ACCESS`, el profesional asignado *nunca puede iniciar sesión*, y las rutas de notas/odontograma exigían la sesión de ese profesional exacto — es decir, ese paciente jamás podría tener una nota clínica. Se extendieron las tres rutas (notas, odontograma, optometría) para aceptar también al `ADMIN` del centro, atribuyendo el registro al profesional asignado (no al admin) — mismo patrón descrito en la sección de arriba. Se creó `/dashboard/admin/patients/[id]` (enlazado desde un botón nuevo en Admin > Usuarios) reutilizando el mismo componente `ClinicalDocumentationPanel` que ya usaba la vista del profesional.
- ~~**Optometría agregada como especialidad, con su propio módulo clínico:**~~ No se limitó a agregar el nombre a la lista — un examen de optometría se documenta distinto a un diente (una fórmula completa por consulta, no clicks por unidad), así que se construyó `OptometryRecord`/`OptometryRecordPanel` con esa forma en vez de reusar el patrón del odontograma.
- ~~**Texto invisible en inputs (fondo blanco, letra casi blanca):**~~ Reportado con captura en un modal de "Crear Usuario" en tema claro. No se pudo reproducir el `color` calculado exacto en el navegador de prueba (salía `rgb(23,23,23)`, correcto), lo cual apunta a una interacción entre "forzar tema oscuro" del navegador/SO del usuario y el hecho de que ningún input del proyecto declaraba `color` explícito (dependían de la herencia). Se aplicaron dos capas de arreglo: (1) `color-scheme: light` / `dark` explícito en `:root`/`.dark` en `globals.css`, que le dice al navegador que use el tema del sitio y no el del SO para inputs/autofill/scrollbars; (2) se agregó `text-gray-900` explícito a los ~40 inputs/selects/textareas del proyecto que no lo tenían, como defensa adicional independiente de la causa exacta.
- ~~**"Crear Psicólogo" en centros de otras especialidades:**~~ Confirmado con una cuenta real de Odontología/Ortodoncia. La causa raíz real no era solo copy hardcodeado: `BrandingProvider` (ver bug siguiente) se quedaba con los datos de la empresa anterior, así que aunque el copy ya usaba `professionalLabel()`, mostraba la etiqueta de la sesión vieja. Con el fix de branding + el barrido de `professionalLabel()`/`specialtyLabel()` en Admin > Usuarios, dashboard admin, booking del paciente, y errores/notificaciones de las rutas de citas, ahora dice "Ortodoncista"/"Odontólogo"/etc. en todos lados.
- ~~**Branding de la empresa anterior se quedaba pegado al cambiar de cuenta:**~~ Bug real y serio, no cosmético: `BrandingProvider` solo volvía a pedir `/api/branding` cuando `useSession().status` cambiaba de "unauthenticated" a "authenticated" — si un usuario iniciaba sesión justo después de otro (sin pasar por ese estado intermedio), el nombre/logo/colores/especialidad de la empresa **anterior** se quedaban visibles. Existía desde que se introdujo el branding multi-tenant; invisible mientras solo había una empresa en la base de datos, y se volvió evidente en cuanto Super Admin permitió crear una segunda. Corregido: el efecto ahora también depende de `companyId`, y limpia a los valores por defecto en `unauthenticated`.
- ~~**El plan no controlaba nada de verdad:**~~ `Plan.modules` existía en el schema y en la UI de creación de planes, pero ninguna ruta lo consultaba — el odontograma aparecía para cualquier empresa DENTISTRY/ORTHODONTICS sin importar su plan. Se conectó `hasModule()` de extremo a extremo (branding API → provider → página del paciente con banner de "no incluido en tu plan" → endpoint de tooth-records también lo valida server-side). De paso se implementó el modelo de niveles completo que se pidió: módulo `PORTAL_ACCESS` (sin él, pacientes/profesionales se crean solo para notas internas, con `User.portalAccess = false`, bloqueados en el login con mensaje explícito) y módulo `CHAT` (oculta el widget de chat interno si el plan no lo incluye). Planes reseedeados como Básico (sin módulos) → Intermedio (`PORTAL_ACCESS`) → Pro (`PORTAL_ACCESS` + `ODONTOGRAM` + `CHAT`).
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
