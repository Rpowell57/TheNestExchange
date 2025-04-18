import { useEffect } from "react";

export default function NotificationListener({ userId }) {
  useEffect(() => {
    if (!userId) return;

    // Determine WebSocket URL: use environment variable or fallback to localhost
    const wsProtocol = import.meta.env.VITE_USE_WSS === 'true' || window.location.protocol === "https:" ? "wss" : "ws";
    const host = import.meta.env.VITE_WS_HOST || "localhost:8000";
    const wsUrl = `${wsProtocol}://${host}/ws/notifications/${userId}`;

    console.log("Connecting to WebSocket at", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log("WebSocket connection established");
    ws.onmessage = (event) => {
      alert(event.data); // replace with a toast if you prefer
    };
    ws.onerror = (error) => console.error("WebSocket error:", error);

    return () => {
      ws.close();
    };
  }, [userId]);

  return null;
}
