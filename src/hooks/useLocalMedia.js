import { useState } from "react";
import IVSBroadcastClient from "amazon-ivs-web-broadcast";
import { getCamera, getMic } from "../util/mediaDevices.js";

export function useLocalMedia() {
  const { LocalStageStream, StreamType } = window.IVSBroadcastClient;
  const [localVideo, setLocalVideo] = useState(undefined);
  const [localAudio, setLocalAudio] = useState(undefined);
  const [screenshare, setScreenshare] = useState(undefined);

  function createScreenshare(track) {
    if (!track) {
      setScreenshare(undefined);
      return;
    }
    setScreenshare(new LocalStageStream(track));
    console.log(new LocalStageStream(track), ":::: createScreenshare ::::");
  }

  async function setLocalVideoFromId(id) {
    const videoTrack = await getCamera(id);
    createLocalStream(videoTrack);
  }

  async function setLocalAudioFromId(id) {
    const audioTrack = await getMic(id);
    createLocalStream(audioTrack);
  }

  function createLocalStream(track) {
    if (!track) {
      console.warn("tried to set local media with a null track");
      return;
    }
    const stream = new LocalStageStream(track);
    if (stream.streamType === StreamType.VIDEO) {
      setLocalVideo(stream);
    } else {
      setLocalAudio(stream);
    }
  }

  return {
    localAudio,
    localVideo,
    screenshare,
    setLocalAudio: setLocalAudioFromId,
    setLocalVideo: setLocalVideoFromId,
    setScreenshare: createScreenshare,
  };
}
