import express from 'express';
import * as accountController from '../controllers/accountController.js';

const router = express.Router();

// Rutas CRUD básicas
router.get('/', accountController.getAllAccounts);
router.get('/:id', accountController.getAccountById);
router.post('/', accountController.createAccount);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

// Rutas para gestionar vinculación de métodos de pago
router.post('/link-payment-method', accountController.linkPaymentMethod);
router.delete('/unlink-payment-method/:paymentMethodId', accountController.unlinkPaymentMethod);

// Ruta para obtener balances
router.get('/balance/summary', accountController.getBalances);

export default router;
