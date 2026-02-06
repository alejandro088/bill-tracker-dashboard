# Changelog

## [2026-02-06] - Frontend: vista Detalle de Cuenta

### Added
- Nueva vista `AccountDetail.vue` en `frontend/src/views/` para visualizar el detalle de una cuenta y todos sus movimientos (pagos, ingresos/egresos, transferencias). Ruta registrada: `/accounts/:id`.
 
## [2026-02-06] - Refactor: extraer lógica de notificaciones a servicio

### Changed
- Extraída la lógica de acceso a datos y operaciones de notificaciones a `src/services/notificationService.js`. `src/controllers/notificationController.js` ahora delega en el servicio y usa `handleControllerError` para manejo centralizado de errores.

## [2026-02-06] - Backend: no crear `Category` automáticamente en `addBill`

### Changed
- Eliminada la creación automática de `Category` en `addBill` (ahora, si se pasa una categoría que no existe, no se crea; `categoryId` quedará en `null`).


## [2026-02-05] - Frontend: usar categorías desde DB

### Changed
- Eliminadas las categorías hardcodeadas del frontend; ahora se cargan desde `/categories`.
- Actualizados `frontend/src/constants/index.js`, `BillForm.vue`, `EditBillForm.vue`, `useAnalytics.js` y `Analytics.vue` para consumir las categorías desde la base de datos.
- `BillForm` y `EditBillForm` usan ahora las categorías de la API para los selectores.

## [2026-02-05] - Backend: remover `categoryId` y `recurrence` de `Bill`

### Changed
- Eliminado `categoryId` y `recurrence` del modelo `Bill` en `prisma/schema.prisma`.

## [2026-02-05] - Backend: remover `autoRenew` de `Bill`

### Changed
- Eliminado el campo `autoRenew` del modelo `Bill` en `prisma/schema.prisma`. La configuración de renovación automática ahora vive exclusivamente en el modelo `Service` (`Service.autoRenew`).
- Actualizado `src/services/billService.js` para no leer/escribir `autoRenew` en las facturas y para usar `Service.autoRenew` como fuente de la lógica de auto-renovación.
## [2026-02-05] - Frontend: vista Detalle de Factura

### Added
- Nueva vista `BillDetails.vue` en `frontend/src/views/` para visualizar los detalles de una factura y su historial de pagos. Ruta registrada: `/bills/:id`.

- Actualizado `src/services/billService.js` para no leer/escribir estos campos y para exponer `category` y `recurrence` desde el `Service` relacionado.
- Asegúrate de crear una migración de Prisma después de desplegar estos cambios.


## [2026-02-04] - Migración: agregar `userId` a `Account` y `PaymentMethods`

### Changed
- Añadida migración SQL en `prisma/migrations/add-userid-to-accounts-and-paymentmethods/migration.sql` para agregar las columnas `userId` y las constraints FK en `Account` y `PaymentMethods`.

## [2026-02-05] - Fix: evitar error en endpoint `/api/accounts/incomes`

### Fixed
- Ajuste en `src/services/accountService.js` para fijar la collation de conexión MySQL antes de ejecutar búsquedas de `Income` y `Transfer`, evitando errores de "Illegal mix of collations" en algunas instalaciones MySQL.

### Added
- Migración manual: añadida `prisma/migrations/require-notification-userid/migration.sql` para agregar la columna `userId`, índice y constraint FK en `Notification`. La migración intenta forzar `NOT NULL` sólo si no hay filas con `userId` NULL.

## [2026-02-04] - Añadida autenticación básica (JWT)

### Added
- Endpoint de autenticación: `POST /api/auth/login` para obtener un JWT.
- Middleware `src/middleware/auth.js` con `requireAuth` y `optionalAuth`.

### Added
- Endpoint de registro: `POST /api/auth/register` para crear usuarios persistentes (Prisma `User`).
- Modelo `User` añadido en `prisma/schema.prisma`.

### Changed
- Se añadieron dependencias `bcryptjs` y `jsonwebtoken` en `package.json`.


## [2025-06-22] - Mejoras en la barra de desplazamiento del menú de notificaciones

### Changed
- Mejorado el diseño de la barra de desplazamiento para hacerla más visible y funcional
  - Aumentado el ancho de 6px a 8px para mejor visibilidad
  - Añadido un borde sutil para mejorar el contraste visual
  - Incrementado el contraste del color de fondo (de 0.3 a 0.6 de opacidad)
  - Aplicado efecto de sombra para hacer la barra más prominente
  - **Corregido:** Añadida propiedad `overflow-y: auto` para asegurar que la barra de desplazamiento se muestre
- Añadido efecto hover en la barra de desplazamiento para mejor interacción
  - Implementado cambio de opacidad de 0.6 a 0.8 al pasar el cursor
  - Añadido efecto de resaltado cuando se hace hover sobre el contenedor de notificaciones
