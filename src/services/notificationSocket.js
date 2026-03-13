import { addNotification } from "@/features/notifications/notificationSlice";
import { toast } from "sonner";

let socket = null;
let reconnectTimeout = null;

const BASE_DELAY = 3000; // 3s
const MAX_RECONNECT_ATTEMPTS = 3;

let reconnectAttempts = 0;

function getWebSocketURL() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;

  return `${protocol}//${host}/ws/notifications/`;
}

export const connectNotificationSocket = (dispatch) => {

  // Prevent duplicate connection
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    return;
  }

  const wsUrl = import.meta.env.VITE_WS_URL || getWebSocketURL();

  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected:", wsUrl);

      // reset reconnect attempts
      reconnectAttempts = 0;

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        dispatch(addNotification(data));

        if (data.message) {
          toast.info(data.message, {
            description: "New Notification Received",
          });
        }

      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.warn("WebSocket disconnected");
      scheduleReconnect(dispatch);
    };

  } catch (error) {
    console.error("WebSocket connection failed:", error);
    scheduleReconnect(dispatch);
  }
};

function scheduleReconnect(dispatch) {

  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error("Max WebSocket reconnect attempts reached. Stopping reconnect.");
    return;
  }

  if (!reconnectTimeout) {

    reconnectAttempts++;

    const delay = BASE_DELAY * reconnectAttempts; // exponential backoff

    console.log(
      `Reconnecting WebSocket in ${delay / 1000}s (attempt ${reconnectAttempts})`
    );

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      connectNotificationSocket(dispatch);
    }, delay);
  }
}

export const disconnectNotificationSocket = () => {

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  reconnectAttempts = 0;

  if (socket) {
    socket.onclose = null;
    socket.close();
    socket = null;
  }
};