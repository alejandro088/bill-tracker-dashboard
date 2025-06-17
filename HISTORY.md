# Historial de Cambios del Proyecto

## Junio 2025

### [16-06-2025]
- feat: add service editing functionality and improve modularization
  - Add edit button to service table
  - Create EditServiceForm component with validation
  - Add service editing functionality with API integration
  - Improve component modularization
  - Update CHANGELOG.md
- refactor: rewrite modularization keeping original table structure
- feat: unificar estilo de filtros y finalizar soporte de múltiples monedas
  - Rediseño completo de filtros en ServiceList con estilo unificado
  - Etiquetas e íconos para todos los filtros
  - Mejora en la presentación de monedas en todas las tablas
  - Optimización de la estructura y espaciado de filtros
- feat: implementa soporte para pagos en ARS y USD
  - Añade campo de moneda en modelos Bill y Payment
  - Actualiza UI para soportar múltiples monedas en formularios
  - Añade filtros y visualización por moneda en tablas
  - Implementa resumen de pagos separado por moneda
  - Agrega soporte para tasa de cambio en pagos
- merge: integra rediseño del dashboard y sistema de notificaciones
  - Implementa sistema completo de notificaciones
  - Modulariza componentes del dashboard
  - Mejora manejo de fechas y validaciones
  - Unifica estilos y agrega utilidades
  - Actualiza configuración y dependencias
- chore: actualiza App.vue y rutas de servicios
  - Integra menú de notificaciones en App.vue
  - Actualiza rutas de servicios
  - Agrega frontend/dist/ a .gitignore
- feat: unifica estilos y agrega utilidades de formato
  - Crea archivo de estilos compartidos
  - Implementa utilidades de formato para fechas y números
  - Mejora BaseCard con estilos consistentes
  - Centraliza formateo de datos
- fix: mejora manejo de fechas y validaciones en formularios
  - Corrige formato de fechas en EditPaymentDialog
  - Unifica selector de fecha en todos los formularios
  - Actualiza validaciones de campos
  - Mejora manejo de errores
- refactor: modulariza componente ServiceList
  - Extrae componentes ServiceActions, ServiceBillChip y ServiceFilters
  - Crea componente ServiceTable para la tabla de servicios
  - Mejora la organización y mantenibilidad del código
  - Facilita la reutilización de componentes
- feat: implementa sistema de notificaciones
  - Agrega componentes NotificationMenu y NotificationPanel
  - Crea migración para campos de notificaciones
  - Implementa controlador y servicio de notificaciones
  - Actualiza schema de prisma con modelo Notification
- fix: corrige gestión de pagos en prisma

### [14-06-2025]
- refactor: mejora de widgets usando BaseCard
  - Reemplazado v-card por BaseCard en ServiceBills
  - Optimizado diseño con iconos y formatos mejorados
  - Agregado información adicional en footers
  - Eliminado SCSS en favor de CSS estándar
- feat(styles): agregar archivo de estilos compartidos
  - Creado archivo shared.scss con estilos unificados
  - Estilos para encabezados, tablas, chips, botones, etc.
- feat(ui): mejoras generales en la interfaz de usuario
  - Nuevo diseño de encabezados con fondo naranja
  - Unificación de estilos en todas las vistas principales
  - Mejoras en tablas y componentes interactivos
  - Rediseño completo del ChatbotWidget con mejor UX/UI

### [13-06-2025]
- Improve the user experience and add more features to the Bill Tracker application
- Rediseño del dashboard: menú lateral permanente y oscuro, barra superior, tarjetas de resumen

### [08-06-2025]
- 💳 Mostrar múltiples medios de pago por factura en el listado
- 🤖 Add DataModelNormalization logic to backend
- ✨ Implemented DataModelNormalization: moved paymentProvider to Payment
- 🤖 Add Financial Chatbot Assistant logic to frontend
- ✨ Implemented Financial Chatbot Assistant: floating chat bubble

### [07-06-2025]
- 📬 Add mail notifier for upcoming due bills using nodemailer and cron
- 💳 Add modern modal for payment provider selection
- 🧾 Improve invoice list view: chip status, icon actions, paymentProvider
- ✨ Implemented Monthly Summary: new endpoint and model refactor
- 🧼 Encoding & tooltip fixes + vencimiento futuro inteligente
- 🎯 Final UX polish: quick actions, overdue info, tooltips, archive service
- 📊 Enhanced service view: status, last invoice, filters, tooltips
- 🧾 Add action buttons to service invoice view
- 🎛️ Restore filters and actions in grouped Service view
- 📋 Vista de facturas por servicio + totales por estado + fix en dueDate
- 🧱 Add Service entity and link Bills to their services
- ➕ Allow manual invoice creation from grouped view
- 📄 Enable history view for any service with multiple invoices
- 📊 Grouped dashboard view by service + detailed invoice history
- ✅ Add unit tests using Jest for services, utils, and chatbot
- 📄 Update README and AGENTS with current testing setup
- 🐞 Fix dashboard totals calculation using backend summary
- ✨ Implemented Financial Chatbot Assistant: persistent history and reset
- ✨ Implemented LLM Chatbot: integrated OpenAI
- 🗃️ Refactor: Payment History now uses persistent DB
- 🗄️ migrate backend to MySQL
- Add recurrence field and global history
- 💄 Refactor EditBillForm into modal
- feat: add navigation drawer
- refactor: add bill form modal
- 🎨 Full UI migration to Vuetify 3
- feat: add payment provider support
- feat: add payments, history and analytics
- feat: support auto-renew subscriptions
- Setup env vars, CORS and shared axios
- Add bills filtering, summary, and Vue frontend
- Add mock database and bill management features
- Initialize Node.js backend

## Notas
Este historial muestra la evolución del proyecto desde su inicio hasta la fecha actual. Los cambios están organizados por fecha y muestran el desarrollo progresivo de características clave como:

- Modularización de componentes
- Sistema de notificaciones
- Soporte multi-moneda
- Mejoras en la UI/UX
- Implementación de chatbot financiero
- Sistema de pagos y facturación
- Pruebas unitarias y de integración
- Migraciones de base de datos
- Configuración de infraestructura