- Optimizado el soporte para Firefox con propiedades scrollbar-width y scrollbar-color
  - Mejorado el contraste de colores para Firefox con scrollbar-color
- Ajustada la altura máxima del contenedor de notificaciones para mejor visualización
  - Añadido padding lateral para evitar que el contenido se solape con la barra

## [2025-06-22] - Mejora del menú de notificaciones

### Added
- Agregado endpoint `/notifications/unread` para obtener sólo notificaciones no leídas
- Rediseñado el componente NotificationMenu para mostrar sólo notificaciones no leídas
- Añadida actualización automática del menú de notificaciones cada 60 segundos
- Implementada funcionalidad para marcar notificaciones como leídas directamente desde el menú

### Changed
- Mejorada la visualización del menú con iconos según tipo de notificación
- Optimizado el rendimiento al cargar sólo notificaciones no leídas
- Mejorada la interactividad con efectos visuales al hacer hover/clic

## [2025-06-22] - Corrección de visualización en el panel de notificaciones

### Fixed
- Corregido problema donde las notificaciones agrupadas por fecha se cortaban o no se mostraban correctamente
- Mejorada la validación de fechas para prevenir errores en la agrupación
- Ajustada la visualización de los elementos de la lista para garantizar que todo el contenido sea visible
- Mejorada la apariencia visual de los encabezados de fecha

## [2025-06-22] - Correcciones en el panel de notificaciones

### Fixed
- Corregido error de importación en NotificationPanel.vue al añadir la función formatDate en utils/formatters.js

## [2025-06-22] - Mejoras en el panel de notificaciones

### Added
- Implementada búsqueda avanzada de notificaciones por título y contenido
- Añadida agrupación visual de notificaciones por fecha (Hoy, Ayer, fechas anteriores)
- Agregada funcionalidad para eliminar notificaciones individuales
- Añadido botón para eliminar todas las notificaciones leídas
- Implementada paginación para mejorar el rendimiento con gran cantidad de notificaciones
- Mejorados los filtros de tipo con chips visuales y mejor experiencia de usuario
- Agregados tooltips informativos en los botones de acción

### Changed
- Rediseñada la interfaz para ser más limpia y accesible
- Mejorada la API del backend para soportar filtrado avanzado y paginación
- Optimizada la interacción con notificaciones (marcar como leído al hacer clic)
- Mejorada la experiencia en dispositivos móviles con diseño adaptativo
- Actualizado el sistema de filtrado para permitir múltiples filtros simultáneos

## [2025-06-22] - Eliminación del selector de moneda en pagos

### Changed
- Eliminado el selector de moneda (ARS, USD) del diálogo de pago de facturas
- La moneda ahora se asigna automáticamente según la cuenta asociada al método de pago seleccionado
- Mejorado el algoritmo de selección automática de métodos de pago para respetar la moneda de la cuenta
- Actualizada la función de verificación de saldo para tener en cuenta la moneda de la cuenta

### Improved
- La interfaz de pago es ahora más simple al eliminar la selección manual de moneda
- Añadida selección automática de un método de pago preferido al iniciar el diálogo
- Mejorada la experiencia de usuario al simplificar el proceso de pago

## [2025-06-22] - Mejoras en la vista de Pagar factura

### Added
- Rediseñada la interfaz de pago de facturas con mejor visualización de la información
- Añadida tarjeta resumen con estado del pago y totales
- Implementada función de optimización automática de métodos de pago
- Agregadas notificaciones más claras y detalladas durante el proceso de pago
- Mejorada la validación de saldo en cuentas antes de confirmar el pago

### Changed
- Reorganizada la interfaz para mostrar primero la información importante
- Mejorada la visualización de la tasa de cambio para pagos con múltiples monedas
- Actualizada la funcionalidad para sugerir métodos de pago con saldo suficiente

## [2025-06-22] - Implementación de descuento automático de saldo en cuentas

### Added
- Implementada la funcionalidad para descontar automáticamente el saldo de la cuenta asociada al método de pago al realizar un pago
- Agregada validación para verificar si la cuenta tiene saldo suficiente antes de permitir el pago
- Mejorados los componentes de diálogo de pago (PayDialog, OneTimePaymentDialog) para mostrar el saldo disponible en la cuenta
- Implementada la conversión de monedas para cuentas y pagos en diferentes divisas

### Changed
- Modificado el servicio de pagos para actualizar el saldo de la cuenta después de cada pago
- Actualizado el controlador de pagos para validar el saldo de la cuenta antes de procesar un pago
- Modificado el servicio de facturación para actualizar los saldos de las cuentas al pagar facturas

## [2025-06-22] - Mejoras en la vista de Historial de Pagos

