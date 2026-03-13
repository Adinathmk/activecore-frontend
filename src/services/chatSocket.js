let chatSocket = null;

function getChatWebSocketURL() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = "localhost:8000"; // Django backend

  return `${protocol}//${host}/ws/chat/`;
}

export const connectChatSocket = (onMessage) => {
  if (chatSocket && chatSocket.readyState !== WebSocket.CLOSED) {
    return chatSocket;
  }

  const wsUrl =
    import.meta.env.VITE_CHAT_WS_URL || getChatWebSocketURL();

  chatSocket = new WebSocket(wsUrl);

  chatSocket.onopen = () => {
    console.log("Chat WebSocket connected");
  };

  chatSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("AI Response:", data);

      if (onMessage) {
        onMessage(data);
      }
    } catch (error) {
      console.error("Invalid JSON from socket:", error);
    }
  };

  chatSocket.onerror = (error) => {
    console.error("Chat WebSocket error:", error);
  };

  chatSocket.onclose = () => {
    console.warn("Chat WebSocket disconnected");
  };

  return chatSocket;
};

export const sendChatMessage = (message) => {
  if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
    chatSocket.send(
      JSON.stringify({
        message: message,
      })
    );
  } else {
    console.warn("WebSocket not connected");
  }
};

export const disconnectChatSocket = () => {
  if (chatSocket) {
    chatSocket.close();
    chatSocket = null;
  }
};