import useWebSocket from "../hooks/useWebSocket"; // Path to your custom hook

function WebSocketListener({token}) {
  useWebSocket(token);
  return null;
}

export default WebSocketListener;
