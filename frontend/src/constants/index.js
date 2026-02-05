// Currencies supported by the application
export const CURRENCIES = {
    ARS: 'ARS',
    USD: 'USD',
};

// List of currencies for dropdowns and filters
export const CURRENCY_LIST = Object.values(CURRENCIES);

// All currencies including 'All' option for filters
export const CURRENCY_FILTER_OPTIONS = ['Todas', ...CURRENCY_LIST];

// Payment methods supported by the application
export const PAYMENT_METHODS = {
    VISA: 'Visa',
    MASTERCARD: 'Mastercard',
    AMERICAN_EXPRESS: 'American Express',
    MERCADO_PAGO: 'MercadoPago',
    PAYPAL: 'PayPal',
    DEBIT_AUTOMATIC: 'Débito automático',
    BANK_TRANSFER: 'Transferencia bancaria',
    CASH: 'Efectivo',
    GOOGLE_PLAY: 'Google Play',
    OTHER: 'Otro',
};

// List of payment methods for dropdowns
export const PAYMENT_METHOD_LIST = Object.values(PAYMENT_METHODS);

// Icons mapping for different payment methods
export const PAYMENT_METHOD_ICONS = {
    [PAYMENT_METHODS.CASH]: 'mdi-cash',
    [PAYMENT_METHODS.VISA]: 'mdi-credit-card-visa',
    [PAYMENT_METHODS.MASTERCARD]: 'mdi-credit-card-mastercard',
    [PAYMENT_METHODS.AMERICAN_EXPRESS]: 'mdi-credit-card-amex',
    [PAYMENT_METHODS.MERCADO_PAGO]: 'mdi-cash-multiple',
    [PAYMENT_METHODS.PAYPAL]: 'mdi-paypal',
    [PAYMENT_METHODS.GOOGLE_PLAY]: 'mdi-google-play',
    [PAYMENT_METHODS.DEBIT_AUTOMATIC]: 'mdi-credit-card-chip',
    [PAYMENT_METHODS.OTHER]: 'mdi-help-circle-outline',
};

// Default currency for new bills/services
export const DEFAULT_CURRENCY = CURRENCIES.ARS;

// Helper function to get payment method icon
export const getPaymentMethodIcon = (method) =>
    PAYMENT_METHOD_ICONS[method] || 'mdi-cash';

// Currency formatting options
export const CURRENCY_FORMAT_OPTIONS = {
    [CURRENCIES.ARS]: { style: 'currency', currency: 'ARS' },
    [CURRENCIES.USD]: { style: 'currency', currency: 'USD' },
};

// Helper function to format amount with currency
export const formatAmount = (amount, currency = DEFAULT_CURRENCY) => {
    return new Intl.NumberFormat(
        'es-AR',
        CURRENCY_FORMAT_OPTIONS[currency]
    ).format(amount);
};
// Las categorías ahora se cargan desde la API (/categories).
// Eliminamos las categorías hardcodeadas para que la UI use las definidas en la base de datos.
// Si algún componente necesita información sobre categorías (colores, íconos),
// debe solicitar `/categories` y mapear los campos `name`, `color`, `icon`, `description`.
