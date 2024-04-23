import React, { useState, useContext, useEffect } from "react";
import LocalVideo from "./LocalVideo.js";
import Button from "./Button.js";
import Select from "./Select.js";
import { getDevices } from "../util/mediaDevices.js";
import { LocalMediaContext } from "../contexts/LocalMediaContext.js";
import { StageContext } from "../contexts/StageContext.js";
import { BroadcastContext } from "../contexts/BroadcastContext.js";
import { useLocalMedia } from "../hooks/useLocalMedia.js";

export default function LocalMedia() {
  const {
    init,
    startBroadcast,
    stopBroadcast,
    broadcastStarted,
    updateStreamKey,
    messageConnection,
  } = useContext(BroadcastContext);
  const { audioDevices, videoDevices, updateLocalAudio, updateLocalVideo } =
    useContext(LocalMediaContext);
  const {
    joinStage,
    stageJoined,
    leaveStage,
    screenshareStageJoined,
    publishScreenshare,
    unpublishScreenshare,
    stageToken,
    setStageToken,
    handleSubcriberToPublisher,
    handlePublisherToSubcriber,
  } = useContext(StageContext);
  // This is for development purposes. It checks to see if we have a valid token saved in the session storage
  const cachedScreenshareStageToken = sessionStorage.getItem(
    "stage-screenshare-token"
  );
  const cachedIngestEndpoint = sessionStorage.getItem("ingest-endpoint");
  const cachedStreamKey = sessionStorage.getItem("stream-key");
  const [ingestEndpoint, setIngestEndpoint] = useState(
    cachedIngestEndpoint || ""
  );
  const [streamKey, setStreamKey] = useState(cachedStreamKey || "");
  const [screenshareToken, setScreenshareToken] = useState(
    cachedScreenshareStageToken || ""
  );
  

  function handleIngestChange(endpoint) {
    init(endpoint);
    setIngestEndpoint(endpoint);
  }

  function handleStreamKeyChange(key) {
    updateStreamKey(key);
    setStreamKey(key);
  }

  function joinOrLeaveStage() {
    if (stageJoined) {
      leaveStage();
    } else {
      joinStage(stageToken);
    }
  }

  function toggleScreenshare() {
    if (screenshareStageJoined) {
      unpublishScreenshare();
    } else {
      publishScreenshare(screenshareToken);
    }
  }

  function toggleBroadcast() {
    if (broadcastStarted) {
      stopBroadcast();
    } else {
      startBroadcast();
    }
  }

  useEffect(()=>{
    if(messageConnection){

      messageConnection.onmessage = (event) => {
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
            if (data["EventName"] === "DOUBT_ROOM_UNMUTE_PARTICIPANT") {
              console.log("DOUBT_ROOM_UNMUTE_PARTICIPANT", data);
              handleSubcriberToPublisher(data)
            } else if (data["EventName"] === "DOUBT_ROOM_MUTE_PARTICIPANT") {
              handlePublisherToSubcriber(data);
            }
            break;
          default:
            break;
        }
      };
    }
  },[messageConnection])

  return (
    <div className="row">
      
      <LocalVideo />
      <div className="column">
        <div className="row" style={{ marginTop: "2rem" }}>
          <div className="column">
            <label htmlFor="token">Token</label>
            <input
              type="text"
              value={stageToken}
              onChange={(e) => setStageToken(e.target.value)}
              id="token"
              name="token"
            />
          </div>
          <div
            className="column"
            style={{ display: "flex", marginTop: "1.5rem" }}
          >
            <Button onClick={joinOrLeaveStage}>
              {stageJoined ? "Leave" : "Join"}
            </Button>
          </div>
        </div>
        <div className="row">
          <div className="column">
            <label htmlFor="screenshare-token">Screenshare Token</label>
            <input
              type="text"
              id="screenshare-token"
              name="screenshare-token"
              value={screenshareToken}
              onChange={(e) => setScreenshareToken(e.target.value)}
            />
          </div>
          <div
            className="column"
            style={{ display: "flex", marginTop: "1.5rem" }}
          >
            <Button onClick={toggleScreenshare}>
              {screenshareStageJoined ? "Stop Screenshare" : "Screenshare"}
            </Button>
          </div>
        </div>
        <div className="row">
          <div className="column">
            <Select
              options={videoDevices}
              onChange={updateLocalVideo}
              title={"Select Webcam"}
            />
          </div>
          <div className="column">
            <Select
              options={audioDevices}
              onChange={updateLocalAudio}
              title={"Select Mic"}
            />
          </div>
        </div>
        <div className="row">
          <div className="column">
            <label htmlFor="ingest-endpoint">Ingest Endpoint</label>
            <input
              type="text"
              id="ingest-endpoint"
              name="ingest-endpoint"
              value={ingestEndpoint}
              onChange={(e) => handleIngestChange(e.target.value)}
            />
          </div>
          <div className="column">
            <label htmlFor="stream-key">Stream Key</label>
            <input
              type="text"
              id="stream-key"
              name="stream-key"
              value={streamKey}
              onChange={(e) => handleStreamKeyChange(e.target.value)}
            />
          </div>
        </div>
        <div className="row">
          <div
            className="column"
            style={{ display: "flex", marginTop: "1.5rem" }}
          >
            <Button onClick={toggleBroadcast}>
              {broadcastStarted ? "Stop Broadcast" : "Start Broadcast"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
