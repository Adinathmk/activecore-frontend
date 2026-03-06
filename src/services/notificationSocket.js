import { addNotification } from "@/features/notifications/notificationSlice";
import { toast } from "sonner";

let socket = null;
let reconnectTimeout = null;
const RECONNECT_DELAY = 3000; // 3 seconds

export const connectNotificationSocket = (dispatch) => {
  // Prevent duplicate connections
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    return;
  }

  // Use environment variable or fallback to localhost
  // Use environment variable or fallback to localhost
  const baseUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/notifications/";
  
  // Get token from localStorage
  const token = localStorage.getItem("access");
  const wsUrl = (token && token !== "undefined") ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;

  try {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("WebSocket connected to notifications");
      // Clear timeout if successfully connected
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        dispatch(addNotification(data));

        // Show a real-time toast
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
      console.log("WebSocket disconnected. Attempting to reconnect...");
      scheduleReconnect(dispatch);
    };
  } catch (error) {
    console.error("Failed to establish WebSocket connection:", error);
    scheduleReconnect(dispatch);
  }
};

const scheduleReconnect = (dispatch) => {
  if (!reconnectTimeout) {
    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      connectNotificationSocket(dispatch);
    }, RECONNECT_DELAY);
  }
};

export const disconnectNotificationSocket = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  if (socket) {
    socket.onclose = null; // Prevent auto-reconnect trigger on manual disconnect
    socket.close();
    socket = null;
  }
};