### Added
- Agregada funcionalidad para exportar datos de pagos a Excel/CSV
- Mejorada la visualización de montos con indicadores visuales por tipo de moneda (ARS/USD)
- Restaurados los diálogos para crear nuevas categorías y métodos de pago
- Completada la funcionalidad de filtrado por todos los campos

### Fixed
- Corregido el encabezado de la página para mostrar el nombre del servicio cuando corresponde
- Restaurado el widget de resumen de pagos
- Corregidos los filtros que estaban incompletos en la función filteredPayments

## [2025-06-22] - Adición de tarjetas de resumen por moneda

### Added
- Agregadas tarjetas de resumen separadas para mostrar el total en ARS y USD en PaymentHistory
- Implementada la discriminación de pagos por moneda en el servicio de pagos
- Actualizado el componente PaymentSummaryWidget para mostrar totales por moneda

## [2025-06-22] - Actualización de la columna de Medio de pago en ServiceBills

### Changed
- Actualizada la columna "Medio de pago" en ServiceBills.vue para usar paymentMethodName en lugar de paymentProvider
- Modificado el método getServiceById para incluir la relación PaymentMethods en los pagos
- Actualizado el template de ServiceBills para mostrar correctamente los métodos de pago relacionados

## [2025-06-22] - Migración a paymentMethodId y actualización del servicio de pagos

### Changed
- Actualizado el servicio de pagos en el backend para usar `paymentMethodId` en lugar de `paymentProvider`
- Modificada la función `addPayment` para recibir y almacenar el ID del método de pago
- Actualizada la función `listPayments` para incluir filtro por `paymentMethodId`
- Modificadas las funciones `getPaymentSummary` y `getPaymentTrends` para utilizar `paymentMethodId` y `PaymentMethods`
- Corregido el componente OneTimePaymentDialog para usar `paymentMethodId` y cargar dinámicamente métodos de pago desde la API

### Fixed
- Corregido el acceso a la información del método de pago a través de la relación `PaymentMethods`
- Actualizada la lógica para mostrar el método de pago más utilizado en los informes

## [2025-06-22] - Corrección en filtros y diálogo de edición de pagos

### Changed
- Corregido el filtro de categorías en PaymentHistory.vue para utilizar el campo `categoryId` del servicio
- Modificado el componente EditPaymentDialog para eliminar el selector de categorías
- Actualizado el diálogo de edición de pagos para cargar los medios de pago desde el backend
- Cambiado el almacenamiento de método de pago para usar `paymentMethodId` en lugar de `paymentProvider`
- Actualizada la columna de método de pago en la tabla para que use la relación con PaymentMethods y muestre el nombre real del método
- Modificado el componente PayDialog para eliminar el selector de categoría y alimentar los métodos de pago desde el backend

### Fixed
- Corregido el problema de visualización de categorías en el selector
- Solucionado el error de filtrado de categorías en el listado de pagos
- Corregido el filtrado de métodos de pago para usar el ID en lugar del nombre

## [2025-06-21] - Pagos Únicos

### Added
- Agregado soporte para crear pagos únicos sin fecha de vencimiento
- Nuevo componente OneTimePaymentDialog para registrar pagos de supermercado, panadería, etc.
- Nueva ruta API para pagos únicos (/api/payments/one-time)
- Actualizada base de datos para soportar pagos sin factura asociada

### Changed
- Modificado el servicio de pagos para soportar pagos únicos
- Actualizada la vista de resumen mensual para incluir pagos únicos

## [2025-06-19] - Centralización de Constantes

### Changed
- Creado archivo central de constantes para monedas, medios de pago y categorías
- Refactorizados componentes para usar las constantes centralizadas
- Actualizado BillForm.vue, EditServiceForm.vue y Analytics.vue para usar las constantes
- Agregadas etiquetas y traducciones para las categorías
- Agregados colores para las categorías en gráficos y UI

### Fixed
- Eliminado el hardcodeo de categorías, monedas y medios de pago en los componentes
- Mejorada la consistencia en la visualización de categorías y monedas
- Agregado soporte para formateo de monedas usando Intl.NumberFormat

### Added
- Nuevo archivo constants/index.js con constantes centralizadas
- Helpers para formateo de monedas y obtención de íconos
- Helpers para obtención de colores de categorías
- Valores por defecto para monedas, categorías y medios de pago
- Soporte para traducciones de categorías

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
### Added
- Agregadas las tablas `Category` y `PaymentMethods` al esquema de Prisma.
- Creado el servicio `categoryService.js` para manejar las operaciones CRUD de categorías.
- Creado el servicio `paymentMethodService.js` para manejar las operaciones CRUD de métodos de pago.
- Creado el controlador `categoryController.js` para interactuar con las categorías.
- Creado el controlador `paymentMethodController.js` para interactuar con los métodos de pago.
- Definidas las rutas `categoryRoutes.js` y `paymentMethodRoutes.js` para las operaciones CRUD de categorías y métodos de pago.
- Generadas las migraciones necesarias para reflejar los cambios en la base de datos.
- Integradas las rutas de métodos de pago en el archivo principal del backend.
- Actualizado el componente `PaymentHistory.vue` para consumir las categorías y métodos de pago desde las nuevas APIs.
- Creada nueva vista dedicada `SettingsView.vue` para la administración de categorías y métodos de pago.
- Agregados formularios para crear, editar y eliminar categorías y métodos de pago.
- Implementada navegación a la nueva vista de configuración desde la barra lateral.
- Mejorado el filtrado de pagos para utilizar los IDs de las categorías.

