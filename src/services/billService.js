import prisma from '../db/prismaClient.js';
import { addPayment } from './paymentService.js';

// Constantes
export const BILL_STATUS = {
    PAID: 'paid',
    PENDING: 'pending',
    OVERDUE: 'overdue'
};

export const RECURRENCE_TYPES = {
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    BIMONTHLY: 'bimonthly',
    YEARLY: 'yearly',
    NONE: 'none'
};

// Funciones auxiliares
const calculateNextDueDate = (currentDueDate, recurrence) => {
    const due = new Date(currentDueDate);
    const recurrenceMap = {
        [RECURRENCE_TYPES.WEEKLY]: () => due.setDate(due.getDate() + 7),
        [RECURRENCE_TYPES.BIMONTHLY]: () => due.setMonth(due.getMonth() + 2),
        [RECURRENCE_TYPES.YEARLY]: () => due.setFullYear(due.getFullYear() + 1),
        [RECURRENCE_TYPES.MONTHLY]: () => due.setMonth(due.getMonth() + 1),
    };
    
    recurrenceMap[recurrence]?.();
    return due;
};

const handleAutoRenewal = async (bill) => {
    if (bill.category !== 'subscriptions' || !bill.autoRenew) {
        return null;
    }

    const due = calculateNextDueDate(bill.dueDate, bill.recurrence);
    return prisma.bill.create({
        data: {
            serviceId: bill.serviceId,
            amount: bill.amount,
            category: bill.category,
            dueDate: due,
            status: BILL_STATUS.PENDING,
            autoRenew: bill.autoRenew,
            recurrence: bill.recurrence || RECURRENCE_TYPES.NONE,
        },
    });
};

const updateOverdueBills = async () => {
    await prisma.bill.updateMany({
        where: {
            dueDate: { lt: new Date() },
            NOT: { status: { in: ['paid', 'overdue'] } },
        },
        data: { status: 'overdue' },
    });
};

/**
 * Lista las facturas con filtros y paginación
 * @param {Object} query - Parámetros de búsqueda y paginación
 * @param {string} [query.search] - Término de búsqueda
 * @param {string} [query.category] - Categoría de factura
 * @param {string} [query.status] - Estado de la factura
 * @param {string} [query.recurrence] - Tipo de recurrencia
 * @param {string} [query.serviceId] - ID del servicio
 * @param {string} [query.sort='dueDate'] - Campo de ordenamiento
 * @param {number} [query.page=1] - Número de página
 * @param {number} [query.limit=10] - Límite de resultados por página
 * @returns {Promise<{total: number, page: number, limit: number, data: Array}>}
 */
export const listBills = async (query = {}) => {
    try {
        await updateOverdueBills();
        
        const {
            search,
            category,
            status,
            serviceId,
            recurrence,
            sort = 'dueDate',
            page = 1,
            limit = 10,
        } = query;

        // Construir condiciones de búsqueda
        const searchCondition = search ? {
            OR: [
                { Service: { name: { contains: search, mode: 'insensitive' } } },
                { Service: { description: { contains: search, mode: 'insensitive' } } }
            ]
        } : {};

        const filters = {
            ...searchCondition,
            ...(category && { category }),
            ...(status && { status }),
            ...(recurrence && { recurrence }),
            ...(serviceId && { serviceId })
        };

        // Obtener total y datos
        const total = await prisma.bill.count({ where: filters });
        const data = await prisma.bill.findMany({
            where: filters,
            orderBy: { [sort]: 'asc' },
            skip: (page - 1) * limit,
            take: Number(limit),
            include: { Service: true, payments: true },
        });

        // Mapear resultados
        const mapped = data.map((bill) => ({
            ...bill,
            name: bill.Service?.name,
            description: bill.Service?.description,
            payments: bill.payments,
            Service: undefined,
        }));

        return { 
            total, 
            page: Number(page), 
            limit: Number(limit), 
            data: mapped 
        };
    } catch (error) {
        console.error('Error listing bills:', error);
        throw new Error(`Failed to list bills: ${error.message}`);
    }
};

export const getBillById = async (id) => {
    const bill = await prisma.bill.findUnique({
        where: { id },
        include: { Service: true, payments: true },
    });
    if (!bill) return null;
    return {
        ...bill,
        name: bill.Service?.name,
        description: bill.Service?.description,
        payments: bill.payments,
        Service: undefined,
    };
};

