import axios from "@/services/axiosInstance";

export const fetchNotificationsRequest = () => {
  return axios.get("/api/notifications/");
};

export const markNotificationsAsReadRequest = () => {
  return axios.post("/api/notifications/mark-read/");
};
export const sendGlobalNotificationRequest = (message) => {
  return axios.post("/api/notifications/send/", { message });
};

export const sendUserNotificationRequest = (user_id, message) => {
  return axios.post("/api/notifications/send-user/", { user_id, message });
};
