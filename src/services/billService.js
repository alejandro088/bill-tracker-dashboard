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
    // Ensure we have the full bill loaded (include Service to check its autoRenew)
    const billFull = bill.Service ? bill : await prisma.bill.findUnique({ where: { id: bill.id }, include: { Service: { include: { Category: true } } } });
    if (!billFull) {
        console.debug('handleAutoRenewal: billFull not found for', bill?.id);
        return null;
    }

    // Determine whether auto-renew is enabled on the parent service (service is source of truth)
    const serviceAuto = billFull.Service?.autoRenew;
    const autoEnabled = !!serviceAuto;
    if (!autoEnabled) {
        console.debug('handleAutoRenewal: autoRenew disabled for', billFull.id, 'serviceAuto=', serviceAuto);
        return null;
    }

    // Create the next bill using the Service recurrence (the service is the source of truth for recurrence)
    const serviceRecurrence = billFull.Service?.recurrence || 'none';
    const due = calculateNextDueDate(billFull.dueDate, serviceRecurrence);
    console.debug('handleAutoRenewal: creating next bill for', billFull.id, 'due:', due.toISOString(), 'serviceAuto=', serviceAuto);
    const created = await prisma.bill.create({
        data: {
            serviceId: billFull.serviceId,
            amount: billFull.amount,
            currency: billFull.currency,
            dueDate: due,
            status: BILL_STATUS.PENDING,
            userId: billFull.userId || billFull.Service?.userId || null,
        },
    });
    console.debug('handleAutoRenewal: created bill', created.id);
    return created;
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

