/**
 * Archiva un servicio (soft delete)
 * @param {string} id - ID del servicio
 * @returns {Promise<Object|null>} Servicio archivado o null
 */
export const archiveService = async (id, userId) => {
  try {
    validateString(id, 'id');
    if (!id) throw new ServiceError('ID de servicio requerido', 'validation');
    if (!userId) throw new ServiceError('userId requerido', 'validation');
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return null;
    if (existing.userId !== userId) {
      throw new ServiceError('Service not found', 'not_found');
    }
    return await prisma.service.update({
      where: { id },
      data: { archived: true }
    });
  } catch (error) {
    console.error('Error al archivar servicio:', error);
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('Error al archivar servicio', 'db');
  }
};

/**
 * Restaura un servicio previamente archivado
 * @param {string} id - ID del servicio
 * @returns {Promise<Object|null>} Servicio restaurado o null
 */
export const restoreService = async (id, userId) => {
  try {
    validateString(id, 'id');
    if (!id) throw new ServiceError('ID de servicio requerido', 'validation');
    if (!userId) throw new ServiceError('userId requerido', 'validation');
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return null;
    if (existing.userId !== userId) {
      throw new ServiceError('Service not found', 'not_found');
    }
    return await prisma.service.update({
      where: { id },
      data: { archived: false }
    });
  } catch (error) {
    console.error('Error al restaurar servicio:', error);
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('Error al restaurar servicio', 'db');
  }
};
// --- Clase de error personalizada ---
class ServiceError extends Error {
  constructor(message, type = 'general') {
    super(message);
    this.name = 'ServiceError';
    this.type = type;
  }
}
// --- Validaciones auxiliares ---
function validateString(value, name) {
  if (value && typeof value !== 'string') {
    throw new ServiceError(`${name} debe ser un string`, 'validation');
  }
}

function validateNumber(value, name) {
  if (value && isNaN(Number(value))) {
    throw new ServiceError(`${name} debe ser un número`, 'validation');
  }
}

function validateObject(value, name) {
  if (!value || typeof value !== 'object') {
    throw new ServiceError(`${name} debe ser un objeto`, 'validation');
  }
}

import prisma from '../db/prismaClient.js';
import { createNotification } from './notificationService.js';

/**
 * Construye el objeto de filtros para la consulta de servicios
 * @param {Object} query - Parámetros de búsqueda
 * @returns {Object} Objeto where para Prisma
 */
function buildServiceFilters(query = {}) {
  const { categoryId, recurrence, paymentMethodId, dueSoon } = query;
  const where = { };
  if (categoryId) where.categoryId = categoryId;
  if (recurrence) where.recurrence = recurrence;
  if (paymentMethodId) where.paymentMethodId = paymentMethodId;
  if (dueSoon) {
    const soon = new Date();
    soon.setDate(soon.getDate() + Number(dueSoon));
    where.bills = {
      some: {
        status: { not: 'paid' },
        dueDate: { lte: soon }
      }
    };
  }
  return where;
}

/**
 * Lista los servicios con filtros y paginación
 * @param {Object} query - Parámetros de búsqueda y paginación
 * @returns {Promise<Array>} Listado de servicios
 */
export const listServicesPaginated = async (query = {}, userId) => {
  try {
    if (!userId) throw new ServiceError('userId requerido', 'validation');
    const { limit = 20, offset = 0 } = query;
    const where = { ...buildServiceFilters(query), userId };
    const services = await prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: Number(offset),
      take: Number(limit),
      include: { 
        bills: { orderBy: { dueDate: 'desc' }, take: 5 },
        PaymentMethods: true
      }
    });
    return services.map((s) => ({ 
      ...s, 
      lastBill: s.bills[0] || null, 
      paymentMethodName: s.PaymentMethods?.name || null
    }));
  } catch (error) {
    console.error('Error al listar servicios:', error);
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('Error al listar servicios', 'db');
  }
};

