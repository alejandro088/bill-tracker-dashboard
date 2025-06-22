import {
  listBills,
  getBillById,
  addBill,
  updateBill,
  deleteBill,
  getUpcomingBills,
  getSummaryWithCurrency
} from '../services/billService.js';

export const getAll = async (req, res, next) => {
  try {
    res.json(await listBills(req.query));
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const bill = await getBillById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const bill = await addBill(req.body);
    res.status(201).json(bill);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    // Si se está marcando como pagada y tiene pagos asociados con métodos de pago
    // verificamos que las cuentas asociadas tengan saldo suficiente
    if (req.body.status === 'paid' && req.body.payments && req.body.payments.length > 0) {
      const prisma = (await import('../db/prismaClient.js')).default;
      
      // Obtener la factura actual para conocer su moneda
      const currentBill = await prisma.bill.findUnique({
        where: { id: req.params.id }
      });
      
      // Verificar el saldo de cada cuenta asociada a los métodos de pago
      for (const payment of req.body.payments) {
        if (!payment.paymentMethodId) continue;
        
        const paymentMethod = await prisma.paymentMethods.findUnique({
          where: { id: payment.paymentMethodId },
          include: { Account: true }
        });
        
        if (paymentMethod?.Account && paymentMethod.Account.balance !== null) {
          const account = paymentMethod.Account;
          const currency = payment.currency || currentBill.currency;
          
          // Verificar si hay saldo suficiente
          if (account.currency === currency) {
            // Monedas iguales, comparación directa
            if (account.balance < payment.amount) {
              return res.status(400).json({
                error: 'Saldo insuficiente',
                message: `La cuenta "${account.name}" no tiene saldo suficiente para realizar este pago.`
              });
            }
          } else {
            // Monedas diferentes, necesitamos convertir
            let exchangeRate = payment.exchangeRate || 500; // Usar la tasa proporcionada o una por defecto
            
            if (currency === 'USD' && account.currency === 'ARS') {
              // Calcular cuántos ARS necesitamos
              const amountInARS = payment.amount * exchangeRate;
              if (account.balance < amountInARS) {
                return res.status(400).json({
                  error: 'Saldo insuficiente',
                  message: `La cuenta "${account.name}" no tiene saldo suficiente para realizar este pago.`
                });
              }
            } else if (currency === 'ARS' && account.currency === 'USD') {
              // Calcular cuántos USD necesitamos
              const amountInUSD = payment.amount / exchangeRate;
              if (account.balance < amountInUSD) {
                return res.status(400).json({
                  error: 'Saldo insuficiente',
                  message: `La cuenta "${account.name}" no tiene saldo suficiente para realizar este pago.`
                });
              }
            }
          }
        }
      }
    }
    
    const result = await updateBill(req.params.id, req.body);
    if (!result) return res.status(404).json({ message: 'Bill not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteBill(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const getUpcoming = async (req, res, next) => {
  try {
    const bills = await getUpcomingBills();
    res.json(bills);
  } catch (err) {
    next(err);
  }
};

export const getSummaryStats = async (req, res, next) => {
  try {
    const summary = await getSummaryWithCurrency();
    res.json(summary);
  } catch (err) {
    next(err);
  }
};
