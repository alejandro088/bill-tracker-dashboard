# Changelog

## [2025-06-18] - Optimización de Filtrado de Pagos

### Changed
- Movida la lógica de filtrado de pagos al backend para mejor rendimiento
- Refactorizado el servicio paymentService.js para soportar múltiples filtros
- Optimizado useAnalytics.js para usar filtrado del servidor
- Mejorado el rendimiento al reducir la cantidad de datos transferidos

### Added
- Agregado soporte para filtros de año, moneda y categoría en el backend
- Añadido efecto para recargar datos cuando cambian los filtros

### Fixed
- Eliminada la duplicación de lógica de filtrado entre frontend y backend
- Mejorado el rendimiento al evitar procesar todos los pagos en el cliente

## [2025-06-18] - Corrección en el Filtrado de Pagos

### Fixed
- Corregido el filtrado de pagos en la vista Analytics que retornaba un array vacío
- Mejorada la validación y parseo de pagos del servidor
- Agregado soporte para obtener la categoría desde el servicio asociado
- Corregido el manejo de fechas usando paidAt como fecha principal

### Added
- Agregados logs de depuración para facilitar la detección de problemas
- Mejorada la validación de datos para mostrar errores más descriptivos

## [2025-06-18] - Corrección de Errores en Vista Analytics

### Fixed
- Corregido error de propiedad "error" no definida en Analytics.vue
- Mejorado el manejo y visualización de errores en la vista de Analytics
- Agregada destructuración correcta de la variable error desde useAnalytics

### Changed
- Actualizado el composable useAnalytics para exponer el estado de error
- Mejorada la UX mostrando alertas de error en la interfaz

## [2025-06-18] - Mejora en la Validación de Datos de Pagos

### Added
- Nueva validación robusta para datos de pagos en useAnalytics.js
- Manejo de errores mejorado en la vista Analytics
- Alertas visuales para errores de validación de datos

### Changed
- Refactorizado useAnalytics.js para validar cada pago individualmente
- Mejorado el manejo de fechas inválidas en los datos de pagos
- Actualizada la vista Analytics para mostrar errores de manera amigable

### Fixed
- Corregido el error "Invalid payments data received from server"
- Mejorado el manejo de casos donde los pagos tienen datos faltantes o inválidos

## [2025-06-17] - Mejora en el Formulario de Pago

### Added
- Agregado selector de fecha al formulario de pago
- Nueva funcionalidad para registrar la fecha exacta del pago realizado

### Changed
- Mejorado el proceso de registro de pagos para incluir la fecha seleccionada
- Actualizada la interfaz del formulario de pago con un campo de fecha intuitivo

## [2025-06-17] - Corrección en el Registro de Pagos

### Fixed
- Corregido problema con la actualización de la fecha de pago (paidAt) en facturas
- Mejorado el manejo de fechas en el registro de pagos
- Agregada validación para asegurar la correcta actualización de la fecha

### Added
- Nueva validación que arroja error si la fecha de pago no se actualiza correctamente
- Inclusión de datos de pago en la respuesta para mejor seguimiento

## [2025-06-17] - Mejora en el Registro de Pagos

### Changed
- Modificada función addPayment para actualizar automáticamente el estado de la factura al registrar un pago
- Agregada transacción para asegurar la integridad de los datos al registrar pagos

## [2025-06-17] - Correcciones y Mejoras en la Vista de Análisis

### Fixed
- Corregidos tipos inválidos en componentes BaseCard
- Eliminada definición CSS duplicada de header-card
- Mejorada la indentación y espaciado del código
- Completadas secciones faltantes en los templates

### Changed
- Actualizada la validación de tipos en componentes BaseCard
- Mejorada la estructura del código siguiendo estándares
- Optimizada la organización del CSS

## [2025-06-17] - Mejoras en la Vista de Análisis

### Added
- Nuevos filtros interactivos para año, moneda y categoría
- Tarjetas de resumen con métricas clave:
  - Total pagado con tendencia
  - Promedio mensual de gastos
  - Mayor gasto individual
  - Tasa de ahorro
- Gráficos mejorados:
  - Gráfico de línea para tendencia mensual
  - Gráfico de dona para distribución por categoría
  - Tooltips informativos
- Nueva tabla de desglose por categoría
- Mejor formateo de moneda y números
- Diseño responsivo mejorado
- Paleta de colores consistente por categoría

