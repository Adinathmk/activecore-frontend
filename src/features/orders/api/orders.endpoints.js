import { API_BASE } from "@/services/apiBase";

export const ORDER_ENDPOINTS = {
  CHECKOUT: `${API_BASE}/orders/checkout/`,
  LIST: `${API_BASE}/orders/`,
  DETAIL: (id) => `${API_BASE}/orders/${id}/`,
  CANCEL: (id) => `${API_BASE}/orders/${id}/cancel/`,
  ACCOUNT_OVERVIEW: `${API_BASE}/orders/account-overview/`,
  CREATE_PAYMENT_INTENT: (id) =>
    `${API_BASE}/orders/${id}/create-payment-intent/`,
};