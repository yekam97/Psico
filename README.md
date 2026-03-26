# TODO:

[] LANDING - Landing page de HealthSaaS se debe limpiar realmente para lo que hacemos que es organizacieon, gestión y administración de centros de psicologia, nuestro nicho son piscologos y centros de psicologia.

[] LANDING - Refactor de página de "Nosotros"para que hable sobre HealthSaaS, con contacto en página de inicio, que sea lo más elemental. (De momento nuestro foco de clientes es el voz a voz)

[] LANDING - Volar página de servicios

[] LANDING - Agregar clientes actuales a la página de Home

[] BACKEND - Vista Admin - Crear servicio para crud de roles, usuarios

[] FRONT - Vista Admin - Enlazar pantalla Gestión de Usuarios con BD y servicio de roles para listar, editar y crear Admins, Psicologo y Paciente

[] FRONT - Vista Admin - Funcionalidad de formulario para CRUDs (Crear Usuario)

[] FRONT - Vista Admin - Sumar funcionalidad de crud (tres botones) (Se debe poder asignar uno o máximo dos profesionales al paciente)

[] FRONT - Vista Admin - Ocultar patalla de estadísticas

[] FRONT - Vista Admin / General - Dashboard (Estadísiticas) con resumen para saber Total de Citas programadas del mes trasncurrido, gráfica de los últimos tres meses, pacientes activos (total registrados), crecimeinto de pacientes y citas, (eliminar tasa de ocupación)

[] FRONT - Vista Admin / General - Reporte semanal, Citas virtuales y citas presenciales y cancelaciones (Poder ver que citas y la razón de la cancelación), descargar reporte con esos datos (opcional).

[] FRONT - Vista Admin / General - Usuarios Recientes se pueden listar psicologos asociados con numeros de celular

[] FRONT - Vista Admin / Perfil -  Notificaciones solo visible para roles de psicologos y pacientes, seccieon para subir logo y branding, en esta pantalla esta el formulario de edición de info del usuario con rol administrador, horario actual del centro de psicologo, para manejao del calendario

[] FRONT - Vista Admin - Terapias asignadas (Pagadas o reservadas)

[] BACKEND - Servicio de manejo de citas (Asociadas a un pasiciente con doctor)

[] BACKEND - Servicio de manejo de estadisticas (Asociadas a un pasiciente con doctor)

[] FRONT - Vista Psicologo - Funcionalidad del calendario enlazar con backend (Día)

[] FRONT - Vista Psicologo - Funcionalidad del Próximas citas

[] FRONT - Vista Psicologo - Funcionalidad Tip de Bienestar

[] FRONT - Vista Psicologo - en el calendario se debe poder hacer track de las citas que se han realizado y si no se agrega una razón del porque no se hizo

[] FRONT - Vista Psicologo - Enlazar funcionalidad de listado de usaruios con backend

[] FRONT - Vista Psicologo - Enlazar funcionalidad de historial de notas por usaruio con backend

[] FRONT - Vista Psicologo - Vista de confiramación o rechazo (razeon del rechazo) de citas para confirmar al paciente que ya se programó y acepto de acuerdo con la solicitud que se hizo.

[] Rebranding cuando tengamos usarios

[] Notificación de terapias ya pagadas por finalizar

[] BACKEND - Servicio de manejo de notas por usuario, con fecha y texto con detalle

### Requerimientos:

Nos quedamos en vista de disponibilidad del psicologo

- Roles que maneja la app: Administrador, Psicologo, Paciente

- Estadisitica de citas rechazadas por psicologo *

- Admin: CRUD de Psicologos (Especialidad) y Pacientes (Ocupación)

- Aterrizar BD para branding del centro de psicología

- la plataforma al momento de ser visualizada por un paciente/psicologo debe estar personalziada deacuerdo con el branding de el centro de psicologeia que asocio/registro el correo.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
