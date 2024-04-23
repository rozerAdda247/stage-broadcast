import { useEffect, useContext, useState } from "react";
import useStage from "./useStage";
import { StageContext } from "../contexts/StageContext";
const useWebSocket = (token) => {
  const [messageConnection, setMessageConnection] = useState(null);
  const initConnection = async (_token) => {
    const connectionInit = new WebSocket(
      "wss://edge.ivschat.us-east-1.amazonaws.com",
      _token
    );

    connectionInit.onopen = () => {
      console.log("connected");
    };

    connectionInit.onclose = () => {};

    connectionInit.onerror = (event) => {
      console.log(event, "message_error");
    };

    connectionInit.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const eventType = data["Type"];
      console.log("socket_message", eventType, data);
      // const _d = {
      //   Type: "EVENT",
      //   Id: "buC7u6mYvKhq",
      //   RequestId: "1266d09b-20b9-4f22-aa74-9abded01dfff",
      //   EventName: "DOUBT_ROOM_UNMUTE_PARTICIPANT",
      //   Attributes: {
      //     avatar: "",
      //     isScreenshare: "false",
      //     liveLatency: "",
      //     role: "STUDENT",
      //     sheduledid: "348369",
      //     teacher_screenshare: "false",
      //     teacher_video: "false",
      //     timestamp: "1713849879",
      //     topicName: "",
      //     userId: "4721",
      //     username: "Rozer Student-2",
      //   },
      //   SendTime: "2024-04-23T08:16:12.929110536Z",
      // };
      switch (eventType) {
        case "EVENT":
          if (data["EventName"] === "DOUBT_ROOM_UNMUTE_PARTICIPANT"){
            
          } else {
            
          }
          break;
        default:
          break;
      }
    };
    window.messageConnection = connectionInit
    setMessageConnection(connectionInit);
  };

  useEffect(() => {
    if (token) {
      initConnection(token);
    }
  }, [token]);
  // Include token in the dependency array if it might change

  // Return the message connection
  return { messageConnection };
};
export default useWebSocket;
