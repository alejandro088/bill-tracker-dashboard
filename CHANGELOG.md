# Changelog

## [Unreleased]

### [2025-06-14] - Mejoras en la Interfaz de Usuario
#### Added
- Implementado nuevo diálogo de confirmación moderno para eliminar facturas
- Mejorado el diseño del ChatbotWidget con una interfaz más moderna y amigable
- Agregados iconos y tooltips en la vista de historial de pagos

#### Changed
- Actualizado el diseño del ChatbotWidget con:
  - Nueva cabecera con mejor espaciado y tipografía
  - Burbujas de chat mejoradas con iconos y timestamps
  - Mejor organización del área de entrada
  - Interfaz más espaciosa y legible
  - Modo oscuro y scrollbar personalizada
- Mejorado el formato de fechas en la vista de historial de pagos
- Unificado el estilo de los botones de acción en todas las tablas
- Optimizada la presentación de datos en PaymentHistory

#### Technical
- Refactorización del manejo de diálogos de confirmación
- Consolidación de estilos y componentes comunes
- Mejora en la consistencia visual de la aplicación
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
