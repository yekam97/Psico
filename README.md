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
| `/api/appointments/status` | PATCH | Cambiar estado de cita + descuento automático de sesión al completar |
| `/api/patient/appointments` | POST | Agendar cita con validación de salas físicas disponibles |
| `/api/patient/psychologists` | GET | Psicólogos disponibles para agendar |
| `/api/patient/dashboard` | GET | Dashboard del paciente |
| `/api/psychologist/appointments` | GET | Citas del día y próximas 30 días |
| `/api/psychologist/patients` | GET | Pacientes asignados |
| `/api/psychologist/notes/[patientId]` | GET, POST | Notas clínicas (valida asignación) |
| `/api/psychologist/waitlist` | GET | Lista de espera |
| `/api/branding` | GET | Branding multi-tenant por dominio |
| `/api/chat/messages` | GET, POST | Mensajería interna |
| `/api/chat/contacts` | GET | Contactos del chat |

---

### ⏳ Frontend: conectar vistas a las APIs (datos mockeados → reales)

- [x] **Admin > Usuarios** — CRUD completo: crear admin/paciente/psicólogo, editar todos los roles, validación de correo duplicado, asociar y desasociar psicólogo a paciente
- [ ] **Admin > Dashboard** — tarjetas y gráfica a `/api/admin/stats`
- [ ] **Admin > Reporte semanal** — conectar a `/api/admin/reports`
- [x] **Admin > Terapias** — historial de terapias funciona; agregar saldo de citas por paciente funciona
- [ ] **Admin > Usuarios recientes** — listar psicólogos con teléfono
- [x] **Psicólogo > Calendario** — eventos del día a `/api/psychologist/appointments`
- [x] **Psicólogo > Próximas citas** — conectar a `/api/psychologist/appointments`
- [x] **Psicólogo > Lista de pacientes** — conectar a `/api/psychologist/patients`
- [ ] **Psicólogo > Notas clínicas** — guardar e historial a `/api/psychologist/notes/[patientId]`
- [ ] **Psicólogo > Lista de espera** — conectar a `/api/psychologist/waitlist`
- [x] **Paciente > Agendar cita** — funciona contra `/api/patient/appointments`; ⚠️ no filtra por disponibilidad del psicólogo
- [ ] **Perfil** — ocultar Notificaciones para rol Admin; agregar sección de logo/branding

---

### ✅ Funcionalidades validadas en pruebas

- [x] **Autenticación** — validación de email y contraseña para acceder a la plataforma
- [x] **Chat entre usuarios** — funciona entre roles; cada rol solo ve sus propias conversaciones (psicólogo ve sus pacientes y admin del mismo centro; paciente solo ve sus chats)
- [x] **Psicólogo > Cancelar citas** — el psicólogo puede cancelar sus propias citas
- [x] **Psicólogo > Sesión completada** — botón de marcar sesión completada funciona correctamente
- [x] **Descuento automático de saldo** — el saldo de citas del paciente se descuenta una vez el psicólogo marca la cita como completada

---

### ⏳ Funcionalidades sin implementar aún

- [ ] **Disponibilidad del psicólogo** — guardar horarios y filtrar slots en el booking (confirmado: el agendamiento actual no respeta disponibilidad)
- [ ] **Confirmación/rechazo de cita** — psicólogo aprueba o rechaza con razón visible al paciente
- [ ] **Track de citas en calendario** — marcar si se realizó o no (con razón si no se hizo) (validar obligatoriedad del campo)
- [ ] **Tip de bienestar** — contenido dinámico para vista del psicólogo
- [ ] **Notificación de sesiones por vencer** — alerta cuando quedan pocas sesiones pagadas
- [x] **Descarga de reportes** — exportar reporte semanal en CSV (opcional)
- [ ] **Responsive mobile** — ajuste de vistas para pantallas pequeñas

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

- [ ] **Landing — popup fantasma:** Se reportó popup de "nueva cita" al cargar la home. `src/app/page.tsx` es Server Component puro sin modales — el origen debe estar en un componente hijo o en el layout. Requiere investigación adicional.
- [ ] **Landing — formulario de contacto roto:** El botón de envío no despacha ningún correo. Confirmado por código: no existe `nodemailer`, `resend` ni ningún SDK de email en las dependencias del proyecto. La funcionalidad no está implementada.
- [ ] **Landing — texto no copiable:** El email y el teléfono de contacto no se pueden seleccionar ni copiar.
- [ ] **Perfil — subir imagen no funciona:** El botón de carga de imagen en "Editar perfil" no hace nada. Confirmado: no existe endpoint de upload ni integración con ningún servicio de almacenamiento (S3, Cloudinary, etc.).
- [ ] **Recordatorios de citas — UI sin backend:** Los toggles de recordatorio en Admin > Ajustes son solo decorativos. Confirmado por código: `src/app/api/admin/settings` no guarda ningún campo de recordatorio y no existe ningún cron job, worker ni integración de email/notificaciones en todo el proyecto.
- [ ] **Badge "Verificado" — hardcodeado:** El badge de "Verificado" en la vista de perfil es texto estático (`src/app/dashboard/profile/page.tsx`). No existe el campo `verified` ni `isVerified` en el schema de Prisma. No representa ningún estado real.

