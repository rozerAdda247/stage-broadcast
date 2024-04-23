import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./components/Header.js";
import LocalMedia from "./components/LocalMedia.js";
import LocalMediaProvider from "./contexts/LocalMediaContext.js";
import BroadcastProvider from "./contexts/BroadcastContext.js";
import StageProvider from "./contexts/StageContext.js";
import StageParticipants from "./components/StageParticipants.js";
import MediaControls from "./components/MediaControls.js";
import WebSocketListener from "./components/WebSocketListener.js";

function App() {
  const [token, setToken] = useState(null);
  useEffect(() => {
    const TOKEN_EXPIRATION_IN_MINUTES = 55;

    // Token refresh delay
    // This client app will attempt to obtain a new token for the user 0.5 minutes
    // before it expires.
    const TOKEN_REFRESH_IN_MINUTES = TOKEN_EXPIRATION_IN_MINUTES - 0.5;
    const requestToken = (username, userId, scheduledid, chatArn) => {
      // Request a chat token for the current user
      const permissions = ["SEND_MESSAGE", "DELETE_MESSAGE", "DISCONNECT_USER"];
      const data = {
        scheduledid: scheduledid,
        roomIdentifier: chatArn,
        userId: userId,
        attributes: {
          username: username,
          avatar: "",
          role: "0",
        },
        capabilities: permissions,
        sessionDurationInMinutes: TOKEN_REFRESH_IN_MINUTES,
      };
      axios
        .post(
          `https://newadminui-k8s.adda247.com/api/v1/app/ivs/chat/create-token`,
          data
        )
        .then((response) => {
          setToken(response.data.data);
        })
        .catch((error) => {});
    };
    const arn = `arn:aws:ivschat:us-east-1:748804974185:room${window.location.pathname}`;
    // Get the current URL
    const urlParams = new URLSearchParams(window.location.search);
    // Get specific parameter values
    const name = urlParams.get("name");
    const sid = urlParams.get("id");
    window.sid = sid
    const vc = urlParams.get("vc");
    if(name && sid && vc){
      requestToken(name, sid, vc, arn);
    }
  }, []);

  return (
    <LocalMediaProvider>
      <BroadcastProvider token={token}>
        <StageProvider>
          <Header />
          <div className="content container">
            <LocalMedia />
            {/* <WebSocketListener token={token}/> */}
            <hr />
            <StageParticipants />
          </div>
          <hr />
          <MediaControls />
        </StageProvider>
      </BroadcastProvider>
    </LocalMediaProvider>
  );
}

export default App;
