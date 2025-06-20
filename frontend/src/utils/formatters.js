export const statusColor = (status) => {
  const colors = {
    paid: 'success',
    pending: 'warning',
    overdue: 'error'
  };
  return colors[status] || 'grey';
};

export const statusIcon = (status) => {
  const icons = {
    paid: 'mdi-check-circle',
    pending: 'mdi-clock-outline',
    overdue: 'mdi-alert-circle'
  };
  return icons[status] || 'mdi-help-circle';
};

export const formatAmount = (amount, currency = 'ARS') => {
  const options = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', options).format(amount);
  }
  return new Intl.NumberFormat('es-AR', options).format(amount);
};

export const formatAmountWithCurrency = (amount, currency = 'ARS') => {
  return formatAmount(amount, currency);
};

export const formatDateRelative = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} día${days > 1 ? 's' : ''} atrás`;
  if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
  if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
  return `${seconds} segundo${seconds > 1 ? 's' : ''} atrás`;
};