export const addBill = async (data) => {
    let serviceId = data.serviceId;
    if (!serviceId) {
        let service = await prisma.service.findFirst({
            where: {
                name: data.name,
                category: data.category,
            },
        });
        if (!service) {
            service = await prisma.service.create({
                data: {
                    name: data.name,
                    description: data.description,
                    category: data.category,
                    recurrence: data.recurrence || 'none',
                    autoRenew: data.autoRenew ?? false,
                },
            });
        }
        serviceId = service.id;
    }

    const { name, description, ...billData } = data;
    return prisma.bill.create({
        data: {
            status: 'pending',
            autoRenew: data.autoRenew ?? false,
            recurrence: data.recurrence || 'none',
            serviceId,
            amount: data.amount,
            dueDate: data.dueDate || new Date(),
            category: data.category || 'other',
        },
    });
};

/**
 * Actualiza una factura existente y maneja la auto-renovación si corresponde
 * @param {string} id - ID de la factura a actualizar
 * @param {Object} data - Datos de la factura a actualizar
 * @returns {Promise<{updated: Object, newBill: Object|null}>}
 */
export const updateBill = async (id, data) => {
    try {
        const existing = await prisma.bill.findUnique({ where: { id } });
        if (!existing) {
            throw new Error(`Bill with id ${id} not found`);
        }

        const { name, description, payments, ...rest } = data;
        const updateData = { ...rest };

        const justPaid = data.status === BILL_STATUS.PAID && existing.status !== BILL_STATUS.PAID;
        if (!justPaid) {
            return { newBill: null };
        }

        // Actualizamos la bill
        const updated = await prisma.bill.update({
            where: { id },
            data: updateData,
        });

        // Procesar pagos
        await handlePayments(updated, data);

        // Crear notificación
        await createPaymentNotification(updated);

        // Manejar auto-renovación
        const newBill = await handleAutoRenewal(updated);

        return { updated, newBill };
    } catch (error) {
        console.error('Error updating bill:', error);
        throw new Error(`Failed to update bill: ${error.message}`);
    }
};

const handlePayments = async (bill, data) => {
    const paidAt = new Date().toISOString();
    const paymentsArr =
        Array.isArray(data.payments) && data.payments.length
            ? data.payments
            : [
                  {
                      amount: bill.amount,
                      paymentProvider: data.paymentProvider || 'unknown',
                  },
              ];

    await prisma.payment.createMany({
        data: paymentsArr.map((p) => ({
            billId: bill.id,
            amount: p.amount,
            paidAt,
            paymentProvider: p.paymentProvider || 'unknown',
        })),
        skipDuplicates: true,
    });
};

const createPaymentNotification = async (bill) => {
    await prisma.notification.create({
        data: {
            message: `Factura pagada: ${bill.serviceId} ($${bill.amount})`,
        },
    });
};

export const deleteBill = async (id) => {
    await prisma.bill.delete({ where: { id } });
    return true;
};

export const getUpcomingBills = async () => {
    const now = new Date();
    const limit = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const bills = await prisma.bill.findMany({
        where: { dueDate: { gte: now, lte: limit } },
        include: { Service: true },
    });
    return bills;
};

export const getMonthlySummary = async () => {
    await updateOverdueBills();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const bills = await prisma.bill.findMany({
        where: { dueDate: { gte: start, lt: end } },
    });

    const summary = { paid: 0, pending: 0, overdue: 0 };
    bills.forEach((bill) => {
        summary[bill.status] += bill.amount;
    });
    return summary;
};

export const getMonthlyStatusByMonth = async (
    year = new Date().getFullYear()
) => {
    await updateOverdueBills();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const bills = await prisma.bill.findMany({
        where: { dueDate: { gte: start, lt: end } },
        select: { dueDate: true, status: true, amount: true },
    });
    const map = {};
    bills.forEach((b) => {
        const month = b.dueDate.toISOString().slice(0, 7);
        const key = `${month}-${b.status}`;
        if (!map[key])
            map[key] = { month, status: b.status, total: 0, count: 0 };
        map[key].total += b.amount;
        map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
};

export const getSummary = async () => {
    await updateOverdueBills();
    const grouped = await prisma.bill.groupBy({
        by: ['status'],
        _sum: { amount: true },
    });
    const summary = { paid: 0, pending: 0, overdue: 0 };
    grouped.forEach((g) => {
        summary[g.status] = g._sum.amount ?? 0;
    });
    return summary;
};