### Fixed
- Corregido error en la creación de categorías y métodos de pago donde se enviaba `id` como nulo.
- Mejorada la robustez de los controladores del backend para asegurar que el campo `id` se excluya de las peticiones de creación.

## [2025-06-22] - Actualización de ServiceList para consumir categorías y métodos de pago desde el backend

### Changed
- Actualizado ServiceList.vue para utilizar `paymentMethodId` en lugar de `paymentProvider`
- Actualizado ServiceTable.vue para mostrar el nombre del método de pago relacionado
- Implementada la carga dinámica de métodos de pago desde la API en ServiceTable.vue
- Implementada la carga dinámica de categorías desde la API en ServiceTable.vue
- Modificada la persistencia en localStorage para usar la clave correcta (svc_paymentMethod)
- Mejorada la visualización de categorías y métodos de pago para mostrar sus nombres en lugar de IDs

### Fixed
- Corregida la lógica de filtrado para que funcione con los nuevos campos `paymentMethodId` y `categoryId`
- Mejorados los tooltips para mostrar información dinámica desde el backend

## [2025-06-22] - Eliminación de columna y filtro de Método de Pago en la vista de Servicios

### Changed
- Eliminada la columna "Método de Pago" de la tabla de servicios
- Eliminado el filtro de método de pago en ServiceFilters
- Simplificado el componente ServiceList y ServiceTable para eliminar referencias a métodos de pago
- Reducido el código relacionado con la carga y filtrado de métodos de pago

## [2025-06-22] - Implementación de Cuentas para rastrear el origen de los egresos

### Added
- Creado nuevo modelo `Account` en el esquema de Prisma para almacenar cuentas bancarias, efectivo y tarjetas
- Actualizado el modelo `PaymentMethods` para vincularse con cuentas
- Creado servicio `accountService.js` para gestionar las operaciones CRUD de cuentas
- Creado controlador `accountController.js` para manejar las solicitudes HTTP
- Creadas rutas en `accountRoutes.js` para acceder a las operaciones de cuentas
- Nuevo componente `AccountManager.vue` para administrar cuentas en la interfaz
- Integrada la gestión de cuentas en la vista de configuraciones
- Modificados los componentes de pago para mostrar la cuenta asociada a cada método de pago
- Mejorada la UX al mostrar la cuenta origen en cada método de pago en los diálogos de pago

### Changed
- Actualizada la forma de mostrar métodos de pago para incluir la cuenta de origen
- Mejorada la pestaña de configuraciones para incluir la gestión de cuentas
- Actualizado el esquema de base de datos con migraciones para las nuevas relaciones

### Fixed
- Corregida la visualización de métodos de pago para mostrar información adicional de la cuenta

## [Unreleased]
### Added
- Endpoint `/income` para registrar ingresos en `accountRoutes.js`.
- Función `registerIncome` en `accountController.js`.
- Función `addIncome` en `accountService.js`.
- Modelo `Income` en `schema.prisma`.
- Migración `add-income-table`.
- Componente Vue `IncomeForm.vue` para registrar ingresos.
- Componente Vue `TransferForm.vue` para realizar transferencias entre cuentas.

### Changed
- Endpoint `/transfers` para crear transferencias entre cuentas en `accountRoutes.js`.
- Función `createTransfer` en `accountController.js`.
- Función `addTransfer` en `accountService.js`.
- Modelo `Transfer` en `schema.prisma`.
- Migración `add-transfer-table`.
- Actualización del modelo `Account` con relaciones para transferencias entrantes y salientes.

### Changed
- Refactorización de `IncomeForm.vue` y `TransferForm.vue` para utilizar `<script setup>` y `api.js` para las peticiones HTTP.
- Mejora en la estructura del código con la API de Composition de Vue 3.

## [2025-06-22] - Refactorización de FinanceManager

### Changed
- Refactorización de `FinanceManager.vue` para utilizar `<script setup>` y `api.js`.
- Añadida la ruta `/finance` en el router para acceder a la vista de gestión financiera.
- Agregado nuevo ítem en el sidebar para acceder a la vista de Finanzas.
