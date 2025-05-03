export const API_BASE_URL = 'http://localhost:8080/api';

export const BOOKING_STATUS = {
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED'
};

export const PAYMENT_METHODS = [
  { id: 'CREDIT_CARD', name: 'Credit Card' },
  { id: 'DEBIT_CARD', name: 'Debit Card' },
  { id: 'UPI', name: 'UPI' },
  { id: 'NET_BANKING', name: 'Net Banking' }
];

export const STATUS_COLORS = {
  [BOOKING_STATUS.PAYMENT_PENDING]: 'bg-yellow-100 text-yellow-800',
  [BOOKING_STATUS.CONFIRMED]: 'bg-green-100 text-green-800',
  [BOOKING_STATUS.CANCELLED]: 'bg-red-100 text-red-800'
};