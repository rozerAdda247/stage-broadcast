import { useState, useRef, useContext, useEffect } from "react";
import axios from "axios";
import IVSBroadcastClient from "amazon-ivs-web-broadcast";
import { LocalMediaContext } from "../contexts/LocalMediaContext.js";
import { BroadcastContext } from "../contexts/BroadcastContext.js";
import Strategy from "../util/strategy.js";
const { Stage, StageConnectionState, StageEvents } = window.IVSBroadcastClient;
const {
  Stage: Stage$1,
  StageConnectionState: StageConnectionState$1,
  StageEvents: StageEvents$1,
  SubscribeType: SubscribeType$1,
} = window.IVSBroadcastClient;

// export default function useStage() {
//   const [stageJoined, setStageJoined] = useState(false);
//   const [participants, setParticipants] = useState(new Map());
//   const [localParticipant, setLocalParticipant] = useState({});
//   const { currentVideoDevice, currentAudioDevice } =
//     useContext(LocalMediaContext);
//   const { addStream, removeStream } = useContext(BroadcastContext);

//   const stageRef = useRef(undefined);
//   const strategyRef = useRef(
//     new Strategy(currentAudioDevice, currentVideoDevice)
//   );

//   useEffect(() => {
//     strategyRef.current.updateMedia(currentAudioDevice, currentVideoDevice);
//     if (stageRef.current && stageJoined) {
//       stageRef.current.refreshStrategy();
//       console.log(stageRef.current, "::::: refreshStrategy :::::");
//     }
//   }, [currentAudioDevice, currentVideoDevice, stageJoined]);

//   const handleParticipantJoin = (participantInfo) => {
//     if (isLocalParticipant(participantInfo)) {
//       setLocalParticipant(participantInfo);
//     } else {
//       const participant = createParticipant(participantInfo);
//       // NOTE: we must make a new map so react picks up the state change
//       setParticipants(new Map(participants.set(participant.id, participant)));
//     }
//   };

//   const handleParticipantLeave = (participantInfo) => {
//     if (isLocalParticipant(participantInfo)) {
//       setLocalParticipant({});
//     } else {
//       if (participants.delete(participantInfo.id)) {
//         setParticipants(new Map(participants));
//       }
//     }
//   };

//   const handleMediaAdded = (participantInfo, streams) => {
//     const { id } = participantInfo;
//     // add the media to the broadcast
//     addStream(id, streams);
//     if (!isLocalParticipant(participantInfo)) {
//       let participant = participants.get(id);
//       participant = {
//         ...participant,
//         streams: [...streams, ...participant.streams],
//       };
//       setParticipants(new Map(participants.set(id, participant)));
//     }
//   };

//   const handleMediaRemoved = (participantInfo, streams) => {
//     const { id } = participantInfo;
//     // remove media from the broadcast
//     removeStream(id, streams);
//     if (!isLocalParticipant(participantInfo)) {
//       let participant = participants.get(id);
//       const newStreams = participant.streams.filter(
//         (existingStream) =>
//           !streams.find(
//             (removedStream) => existingStream.id === removedStream.id
//           )
//       );
//       participant = { ...participant, streams: newStreams };
//       setParticipants(new Map(participants.set(id, participant)));
//     }
//   };

//   const handleParticipantMuteChange = (participantInfo, stream) => {
//     if (!isLocalParticipant(participantInfo)) {
//       const { id } = participantInfo;
//       let participant = participants.get(id);
//       participant = { ...participant, ...participantInfo };
//       setParticipants(new Map(participants.set(id, participant)));
//     }
//   };

//   const handleConnectionStateChange = (state) => {
//     if (state === StageConnectionState.CONNECTED) {
//       setStageJoined(true);
//     } else if (state === StageConnectionState.DISCONNECTED) {
//       setStageJoined(false);
//     }
//   };

//   function leaveStage() {
//     if (stageRef.current) {
//       stageRef.current.leave();
//     }
//   }

//   async function joinStage(token) {
//     if (!token) {
//       alert("Please enter a token to join a stage");
//       return;
//     }
//     try {
//       const stage = new Stage(token, strategyRef.current);
//       stage.on(
//         StageEvents.STAGE_CONNECTION_STATE_CHANGED,
//         handleConnectionStateChange
//       );
//       stage.on(StageEvents.STAGE_PARTICIPANT_JOINED, handleParticipantJoin);
//       stage.on(StageEvents.STAGE_PARTICIPANT_LEFT, handleParticipantLeave);
//       stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, handleMediaAdded);
//       stage.on(
//         StageEvents.STAGE_PARTICIPANT_STREAMS_REMOVED,
//         handleMediaRemoved
//       );
//       stage.on(
//         StageEvents.STAGE_STREAM_MUTE_CHANGED,
//         handleParticipantMuteChange
//       );

