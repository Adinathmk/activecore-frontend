import axiosInstance from "@/services/axiosInstance";
import {
  AUTH_ADMIN_ENDPOINTS,
  PRODUCT_ADMIN_ENDPOINTS,
  ORDER_ADMIN_ENDPOINTS,
} from "./admin.endpoints";

// --- Auth Admin APIs ---
export const fetchAdminUsersApi = (search = '') => {
  if (search) {
    return axiosInstance.get(`${AUTH_ADMIN_ENDPOINTS.SEARCH_USERS}?name=${search}`);
  }
  return axiosInstance.get(AUTH_ADMIN_ENDPOINTS.LIST_USERS);
};

export const deleteAdminUserApi = (id) =>
  axiosInstance.delete(AUTH_ADMIN_ENDPOINTS.DELETE(id));

export const toggleBlockAdminUserApi = (id) =>
  axiosInstance.patch(AUTH_ADMIN_ENDPOINTS.TOGGLE_BLOCK(id));

// --- Product Admin APIs ---
export const fetchAdminProductsApi = (search = '') => {
  if (search) {
    return axiosInstance.get(`${PRODUCT_ADMIN_ENDPOINTS.SEARCH_PRODUCTS}?search=${search}`);
  }
  return axiosInstance.get(PRODUCT_ADMIN_ENDPOINTS.LIST_CREATE);
};

export const createAdminProductApi = (data) =>
  axiosInstance.post(PRODUCT_ADMIN_ENDPOINTS.LIST_CREATE, data);

export const fetchAdminProductDetailApi = (id) =>
  axiosInstance.get(PRODUCT_ADMIN_ENDPOINTS.DETAIL(id));

export const updateAdminProductApi = (id, data) =>
  axiosInstance.patch(PRODUCT_ADMIN_ENDPOINTS.DETAIL(id), data); // Using PATCH for partial updates

export const deleteAdminProductApi = (id) =>
  axiosInstance.delete(PRODUCT_ADMIN_ENDPOINTS.DETAIL(id));

export const fetchAdminCategoriesApi = () =>
  axiosInstance.get(PRODUCT_ADMIN_ENDPOINTS.CATEGORIES);

export const createAdminCategoryApi = (data) =>
  axiosInstance.post(PRODUCT_ADMIN_ENDPOINTS.CATEGORIES, data);

export const fetchAdminProductTypesApi = () =>
  axiosInstance.get(PRODUCT_ADMIN_ENDPOINTS.PRODUCT_TYPES);

export const createAdminProductTypeApi = (data) =>
  axiosInstance.post(PRODUCT_ADMIN_ENDPOINTS.PRODUCT_TYPES, data);

// --- Inventory Admin APIs ---
export const fetchAdminVariantsApi = (search = '', productId = null) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (productId) params.append('product_id', productId);
  
  const queryString = params.toString();
  const url = queryString 
      ? `${PRODUCT_ADMIN_ENDPOINTS.VARIANTS_LIST_CREATE}?${queryString}` 
      : PRODUCT_ADMIN_ENDPOINTS.VARIANTS_LIST_CREATE;
  return axiosInstance.get(url);
};

export const createAdminVariantApi = (data) =>
  axiosInstance.post(PRODUCT_ADMIN_ENDPOINTS.VARIANTS_LIST_CREATE, data);

export const updateAdminVariantApi = (id, data) =>
  axiosInstance.patch(PRODUCT_ADMIN_ENDPOINTS.VARIANTS_DETAIL(id), data);

export const deleteAdminVariantApi = (id) =>
  axiosInstance.delete(PRODUCT_ADMIN_ENDPOINTS.VARIANTS_DETAIL(id));

// --- Order Admin APIs ---
export const fetchAdminOrdersApi = (search = '', status = 'All') => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status && status !== 'All') params.append('status', status.toUpperCase());

  const queryString = params.toString();
  const baseUrl = search ? ORDER_ADMIN_ENDPOINTS.SEARCH_ORDERS : ORDER_ADMIN_ENDPOINTS.LIST;
  const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
  return axiosInstance.get(url);
};

export const updateAdminOrderStatusApi = (id, data) =>
  axiosInstance.patch(ORDER_ADMIN_ENDPOINTS.UPDATE_STATUS(id), data);

export const fetchAdminOrderStatsApi = () =>
  axiosInstance.get(ORDER_ADMIN_ENDPOINTS.STATS);
