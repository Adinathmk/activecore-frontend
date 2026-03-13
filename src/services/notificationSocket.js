import { addNotification } from "@/features/notifications/notificationSlice";
import { toast } from "sonner";

let socket = null;
let reconnectTimeout = null;

const RECONNECT_DELAY = 3000; // 3 seconds

function getWebSocketURL() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;

  return `${protocol}//${host}/ws/notifications/`;
}

export const connectNotificationSocket = (dispatch) => {
  // Prevent duplicate connections
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    return;
  }

  const wsUrl =
    import.meta.env.VITE_WS_URL || getWebSocketURL();

  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected:", wsUrl);

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
      console.warn("WebSocket disconnected. Reconnecting...");
      scheduleReconnect(dispatch);
    };

  } catch (error) {
    console.error("WebSocket connection failed:", error);
    scheduleReconnect(dispatch);
  }
};

function scheduleReconnect(dispatch) {
  if (!reconnectTimeout) {
    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      connectNotificationSocket(dispatch);
    }, RECONNECT_DELAY);
  }
}

export const disconnectNotificationSocket = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (socket) {
    socket.onclose = null;
    socket.close();
    socket = null;
  }
};