---

### ⚠️ Decisiones de diseño pendientes

- [ ] **Protección del último admin:** Confirmado por código: el endpoint DELETE de usuarios (`src/app/api/admin/users/[id]/route.ts`) no verifica cuántos admins quedan activos antes de eliminar. Se puede borrar el último admin sin restricción.
- [ ] **Agendamiento sin saldo (paciente):** Confirmado por código: en `src/app/api/patient/appointments/route.ts` la cita se crea aunque `remaining = 0`. Incluso hay un comentario en el código que dice `"maybe we shouldn't allow booking?"` — la decisión quedó pendiente. Definir si se bloquea o se permite con advertencia.
- [ ] **Agendamiento sin saldo (admin):** ¿El admin puede agendar citas para un paciente sin saldo? ¿O debe validarse el saldo antes de permitirlo?
- [ ] **Vista por defecto del admin:** Al ingresar, el admin llega a una pantalla que no es la más útil. Se sugiere que la vista inicial sea la lista de pacientes.
- [ ] **Acceso rápido para agendar (admin):** Programar citas desde la vista admin no es ágil. Se propone agregar un acceso directo desde el dashboard o la lista de pacientes.
- [ ] **Cargar saldo desde más pantallas:** El saldo de citas solo se puede cargar desde Admin > Terapias. Se propone habilitarlo también desde la edición de paciente y desde la lista de pacientes.
- [ ] **Edición de marca por múltiples admins:** ¿Si dos admins editan la configuración de marca del centro al mismo tiempo, cuál prevalece? No hay control de concurrencia.

---

### 🔍 Validaciones pendientes

- [ ] **Cascade al eliminar paciente:** Funciona en la práctica: el DELETE ejecuta una transacción manual que borra `patientPsychologist`, `therapyInventory`, `appointment`, `clinicalNote`, `availability`, `waitlist`, `profile` y finalmente `user`. Sin embargo, el schema de Prisma no tiene `onDelete: Cascade`, por lo que una eliminación directa fuera de esta ruta dejaría huérfanos. Considerar agregar el cascade al schema.
- [ ] **Chat entre sesiones distintas:** El chat usa polling HTTP cada 5 segundos (`src/components/chat/ChatWidget.tsx`). No hay WebSockets ni Server-Sent Events. Latencia mínima de 5s. Funciona entre computadores distintos pero no es en tiempo real.
- [ ] **Email de contacto de la landing:** Verificar si `hola@healthsaas.com` (o el dominio configurado) está activo y recibe mensajes.
- [ ] **Validación de formularios:** Confirmado por código: los formularios solo usan el atributo HTML nativo `required`. No hay `zod`, `react-hook-form`, `yup` ni ninguna librería de validación. Sin validación de formato de email, longitud de contraseña ni mensajes de error personalizados. Tampoco hay validación de schema en las API routes.
- [ ] **Capacidad de la plataforma:** Revisar el plan actual de Vercel para conocer el límite de datos almacenados en Neon y el número de requests por minuto antes de degradación.

---

### ✅ Resuelto en esta sesión

- ~~**Validación de correo duplicado:**~~ Al intentar crear un usuario con un correo ya registrado, el sistema lo rechaza correctamente.
- ~~**Dónde se carga el saldo de citas:**~~ Se gestiona desde Admin > Terapias. Funciona correctamente.
- ~~**Alcance del admin en multi-tenant:**~~ Confirmado por código: todas las queries de la API filtran por `companyId` extraído de la sesión. Un admin solo ve datos de su propio centro.
- ~~**Logo por defecto de la empresa:**~~ Confirmado por código: `src/app/api/branding/route.ts` tiene tres niveles de fallback. Si no hay logo configurado, devuelve `logoUrl: null` y colores por defecto. El cliente siempre recibe una respuesta bien formada.

---

### 🚀 Features futuros

- [ ] **Disponibilidad del psicólogo en el agendamiento:** La disponibilidad configurada por el psicólogo no se refleja en ninguna de las pantallas de agendamiento (admin, paciente ni psicólogo). Todas las franjas horarias aparecen disponibles siempre.
- [ ] **Integración con Google Calendar:** Generar links de Google Meet automáticamente para las citas virtuales y sincronizar con el calendario personal del psicólogo.
- [ ] **Notificaciones de citas vía WhatsApp:** Enviar recordatorios o confirmaciones de cita por WhatsApp a pacientes y psicólogos.
