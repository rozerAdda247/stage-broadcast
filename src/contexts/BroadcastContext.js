import React, { createContext } from "react";
import useBroadcast from "../hooks/useBroadcast";
import useWebSocket from "../hooks/useWebSocket";

export const BroadcastContext = createContext({
  startBroadcast: undefined,
  stopBroadcast: undefined,
  broadcastStarted: false,
  addStream: undefined,
  removeStream: undefined,
  init: undefined,
  updateStreamKey: undefined,
});

export default function BroadcastProvider({ children, token }) {
  const state = useBroadcast();
  const {messageConnection} = useWebSocket(token)

  return (
    <BroadcastContext.Provider value={{ ...state, messageConnection }}>
      {children}
    </BroadcastContext.Provider>
  );
}
