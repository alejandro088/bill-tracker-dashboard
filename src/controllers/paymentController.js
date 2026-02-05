import { listPayments, getPaymentSummary, getPaymentTrends, deletePayment as deletePaymentService, editPayment as editPaymentService, addOneTimePayment } from '../services/paymentService.js';

export const history = async (req, res, next) => {
  try {
    const filters = {
      name: req.params.name,
      year: req.query.year,
      currency: req.query.currency,
      category: req.query.category
    };
    const payments = await listPayments(filters, req.user?.userId);
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

export const editPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = req.body;
    res.json(await editPaymentService(id, payment, req.user?.userId));
  } catch (err) {
    next(err);
  }
};

export const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    res.json(await deletePaymentService(id, req.user?.userId));
  } catch (err) {
    next(err);
  }
};

export const summary = async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    res.json(await getPaymentSummary(startDate, endDate, req.user?.userId));
  } catch (err) {
    next(err);
  }
};

export const trends = async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    res.json(await getPaymentTrends(startDate, endDate, req.user?.userId));
  } catch (err) {
    next(err);
  }
};

export const createOneTimePayment = async (req, res, next) => {
  try {
    const payment = req.body;
    
    // Verificar si el método de pago tiene una cuenta asociada con saldo suficiente
    if (payment.paymentMethodId) {
      const prisma = (await import('../db/prismaClient.js')).default;
      const paymentMethod = await prisma.paymentMethods.findUnique({
        where: { id: payment.paymentMethodId },
        include: { Account: true }
      });
      
      // Si el método de pago tiene una cuenta asociada, verificar el saldo
      if (paymentMethod?.Account && paymentMethod.Account.balance !== null) {
        const account = paymentMethod.Account;
        
        // Comprobar si hay saldo suficiente
        if (account.currency === payment.currency) {
          // Monedas iguales, comparación directa
          if (account.balance < payment.amount) {
            return res.status(400).json({
              error: 'Saldo insuficiente',
              message: `La cuenta "${account.name}" no tiene saldo suficiente para realizar este pago.`
            });
          }
        } else {
          // Monedas diferentes, necesitamos convertir
          let exchangeRate = 500; // Tasa por defecto ARS/USD
          
          if (payment.currency === 'USD' && account.currency === 'ARS') {
            // Calcular cuántos ARS necesitamos
            const amountInARS = payment.amount * exchangeRate;
            if (account.balance < amountInARS) {
              return res.status(400).json({
                error: 'Saldo insuficiente',
                message: `La cuenta "${account.name}" no tiene saldo suficiente para realizar este pago.`
              });
            }
          } else if (payment.currency === 'ARS' && account.currency === 'USD') {
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
    
    // Si llegamos aquí, podemos proceder con el pago
    res.json(await addOneTimePayment(payment, req.user?.userId));
  } catch (err) {
    next(err);
  }
};
