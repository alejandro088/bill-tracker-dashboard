# Modularización del componente ServiceList y funcionalidad de edición

## Descripción
Esta PR introduce una modularización mejorada del componente ServiceList, manteniendo la estructura original de la tabla y agregando la funcionalidad de edición de servicios.

### Cambios principales
- ✨ Nuevo botón de edición en la tabla de servicios
- 🆕 Componente EditServiceForm con validación de campos
- 🔄 Integración con la API para actualizar servicios
- 📦 Modularización mejorada manteniendo la estructura original:
  - ServiceHeader: encabezado y botón de nuevo servicio
  - ServiceFilters: filtros de búsqueda y selección
  - ServiceDueSoonSwitch: switch de próximos vencimientos
  - ServiceTable: tabla principal con todas las columnas originales
- 📝 Documentación actualizada (CHANGELOG.md y nuevo HISTORY.md)

### Detalles técnicos
- Mantiene exactamente las mismas columnas y estructura de la tabla original
- Mejora la separación de responsabilidades (smart vs dumb components)
- ServiceList.vue actúa como contenedor inteligente manejando el estado
- Los componentes hijos son puramente presentacionales
- Formulario de edición con validación completa de campos

### Testing
- ✅ Verificada la estructura original de la tabla
- ✅ Probada la funcionalidad de edición
- ✅ Validada la integración entre componentes
- ✅ Comprobado el manejo de estado y eventos

### Screenshots
[Aquí puedes agregar capturas de pantalla mostrando el antes y después]

### Notas de revisión
- La modularización mantiene la misma funcionalidad pero mejora la mantenibilidad
- El formulario de edición está preparado para futuras extensiones
- Se mantiene la consistencia visual con el resto de la aplicación

## Breaking Changes
No hay cambios que rompan la compatibilidad. Esta es una mejora puramente estructural y de funcionalidad.

## Checklist
- [x] Código probado localmente
- [x] Documentación actualizada
- [x] CHANGELOG.md actualizado
- [x] HISTORY.md creado y actualizado
- [x] Sin conflictos con main