### Changed
- Rediseño completo de la vista de análisis
- Mejorada la visualización de datos
- Optimizado el rendimiento de los gráficos
- Actualización en tiempo real al cambiar filtros


## [Unreleased]

### [2025-06-17] - Mejoras en la Vista de Resumen Mensual
#### Added
- Nuevo componente MonthlySummaryTable para mejor visualización y reutilización
  - Íconos intuitivos para cada estado
  - Efectos hover para mejor interactividad
  - Header de mes expandible con totales por moneda
  - Botón para ver detalles del mes
- Modal de detalles de mes con gráfico de distribución
- Vista de resumen anual con modos tarjeta y lista
- Barra de progreso para visualización de estados
- Botón de actualización manual de datos

#### Changed
- Rediseño completo del layout de la vista Summary
  - Separación en paneles para mejor organización
  - División clara entre tabla mensual y estadísticas
  - Mejoras visuales en la presentación de datos
- Optimización de gráficos y visualizaciones
  - Colores consistentes para monedas (USD/ARS)
  - Mejor legibilidad de datos y etiquetas
  - Gráficos interactivos y responsivos

#### Enhanced
- Mejor experiencia de usuario
  - Feedback visual en interacciones
  - Carga y actualización de datos más clara
  - Consistencia en estilos y animaciones
- Visualización de datos financieros
  - Formato mejorado para cantidades
  - Chips distintivos para monedas
  - Indicadores visuales de estado

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

### [2025-06-16] - Identidad Visual de Servicios
#### Added
- Nuevo componente ServiceIcon para mostrar iconos de servicios
- Soporte para favicons automáticos usando Google Favicon Service
- Iconos predefinidos para servicios populares (Netflix, YouTube, ChatGPT, etc.)
- Campos url e iconKey en el modelo Service
- Selector de servicios populares en el formulario de edición

#### Changed
- Mejorada la visualización de servicios en la tabla con iconos personalizados
- Actualizado el formulario de edición para incluir URL y selección de servicio popular

### [2025-06-16] - Mejoras en Íconos y Servicios
#### Added
- Soporte para íconos personalizados vía URL cuando no se usa un servicio popular
  - Campo customIconUrl en el modelo Service para guardar la URL del ícono
  - Campo adicional en el formulario de edición cuando no se selecciona un servicio popular
  - Soporte en ServiceIcon para mostrar íconos personalizados

### [2025-06-16] - Mejoras en visualización de URLs de servicios
#### Added
- Visualización de URLs de servicios en la tabla principal
  - Enlaces clickeables que abren el servicio en una nueva pestaña
  - Visualización del dominio debajo del nombre del servicio
  - Diseño compacto y elegante con ícono de enlace

## [2025-06-13]
- Removed "Tendencia de Pagos" chart from Payment History view.
- Corrected the "Due Date" column in the Payment History table to display the `Bill.dueDate` field.
- Removed the "Recurrence" column from the Payment History table.
- Changed the "Bill Name" column to display the `Bill.Service.name` field.
- Added pagination to the Payment History table.
- Updated the category filter to point to `Bill.category`.

### [2025-06-16] - Mejoras en íconos de servicios
#### Added
- Nuevo buscador de íconos en el formulario de edición de servicios
  - Interfaz visual para buscar y seleccionar íconos de Material Design
  - Más de 60 íconos comunes disponibles
  - Búsqueda en tiempo real de íconos
  - Vista previa de íconos antes de seleccionar
- Soporte para íconos personalizados vía URL o selección de ícono
  - Nuevo campo customIconKey en la base de datos
  - Visualización mejorada de íconos en la tabla de servicios

## [Unreleased]
### Fixed
- Corregida la visualización del mayor gasto en Analytics usando la categoría correcta
- Mejorada la visualización de montos en ARS y USD en las tarjetas de resumen

### Added
- Nuevo composable useAnalytics para manejar la lógica de análisis de gastos
- Caché de datos de análisis para mejorar el rendimiento
- Soporte mejorado para múltiples monedas en gráficos y tablas
- Visualización separada de gastos en ARS y USD

### Changed
- Refactorizado componente Analytics.vue para usar el nuevo composable
- Mejorada la visualización de gráficos con soporte para múltiples monedas
- Eliminado el sistema de caché en Analytics para simplificar la lógica y evitar problemas de datos inconsistentes

### Fixed
- Mejorado el manejo de errores al cargar datos del caché en Analytics
- Añadida validación de datos recibidos del servidor
- Implementada limpieza automática de caché corrupto o expirado
