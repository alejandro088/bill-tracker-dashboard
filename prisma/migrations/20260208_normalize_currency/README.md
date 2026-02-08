# Normalización de campos de moneda

**Fecha:** 2026-02-08  
**Tipo:** Normalización de esquema

## Cambios

1. **Transfer.currency**: Cambiar de `String` a tipo `Currency` (enum)
2. **Income.currency**: Añadir campo `Currency` con valor por defecto `ARS`

## Objetivo

Normalizar el manejo de monedas en toda la aplicación:
- Usar consistentemente el enum `Currency` en todos los modelos
- Facilitar validación y prevenir errores de tipo
- Mejorar agrupación por moneda en resúmenes

## Instrucciones

Ejecutar el SQL manualmente:

```bash
mysql -u [usuario] -p [nombre_db] < migration.sql
```

O usar Prisma:

```bash
npx prisma db push
```

Luego regenerar el cliente:

```bash
npx prisma generate
```
