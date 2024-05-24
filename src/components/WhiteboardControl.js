import React, { useContext, useEffect, useState } from "react";
import Button from "./Button.js";
import { WhiteboardContext } from "../contexts/WhiteboardContext.js";
import { StageContext } from "../contexts/StageContext.js";

export default function WhiteboardControls() {
  const { showWhiteBoard, setShowWhiteBoard, wbRef } =
    useContext(WhiteboardContext);
  const { unpublishScreenshare, publishScreenshare, screenshareStageJoined } =
    useContext(StageContext);
  const [screenshareToken, setScreenshareToken] = useState("");
  
  function toggleScreenshare() {
    if (screenshareStageJoined) {
      unpublishScreenshare();
    } else {
      publishScreenshare(screenshareToken, true);
    }
  }
  useEffect(() => {
    console.log(wbRef.current, "::: wbRef.current :::");
    if (showWhiteBoard) {
      toggleScreenshare();
    }
  }, [wbRef.current, showWhiteBoard]);
  return (
    <div className="container">
      <div className="row">
        <div className="column">
          <label htmlFor="screenshare-token">Whiteboard Token</label>
          <input
            type="text"
            id="screenshare-token"
            name="screenshare-token"
            value={screenshareToken}
            onChange={(e) => setScreenshareToken(e.target.value)}
          />
        </div>
      </div>
      <div className="row">
        <div className="column mb-4">
          <Button onClick={() => setShowWhiteBoard((ps) => !ps)}>
            {showWhiteBoard ? "Hide Whiteboard" : "Show Whiteboard "}
          </Button>
          <br />
          <br />
          <br />
        </div>
      </div>
    </div>
  );
}