export const listServices = async (query = {}, userId) => {
  // Validación de parámetros centralizada
  validateString(query.categoryId, 'categoryId');
  validateString(query.recurrence, 'recurrence');
  validateString(query.paymentMethodId, 'paymentMethodId');
  validateNumber(query.dueSoon, 'dueSoon');
  const { categoryId, recurrence, paymentMethodId, dueSoon } = query;
  const where = {  };
  if (categoryId) where.categoryId = categoryId;
  if (recurrence) where.recurrence = recurrence;
  if (paymentMethodId) where.paymentMethodId = paymentMethodId;
  if (dueSoon) {
    const soon = new Date();
    soon.setDate(soon.getDate() + Number(dueSoon));
    where.bills = {
      some: {
        status: { not: 'paid' },
        dueDate: { lte: soon }
      }
    };
  }
  try {
    if (!userId) throw new ServiceError('userId requerido', 'validation');
    const { limit = 20, offset = 0 } = query;
    const whereWithUser = { ...(where), userId };
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: whereWithUser,
        orderBy: { name: 'asc' },
        skip: Number(offset),
        take: Number(limit),
        include: { 
          bills: { orderBy: { dueDate: 'desc' }, take: 5 },
          Category: true,
          PaymentMethods: true
        }
      }),
      prisma.service.count({ where: whereWithUser })
    ]);
    return {
      data: services.map((s) => ({ 
        ...s, 
        lastBill: s.bills[0] || null, 
        paymentMethodName: s.PaymentMethods?.name || null
      })),
      total
    };
  } catch (error) {
    console.error('Error al listar servicios:', error);
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('Error al listar servicios', 'db');
  }
};

/**
 * Obtiene un servicio por su ID
 * @param {string} id - ID del servicio
 * @returns {Promise<Object|null>} Servicio encontrado o null
 */
export const getServiceById = async (id, userId) => {
  try {
    validateString(id, 'id');
    if (!id) throw new ServiceError('ID de servicio requerido', 'validation');
    if (!userId) throw new ServiceError('userId requerido', 'validation');
    return await prisma.service.findFirst({
      where: { id, userId },
      include: { 
        bills: { 
          include: { 
            payments: { 
              include: { PaymentMethods: true } 
            } 
          } 
        } 
      }
    });
  } catch (error) {
    console.error('Error al obtener servicio por ID:', error);
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('Error al obtener servicio', 'db');
  }
};

/**
 * Actualiza un servicio existente
 * @param {string} id - ID del servicio
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object|null>} Servicio actualizado o null
 */
export const updateService = async (id, data, userId) => {
  try {
    validateString(id, 'id');
    if (!id) throw new ServiceError('ID de servicio requerido', 'validation');
    validateObject(data, 'data');
    if (!userId) throw new ServiceError('userId requerido', 'validation');
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return null;
    if (existing.userId !== userId) {
      throw new ServiceError('Service not found', 'not_found');
    }
    return await prisma.service.update({ where: { id }, data });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('Error al actualizar servicio', 'db');
  }
};

export const createService = async (data, userId) => {
  try {
    validateObject(data, 'data');
    if (!data.name) throw new ServiceError('Datos de servicio incompletos o inválidos', 'validation');
    if (!userId) throw new ServiceError('userId requerido', 'validation');
    const createData = { ...data, userId };

    // If a categoryId was passed, use nested connect instead of scalar field
    if (createData.categoryId) {
      createData.Category = { connect: { id: createData.categoryId } };
      delete createData.categoryId;
    }

    // Remove transient bill fields so Prisma.service.create doesn't receive unknown args
    const transientFields = ['amount', 'currency', 'dueDate'];
    for (const f of transientFields) delete createData[f];

    // Create service
    const service = await prisma.service.create({ data: createData });

    // Helper: normalize incoming dueDate to UTC midnight date-only
    const normalizeToDateOnly = (dateInput) => {
      if (!dateInput) return null;
      const iso = typeof dateInput === 'string' ? dateInput : (dateInput instanceof Date ? dateInput.toISOString() : String(dateInput));
      const match = iso.match(/^(\d{4}-\d{2}-\d{2})/);
      if (!match) {
        const d = new Date(iso);
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      }
      const [year, month, day] = match[1].split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    };

    // Create initial bill only if amount provided
    let createdBill = null;
    if (data.amount && Number(data.amount) > 0) {
      const billData = {
        serviceId: service.id,
        amount: Number(data.amount),
        currency: data.currency || service.defaultCurrency || 'ARS',
        dueDate: normalizeToDateOnly(data.dueDate) || new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())),
        status: 'pending',
        userId: userId || service.userId || null
      };

      createdBill = await prisma.bill.create({ data: billData });
    }

    // Notification for new service
    await createNotification(`Nuevo servicio registrado: ${service.name}`, userId);

    // Notification for new bill (if created)
    if (createdBill) {
      try {
        const currency = (createdBill.currency || service.defaultCurrency || 'ARS');
        const formatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(createdBill.amount);
        const due = new Date(createdBill.dueDate).toLocaleDateString('es-ES');
        await createNotification(`Nueva factura registrada para ${service.name}: ${formatted} (vence: ${due})`, userId);
      } catch (err) {
        console.debug('createService: failed to create bill notification', err);
      }
    }

    // Return service with bills included
    return await prisma.service.findUnique({ where: { id: service.id }, include: { bills: true, Category: true } });

  } catch (error) {
    console.error('Error al crear servicio:', error);
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('Error al crear servicio', 'db');
  }
}