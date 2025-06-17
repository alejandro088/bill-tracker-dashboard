# Changelog

## [Unreleased]

### [2025-06-16] - Mejoras en la Modularización y Edición de Servicios
#### Added
- Nuevo botón de edición en la tabla de servicios
- Nuevo componente EditServiceForm para editar servicios
  - Formulario modal con validación de campos
  - Edición de nombre, moneda, categoría, proveedor y recurrencia
  - Switch para renovación automática
  - Integración con la API para actualizar servicios

#### Changed
- Modularización mejorada de ServiceList manteniendo la estructura original:
  - ServiceHeader: encabezado y botón de nuevo servicio
  - ServiceFilters: filtros de búsqueda y selección
  - ServiceDueSoonSwitch: switch de próximos vencimientos
  - ServiceTable: tabla principal con todas las columnas originales
- Mejor separación de responsabilidades (smart vs dumb components)
- Optimización de la gestión de estado y eventos

### [2025-06-16] - Mejoras en Filtros y Monedas
#### Added
- Soporte completo para múltiples monedas (USD y ARS) en todos los componentes
- Nuevo filtro de moneda en la lista de servicios
- Chips de moneda junto al nombre del servicio
- Conversión automática de moneda en diálogo de pagos usando dolarapi.com
- Visualización clara de la moneda en todas las tablas

#### Changed
- Rediseño completo de los filtros en ServiceList:
  - Nueva estructura visual con etiquetas e íconos
  - Estilo unificado para todos los filtros
  - Mejor organización y espaciado
  - Efectos hover y focus mejorados
- Mejorada la presentación de montos con su moneda correspondiente
- Optimización del switch "Próximos 7 días" movido a una fila separada
- Actualización del tooltip de categoría con mejor información

#### Technical
- Refactorización de los componentes de filtrado
- Implementación de estilos consistentes usando Vuetify
- Mejora en la accesibilidad de los filtros
- Optimización de la estructura del código

## [2025-06-14] - Mejoras en la Interfaz de Usuario General
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
