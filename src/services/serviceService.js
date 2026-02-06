import prisma from '../db/prismaClient.js';
import { ValidationError } from '../errors/httpErrors.js';
import { createNotification } from './notificationService.js';

/**
 * Archiva un servicio (soft delete)
 * @param {string} id - ID del servicio
 * @returns {Promise<Object|null>} Servicio archivado o null
 */
export const archiveService = async (id, userId) => {
  
    validateString(id, 'id');
    if (!id) throw new ValidationError('ID de servicio requerido');
    if (!userId) throw new ValidationError('userId requerido');
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return null;
    if (existing.userId !== userId) {
      throw new ValidationError('Service not found');
    }
    return await prisma.service.update({
      where: { id },
      data: { archived: true }
    });
  
};

/**
 * Restaura un servicio previamente archivado
 * @param {string} id - ID del servicio
 * @returns {Promise<Object|null>} Servicio restaurado o null
 */
export const restoreService = async (id, userId) => {
    validateString(id, 'id');
    if (!id) throw new ValidationError('ID de servicio requerido');
    if (!userId) throw new ValidationError('userId requerido');
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return null;
    if (existing.userId !== userId) {
      throw new ValidationError('Service not found');
    }
    return await prisma.service.update({
      where: { id },
      data: { archived: false }
    });
  
};

// --- Validaciones auxiliares ---
function validateString(value, name) {
  if (value && typeof value !== 'string') {
    throw new ValidationError(`${name} debe ser una cadena de texto`);
  }
}

function validateNumber(value, name) {
  if (value && isNaN(Number(value))) {
    throw new ValidationError(`${name} debe ser un número`);
  }
}

function validateObject(value, name) {
  if (!value || typeof value !== 'object') {
    throw new ValidationError(`${name} debe ser un objeto`);
  }
}

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
    if (!userId) throw new ValidationError('userId requerido');
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
    if (!userId) throw new ValidationError('userId requerido');
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
};

/**
 * Obtiene un servicio por su ID
 * @param {string} id - ID del servicio
 * @returns {Promise<Object|null>} Servicio encontrado o null
 */
export const getServiceById = async (id, userId) => {
    validateString(id, 'id');
    if (!id) throw new ValidationError('ID de servicio requerido');
    if (!userId) throw new ValidationError('userId requerido');
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
};

/**
 * Actualiza un servicio existente
 * @param {string} id - ID del servicio
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object|null>} Servicio actualizado o null
 */
export const updateService = async (id, data, userId) => {
    validateString(id, 'id');
    if (!id) throw new ValidationError('ID de servicio requerido');
    validateObject(data, 'data');
    if (!userId) throw new ValidationError('userId requerido');
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) return null;
    if (existing.userId !== userId) {
      throw new ServiceError('Service not found', 'not_found');
    }
    return await prisma.service.update({ where: { id }, data });
};

export const createService = async (data, userId) => {
  
    validateObject(data, 'data');
    if (!data.name) throw new ValidationError('Datos de servicio incompletos o inválidos');
    if (!userId) throw new ValidationError('userId requerido');
    const createData = { ...data, userId };

    // If a categoryId was passed, use nested connect instead of scalar field
    if (createData.categoryId) {
      createData.Category = { connect: { id: createData.categoryId } };
      delete createData.categoryId;
    }

    // If a userId was passed, connect the User relation instead of passing scalar
    if (createData.userId) {
      createData.User = { connect: { id: createData.userId } };
      delete createData.userId;
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
    await createNotification({
      type: 'info',
      title: 'Nuevo servicio registrado',
      message: `Nuevo servicio registrado: ${service.name}`,
      actionUrl: `/services/${service.id}`
    }, userId);

    // Notification for new bill (if created)
    if (createdBill) {
      try {
        const currency = (createdBill.currency || service.defaultCurrency || 'ARS');
        const formatted = new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(createdBill.amount);
        const due = new Date(createdBill.dueDate).toLocaleDateString('es-ES');
        await createNotification({
          type: 'info',
          title: `Nueva factura para ${service.name}`,
          message: `Nueva factura registrada para ${service.name}: ${formatted} (vence: ${due})`,
          actionUrl: `/bills/${createdBill.id}`
        }, userId);
      } catch (err) {
        console.debug('createService: failed to create bill notification', err);
      }
    }

    // Return service with bills included
    return await prisma.service.findUnique({ where: { id: service.id }, include: { bills: true, Category: true } });

  
}