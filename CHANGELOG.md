# Changelog

## [Unreleased]

### [2025-06-14] - Mejoras en la Interfaz de Usuario General
#### Added
- Nuevo diseño de encabezados con fondo degradado naranja
- Diseño mejorado para tablas de datos con estilos consistentes
- Tooltips informativos en botones de acción
- Notificaciones mejoradas para acciones del usuario
- Chips de estado con diseño moderno y coherente

#### Changed
- Actualizado el diseño de todas las vistas principales:
  - ServiceList: Nuevo encabezado y mejoras en la tabla
  - PaymentHistory: Rediseño completo con encabezado moderno
  - ServiceBills: Mejora en la presentación de facturas
  - Analytics: Nuevo diseño de la sección de análisis
- Unificación de estilos en botones de acción
- Mejora en la presentación de fechas y montos
- Optimización de espaciados y alineaciones
- Actualización de la paleta de colores para mejor contraste

#### Technical
- Refactorización de componentes para mejor mantenibilidad
- Mejora en la estructura de los templates
- Optimización de estilos y clases CSS
- Implementación de mejores prácticas de UX/UI

### [2025-06-14] - Mejoras en la vista de Facturas
#### Added
- Nuevo composable `useBills` para manejar la lógica de facturación
- Nuevo archivo de utilidades `billUtils.js` con funciones comunes y constantes
- Nuevas tarjetas de resumen con diseño mejorado para mostrar totales
- Mejor agrupación visual de acciones y controles

#### Changed
- Rediseño completo de la interfaz de usuario en `ServiceBills.vue`
- Mejorada la organización del código separando lógica en composables
- Optimizado el rendimiento de las computaciones
- Mejorada la experiencia de usuario con tooltips más descriptivos
- Actualizada la presentación de la tabla de facturas con mejor diseño
- Mejorado el sistema de filtrado de facturas

#### Technical
- Refactorización del componente `ServiceBills.vue` para mejor mantenibilidad
- Centralización de constantes y configuraciones
- Mejor manejo de estados y efectos secundarios
- Implementación de patrones de diseño más robustos

## [2025-06-13]
- Removed "Tendencia de Pagos" chart from Payment History view.
- Corrected the "Due Date" column in the Payment History table to display the `Bill.dueDate` field.
- Removed the "Recurrence" column from the Payment History table.
- Changed the "Bill Name" column to display the `Bill.Service.name` field.
- Added pagination to the Payment History table.
- Updated the category filter to point to `Bill.category`.