export const listBills = async (query = {}, userId = null) => {
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
            ...(status && { status }),
            ...(serviceId && { serviceId }),
            ...(userId && { userId })
        };

        // Cuando se filtra por recurrencia, aplicarla sobre el Service (el servicio es la fuente de la recurrencia)
        if (recurrence) {
            filters.Service = { ...(filters.Service || {}), recurrence };
        }

        // Resolve category (can be id or name) -> apply filter on Service.categoryId
        if (category) {
            const cat = await prisma.category.findFirst({ where: { OR: [{ id: category }, { name: category }] } });
            if (!cat) {
                return { total: 0, page: Number(page), limit: Number(limit), data: [] };
            }
            filters.Service = { ...(filters.Service || {}), categoryId: cat.id };
        }

        // Obtener total y datos
        const total = await prisma.bill.count({ where: filters });
        const data = await prisma.bill.findMany({
            where: filters,
            orderBy: { [sort]: 'asc' },
            skip: (page - 1) * limit,
            take: Number(limit),
            include: { Service: { include: { Category: true } }, payments: true },
        });

        // Mapear resultados
        const mapped = data.map((bill) => ({
            ...bill,
            name: bill.Service?.name,
            description: bill.Service?.description,
            payments: bill.payments,
            category: bill.Service?.Category?.name || null,
            recurrence: bill.Service?.recurrence || 'none',
            Service: undefined,
            // Category removed from Bill; use Service.Category instead
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

export const getBillById = async (id, userId = null) => {
    const where = { id };
    if (userId) where.userId = userId;
    const bill = await prisma.bill.findFirst({
        where,
        include: { Service: { include: { Category: true } }, payments: true }
    });

    if (!bill) return null;

    return {
        ...bill,
        name: bill.Service?.name,
        description: bill.Service?.description,
        payments: bill.payments,
        category: bill.Service?.Category?.name || null,
        recurrence: bill.Service?.recurrence || 'none',
        Service: undefined,
    };
};

export const addBill = async (data, userId = null) => {
    let serviceId = data.serviceId;
    let serviceName = data.name;

    // Resolve category into categoryId (accepts id or name)
    let categoryId = null;
    if (data.category) {
        const cat = await prisma.category.findFirst({ where: { OR: [{ id: data.category }, { name: data.category }] } });
        if (cat) categoryId = cat.id;
        else {
            const created = await prisma.category.create({ data: { name: data.category } });
            categoryId = created.id;
        }
    }

    let serviceObj = null;
    if (!serviceId) {
        const service = await prisma.service.findFirst({
            where: {
                name: data.name,
                ...(categoryId && { categoryId }),
            },
        });
        if (!service) {
            serviceObj = await prisma.service.create({
                data: {
                    name: data.name,
                    description: data.description,
                    categoryId: categoryId || null,
                    recurrence: data.recurrence || 'none',
                    autoRenew: data.autoRenew ?? false,
                    userId: userId
                },
            });

            // Notificación de nuevo servicio
            await prisma.notification.create({
                data: {
                    message: `Nuevo servicio registrado: ${serviceObj.name}`,
                    read: false,
                    title: 'Nuevo Servicio',
                    userId: userId || serviceObj.userId || null
                }
            });
        } else {
            serviceObj = service;
        }
        serviceId = serviceObj.id;
        serviceName = serviceObj.name;
    } else {
        // Si se proporcionó serviceId, obtenemos el nombre y flags del servicio
        serviceObj = await prisma.service.findUnique({
            where: { id: serviceId },
            select: { name: true, autoRenew: true, recurrence: true }
        });
        serviceName = serviceObj?.name;
    }

    const { name, description, ...billData } = data;
    // Las facturas son hechos concretos y ya no almacenan `recurrence` ni `categoryId`.
    // La categoría y recurrencia provienen del Service relacionado.
    const bill = await prisma.bill.create({
        data: {
            status: 'pending',
            serviceId,
            amount: data.amount,
            dueDate: data.dueDate || new Date(),
            userId: userId
        },
    });

    // Notificación de nueva factura
    await prisma.notification.create({
        data: {
            message: `Nueva factura registrada para ${serviceName}: ${new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
            }).format(bill.amount)} (vence: ${new Date(bill.dueDate).toLocaleDateString('es-ES')})`,
            read: false,
            title: 'Nueva Factura',
            userId: userId || bill.userId || null

        }
    });

    return bill;
};

/**
 * Actualiza una factura existente y maneja la auto-renovación si corresponde
 * @param {string} id - ID de la factura a actualizar
 * @param {Object} data - Datos de la factura a actualizar
 * @returns {Promise<{updated: Object, newBill: Object|null}>}
 */
export const updateBill = async (id, data, userId = null) => {
    try {
        const existing = await prisma.bill.findUnique({ where: { id } });
        if (!existing) {
            throw new Error(`Bill with id ${id} not found`);
        }
        if (userId && existing.userId !== userId) {
            throw new Error(`Bill with id ${id} not found`);
        }

        const { name, description, payments, ...rest } = data;
        const updateData = { ...rest };
        // Remove fields that no longer exist on Bill model
        delete updateData.category;
        delete updateData.recurrence;
        delete updateData.categoryId;

                // Debug logs

        // Actualizamos la bill
        const updated = await prisma.bill.update({
            where: { id },
            data: updateData,
        });

                try {
                    console.debug('updateBill: updated', updated.id);
                } catch (e) {}

        const justPaid = data.status === BILL_STATUS.PAID && existing.status !== BILL_STATUS.PAID;
                console.debug('updateBill: justPaid', id, justPaid, 'existing.status', existing.status, 'incoming.status', data.status);
        if (!justPaid) {
            return { newBill: null };
        }

        // Procesar pagos (pasar userId para asociar los pagos correctamente)
        await handlePayments(updated, data, userId);

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

const handlePayments = async (bill, data, userId = null) => {
    const paidAt = new Date().toISOString();
    const paymentsArr =
        Array.isArray(data.payments) && data.payments.length
            ? data.payments
            : [
                  {
                      amount: bill.amount,
                      paymentMethodId: data.paymentMethodId || null,
                  },
              ];

    // Crear los pagos
    const createdPayments = await prisma.payment.createMany({
        data: paymentsArr.map((p) => ({
            billId: bill.id,
            amount: p.amount,
            paidAt,
            paymentMethodId: p.paymentMethodId || null,
            exchangeRate: p.exchangeRate || null,
            currency: p.currency || bill.currency,
            userId: userId || bill.userId || null
        })),
        skipDuplicates: true,
    });
    
    // Actualizar los saldos de las cuentas asociadas a los métodos de pago
    for (const payment of paymentsArr) {
        if (!payment.paymentMethodId) continue;
        
        // Buscar el método de pago y la cuenta asociada
        const paymentMethod = await prisma.paymentMethods.findUnique({
            where: { id: payment.paymentMethodId },
            include: { Account: true }
        });
        
        // Si el método de pago no tiene cuenta asociada, no hacemos nada
        if (!paymentMethod || !paymentMethod.Account) continue;
        
        const account = paymentMethod.Account;
        
        // Si la cuenta no tiene saldo registrado, no podemos actualizar
        if (account.balance === null) continue;
        
        const currency = payment.currency || bill.currency;
        
        // Si las monedas coinciden, simplemente restamos
        if (account.currency === currency) {
            await prisma.account.update({
                where: { id: account.id },
                data: { balance: account.balance - payment.amount }
            });
        } else {
            // Si las monedas son diferentes, usamos la tasa de cambio proporcionada o una por defecto
            let exchangeRate = payment.exchangeRate || 500; // Tasa por defecto ARS/USD
            
            let newBalance;
            if (currency === 'USD' && account.currency === 'ARS') {
                // Convertir USD a ARS y restar
                newBalance = account.balance - (payment.amount * exchangeRate);
            } else if (currency === 'ARS' && account.currency === 'USD') {
                // Convertir ARS a USD y restar
                newBalance = account.balance - (payment.amount / exchangeRate);
            }
            
            await prisma.account.update({
                where: { id: account.id },
                data: { balance: newBalance }
            });
        }
    }
};

const createPaymentNotification = async (bill) => {
    // Ensure we have bill with service to determine user ownership
    const billFull = await prisma.bill.findUnique({ where: { id: bill.id }, include: { Service: true } });
    const uid = billFull?.userId || billFull?.Service?.userId;
    if (!uid) {
        console.debug('createPaymentNotification: no userId found for bill', bill.id, 'skipping notification');
        return;
    }

    await prisma.notification.create({
        data: {
            message: `Factura pagada: ${bill.serviceId} ($${bill.amount})`,
            title: 'Factura Pagada',
            userId: uid
        },
    });
};

export const deleteBill = async (id, userId = null) => {
    // Ensure bill belongs to user if userId provided
    if (userId) {
        const existing = await prisma.bill.findUnique({ where: { id }, include: { Service: true } });
        if (!existing) throw new Error('Bill not found');
        // Allow deletion when either the bill or its parent service belongs to the user
        const ownerId = existing.userId || existing.Service?.userId || null;
        if (ownerId !== userId) {
            throw new Error('Bill not found');
        }
    }
    await prisma.bill.delete({ where: { id } });
    return true;
};

export const getUpcomingBills = async (userId = null) => {
    const now = new Date();
    const limit = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const where = { dueDate: { gte: now, lte: limit } };
    if (userId) where.userId = userId;
    const bills = await prisma.bill.findMany({
        where,
        include: { Service: true },
    });
    return bills;
};

export const getMonthlySummary = async (userId = null) => {
    await updateOverdueBills();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const where = { dueDate: { gte: start, lt: end } };
    if (userId) where.userId = userId;
    const bills = await prisma.bill.findMany({
        where,
    });

    const summary = { paid: 0, pending: 0, overdue: 0 };
    bills.forEach((bill) => {
        summary[bill.status] += bill.amount;
    });
    return summary;
};

export const getMonthlyStatusByMonth = async (
    year = new Date().getFullYear(),
    userId = null
) => {
    await updateOverdueBills();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    const where = { dueDate: { gte: start, lt: end } };
    if (userId) where.userId = userId;
    const bills = await prisma.bill.findMany({
        where,
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

// Nueva función para obtener el resumen por moneda
const getSummaryWithCurrency = async (userId = null) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const where = {
        OR: [
            { status: BILL_STATUS.PAID, paidAt: { gte: startDate } },
            { status: BILL_STATUS.PENDING },
            { status: BILL_STATUS.OVERDUE }
        ],
        ...(userId && { userId })
    };

    const bills = await prisma.bill.findMany({ where });

    const summary = {
        ars: { paid: 0, pending: 0, overdue: 0 },
        usd: { paid: 0, pending: 0, overdue: 0 }
    };

    bills.forEach(bill => {
        const currency = (bill.currency || 'ARS').toLowerCase();
        const amount = bill.amount || 0;

        if (bill.status === BILL_STATUS.PAID && bill.paidAt >= startDate) {
            summary[currency].paid += amount;
        } else if (bill.status === BILL_STATUS.PENDING) {
            summary[currency].pending += amount;
        } else if (bill.status === BILL_STATUS.OVERDUE) {
            summary[currency].overdue += amount;
        }
    });

    return summary;
};

export { getSummaryWithCurrency };
