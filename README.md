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
- [ ] **Psicólogo > Calendario** — eventos del día a `/api/psychologist/appointments`
- [ ] **Psicólogo > Próximas citas** — conectar a `/api/psychologist/appointments`
- [ ] **Psicólogo > Lista de pacientes** — conectar a `/api/psychologist/patients`
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
- [ ] **Track de citas en calendario** — marcar si se realizó o no (con razón si no se hizo)
- [ ] **Tip de bienestar** — contenido dinámico para vista del psicólogo
- [ ] **Notificación de sesiones por vencer** — alerta cuando quedan pocas sesiones pagadas
- [ ] **Descarga de reportes** — exportar reporte semanal en PDF (opcional)
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

Rol	Email	Password
Admin	admin@minerva.com	123
Psicólogo	psicologo@minerva.com	123
Paciente	paciente@minerva.com	123


### 🐛 Bugs confirmados

- [ ] **Landing — popup fantasma:** Al cargar la página de inicio aparece un popup de "nueva cita" sin que el usuario lo haya disparado.
- [ ] **Landing — formulario de contacto roto:** El botón de envío no despacha ningún correo.
- [ ] **Landing — texto no copiable:** El email y el teléfono de contacto no se pueden seleccionar ni copiar.
- [ ] **Perfil — subir imagen no funciona:** El botón de carga de imagen en "Editar perfil" no hace nada.

---

### ⚠️ Decisiones de diseño pendientes

- [ ] **Protección del último admin:** Actualmente es posible eliminar todos los usuarios admin. ¿Debe bloquearse si solo queda uno?
- [ ] **Alcance del admin en multi-tenant:** ¿Un admin tiene acceso únicamente al centro al que pertenece, o a todos los centros de la plataforma? Existe la entidad en BD de centro psicologicó?
- [ ] **Agendamiento sin saldo (paciente):** Un paciente sin saldo puede solicitar citas. ¿Es el comportamiento esperado o debe bloquearse?
- [ ] **Agendamiento sin saldo (admin):** ¿El admin puede agendar citas para un paciente sin saldo? ¿O debe validarse el saldo antes de permitirlo?
- [ ] **Vista por defecto del admin:** Al ingresar, el admin llega a una pantalla que no es la más útil. Se sugiere que la vista inicial sea la lista de pacientes.
- [ ] **Acceso rápido para agendar (admin):** Programar citas desde la vista admin no es ágil. Se propone agregar un acceso directo desde el dashboard o la lista de pacientes.
- [ ] **Cargar saldo desde más pantallas:** El saldo de citas solo se puede cargar desde Admin > Terapias. Se propone habilitarlo también desde la edición de paciente y desde la lista de pacientes.
- [ ] **Edición de marca por múltiples admins:** ¿Si dos admins editan la configuración de marca color y diseño del centro de psicología, cuál prevalece?
- [ ] **Modelo de perfil del admin:** ¿Los perfiles de admin están asociados a un centro específico, a un perfil de psicólogo/paciente, o a una entidad propia (centro logístico)?
- [ ] **Badge "Verificado" en perfil:** Existe un badge que dice "Verificado" en la vista de perfil, pero no queda claro qué certifica: ¿verificación de correo electrónico o validación como profesional de salud? Definir qué representa y si tiene lógica real detrás o es solo decorativo.

---

### 🔍 Validaciones pendientes

- [ ] **Cascade al eliminar paciente:** Al eliminar un paciente, ¿se eliminan automáticamente sus citas futuras del sistema y de la agenda del psicólogo asignado?
- [ ] **Chat en tiempo real entre sesiones distintas:** Confirmar que el chat funciona correctamente cuando psicólogo y paciente están conectados desde computadores diferentes al mismo tiempo.
- [ ] **Recordatorios de citas:** En Admin > Ajustes existe una configuración de recordatorios. Verificar si realmente despacha notificaciones o si es solo UI sin backend conectado.
- [ ] **Logo por defecto de la empresa:** Validar qué imagen o placeholder se muestra cuando una empresa no ha configurado su logo.
- [ ] **Validación de formularios:** Revisar que todos los formularios del sistema tengan validación en frontend (campos requeridos, formatos, longitudes) para evitar envíos inválidos.
- [ ] **Email de contacto de la landing:** Verificar si `hola@healthsaas.com` (o el dominio configurado) está activo y recibe mensajes.
- [ ] **Capacidad de la plataforma:** Revisar el plan actual de Vercel para conocer el límite de datos almacenados en Neon y el número de requests por minuto antes de degradación.

---

### ✅ Resuelto en esta sesión

- ~~**Validación de correo duplicado:**~~ Al intentar crear un usuario con un correo ya registrado, el sistema lo rechaza correctamente.
- ~~**Dónde se carga el saldo de citas:**~~ Se gestiona desde Admin > Terapias. Funciona correctamente.

---

### 🚀 Features futuros

- [ ] **Disponibilidad del psicólogo en el agendamiento:** La disponibilidad configurada por el psicólogo no se refleja en ninguna de las pantallas de agendamiento (admin, paciente ni psicólogo). Todas las franjas horarias aparecen disponibles siempre.
- [ ] **Integración con Google Calendar:** Generar links de Google Meet automáticamente para las citas virtuales y sincronizar con el calendario personal del psicólogo.
- [ ] **Notificaciones de citas vía WhatsApp:** Enviar recordatorios o confirmaciones de cita por WhatsApp a pacientes y psicólogos.