//       stageRef.current = stage;

//       await stageRef.current.join();

//       // If we are able to join we know we have a valid token so lets cache it
//       sessionStorage.setItem("stage-token", token);
//     } catch (err) {
//       console.error("Error joining stage", err);
//       alert(`Error joining stage: ${err.message}`);
//     }
//   }

//   return { joinStage, stageJoined, leaveStage, participants };
// }

function createParticipant(participantInfo) {
  return {
    ...participantInfo,
    streams: [],
  };
}

function isLocalParticipant(info) {
  return info.isLocal;
}

export default function useStage() {
  const cachedStageToken = sessionStorage.getItem("stage-token");
  const [stageToken, setStageToken] = useState(cachedStageToken || "");
  const [stageJoined, setStageJoined] = useState(false);
  const [participants, setParticipants] = useState(new Map());
  const [localParticipant, setLocalParticipant] = useState({});
  const { currentVideoDevice, currentAudioDevice } =
    useContext(LocalMediaContext);
  const { addStream, removeStream, messageConnection } =
    useContext(BroadcastContext);
  const stageRef = useRef(undefined);
  const strategyRef = useRef(
    new Strategy(currentAudioDevice, currentVideoDevice)
  );
  useEffect(() => {
    strategyRef.current.updateMedia(currentAudioDevice, currentVideoDevice);

    if (stageRef.current && stageJoined) {
      stageRef.current.refreshStrategy();
      console.log(stageRef.current, "::::: participantInfo :::::");
    }
  }, [currentAudioDevice, currentVideoDevice, stageJoined]);

  const handleParticipantJoin = (participantInfo) => {
    console.log(participantInfo)
    try {
      if (isLocalParticipant(participantInfo)) {
        setLocalParticipant(participantInfo);
        const data = `{
        "action": "SEND_MESSAGE",
        "content":"SUBSCRIBER_DETAILS",
        "attributes": {
          "message_type":"SUBSCRIBER_DETAILS",
          "avatar": "${participantInfo.attributes.avatar}",
          "sst_isScreenshare": "${participantInfo.attributes.isScreenshare}",
          "sst_liveLatency": "${participantInfo.attributes.liveLatency}",
          "sst_role": "${participantInfo.attributes.role}",
          "sst_sheduledid": "${participantInfo.attributes.sheduledid}",
          "sst_teacher_screenshare": "${participantInfo.attributes.teacher_screenshare}",
          "sst_teacher_video": "${participantInfo.attributes.teacher_video}",
          "sst_timestamp": "${participantInfo.attributes.timestamp}",
          "sst_topicName": "${participantInfo.attributes.topicName}",
          "sst_userId": "${participantInfo.attributes.userId}",
          "sst_username": "${participantInfo.attributes.username}",
          "ss_audioMuted": "${participantInfo.audioMuted}",
          "ss_id": "${participantInfo.id}",
          "ss_isLocal": "${participantInfo.isLocal}",
          "ss_isPublishing": "${participantInfo.isPublishing}",
          "ss_userId": "${participantInfo.userId}",
          "ss_userInfo": "",
          "ss_videoStopped": "${participantInfo.videoStopped}"
        }
      }`;
        window.messageConnection?.send(data);
      } else {
        const participant = createParticipant(participantInfo); // NOTE: we must make a new map so react picks up the state change
        setParticipants(new Map(participants.set(participant.id, participant)));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleParticipantLeave = (participantInfo) => {
    if (isLocalParticipant(participantInfo)) {
      setLocalParticipant({});
    } else {
      if (participants.delete(participantInfo.id)) {
        setParticipants(new Map(participants));
      }
    }
  };

  const handlewebRTCStats = async (stream) => {
    try {
      const streamPromise = stream.map(async (stream) => {
        stream
          .getStats(null)
          .then((dat) => console.log(dat))
          .catch((err) => console.log(err));
        return stream.requestRTCStats();
      });
      let stats = await Promise.all(streamPromise);
      // console.log(stats, "::::: handlewebRTCStats :::::");
      return stats;
    } catch (error) {
      // Unable to retrieve stats
      console.log(error);
      return null;
    }
  };

  const handleMediaAdded = (participantInfo, streams) => {
    // handlewebRTCStats(streams)
    //   .then((__data__) => {
    //     console.log(__data__);
    //   })
    //   .catch((__error__) => {
    //     console.log(__error__);
    //   });
    const { id } = participantInfo; // add the media to the broadcast
    addStream(id, streams);

    if (!isLocalParticipant(participantInfo)) {
      let participant = participants.get(id);
      participant = {
        ...participant,
        streams: [...streams, ...participant.streams],
      };
      setParticipants(new Map(participants.set(id, participant)));
    }
  };

  const handleMediaRemoved = (participantInfo, streams) => {
    const { id } = participantInfo; // remove media from the broadcast
    removeStream(id, streams);
    if (!isLocalParticipant(participantInfo)) {
      let participant = participants.get(id);
      const newStreams = participant.streams.filter(
        (existingStream) =>
          !streams.find(
            (removedStream) => existingStream.id === removedStream.id
          )
      );
      participant = { ...participant, streams: newStreams };
      setParticipants(new Map(participants.set(id, participant)));
    }
  };

  const handleParticipantMuteChange = (participantInfo, stream) => {
    if (!isLocalParticipant(participantInfo)) {
      const { id } = participantInfo;
      let participant = participants.get(id);
      participant = { ...participant, ...participantInfo };
      setParticipants(new Map(participants.set(id, participant)));
    }
  };

  const handleConnectionStateChange = (state) => {
    if (state === StageConnectionState$1.CONNECTED) {
      setStageJoined(true);
    } else if (state === StageConnectionState$1.DISCONNECTED) {
      setStageJoined(false);
    }
  };

  function leaveStage() {
    if (stageRef.current) {
      stageRef.current.leave();
    }
  }

  async function createParticipantToken(capabilities, isSetToken = false) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      // Get specific parameter values
      const name = urlParams.get("name");
      const sid = urlParams.get("id");
      const vc = urlParams.get("vc");
      const stage_id = urlParams.get("stage_id")
      const url =
        "https://newadminui-k8s.adda247.com/api/v1/app/ivs/stages/createParticipantToken";
      const body = {
        stageArn: `arn:aws:ivs:us-east-1:748804974185:stage/${stage_id}`,
        attributes: {
          username: name,
          userId: sid,
          role: "STUDENT",
          sheduledid: vc,
          topicName: "",
          isScreenshare: "false",
          avatar: "",
          liveLatency: "",
          timestamp: "",
          teacher_screenshare: "false",
          teacher_video: "false",
        },
        capabilities: capabilities,
        duration: 2400,
        userId: sid,
        role: "STUDENT",
        userInfo: {
          username: name,
          userId: sid,
          role: "STUDENT",
          sheduledid: vc,
          topicName: "",
        },
      };
      const { data } = await axios.post(url, { ...body });
      if(isSetToken === true){
        setStageToken(data.data.participantToken.token);
      };
      return data.data.participantToken.token;
    } catch (error) {
      alert("Unable to create token")
    }
  }

  async function joinStage(token) {
    if (!token) {
      alert("Please enter a token to join a stage");
      return;
    }

    try {
      const stage = new Stage$1(token, strategyRef.current);
      stage.on(
        StageEvents$1.STAGE_CONNECTION_STATE_CHANGED,
        handleConnectionStateChange
      );
      stage.on(StageEvents$1.STAGE_PARTICIPANT_JOINED, handleParticipantJoin);
      stage.on(StageEvents$1.STAGE_PARTICIPANT_LEFT, handleParticipantLeave);
      stage.on(
        StageEvents$1.STAGE_PARTICIPANT_PUBLISH_STATE_CHANGED,
        (participantInfo, state) => {
          console.log(participantInfo);
        }
      );
      stage.on(
        StageEvents$1.STAGE_PARTICIPANT_SUBSCRIBE_STATE_CHANGED,
        (participantInfo, state) => {
          console.log(participantInfo);
        }
      );
      stage.on(StageEvents$1.STAGE_PARTICIPANT_STREAMS_ADDED, handleMediaAdded);
      stage.on(
        StageEvents$1.STAGE_PARTICIPANT_STREAMS_REMOVED,
        handleMediaRemoved
      );
      stage.on(
        StageEvents$1.STAGE_STREAM_MUTE_CHANGED,
        handleParticipantMuteChange
      );
      stageRef.current = stage;
      await stageRef.current.join(); // If we are able to join we know we have a valid token so lets cache it

      sessionStorage.setItem("stage-token", token);
    } catch (err) {
      console.error("Error joining stage", err);
      alert(`Error joining stage: ${err.message}`);
    }
  }
  const handleSubcriberToPublisher = async (data) => {
    if (parseInt(window.sid) === parseInt(data["Attributes"]["userId"])) {
      leaveStage();
      const tkn = await createParticipantToken(["PUBLISH", "SUBSCRIBE"]);
      setStageToken(tkn);
      debugger
      joinStage(tkn);
    }
  };
  const handlePublisherToSubcriber = async (data) => {
    leaveStage();
    const tkn = await createParticipantToken(["SUBSCRIBE"]);
    setStageToken(tkn);
    joinStage(tkn);
  };

  return {
    joinStage,
    stageJoined,
    leaveStage,
    participants,
    createParticipantToken,
    handleSubcriberToPublisher,
    handlePublisherToSubcriber,
    stageToken,
    setStageToken,
  };
}
