import React, { createContext, useState, useEffect, useRef } from "react";
import useStage from "../hooks/useStage";
import useScreenshareStage from "../hooks/useScreenShareStage";

const defaultStageContext = {
  joinStage: undefined,
  participants: [],
  stageConnected: false,
  createParticipantToken: undefined,
  stageToken: undefined,
  setStageToken: undefined,
  handleSubcriberToPublisher: undefined,
  handlePublisherToSubcriber: undefined,
};

const defaultScreenshareStageContext = {
  screenshareStage: undefined,
  joinScreenshareStage: undefined,
  screenshareStageConnected: false,
};

export const StageContext = createContext({
  ...defaultStageContext,
  ...defaultScreenshareStageContext,
});

export default function StageProvider({ children }) {
  const {
    joinStage,
    stageJoined,
    leaveStage,
    participants,
    createParticipantToken,
    stageToken,
    setStageToken,
    handleSubcriberToPublisher,
    handlePublisherToSubcriber,
  } = useStage();
  const { publishScreenshare, unpublishScreenshare, screenshareStageJoined } =
    useScreenshareStage();

  const state = {
    joinStage,
    stageJoined,
    leaveStage,
    participants,
    screenshareStageJoined,
    publishScreenshare,
    unpublishScreenshare,
    createParticipantToken,
    stageToken,
    setStageToken,
    handleSubcriberToPublisher,
    handlePublisherToSubcriber,
  };

  return (
    <StageContext.Provider value={state}>{children}</StageContext.Provider>
  );
}
