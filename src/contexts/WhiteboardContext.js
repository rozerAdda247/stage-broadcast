import React, { createContext } from "react";
import useWhiteboard from "../hooks/useWhiteboard";

export const WhiteboardContext = createContext({
  wbRef: undefined,
  wbBgColor: undefined,
  textToAdd: undefined,
  selectedShape: undefined,
  addLayer: undefined,
  handleDrawing: undefined,
  handleMouseDown: undefined,
  handleMouseMove: undefined,
  handleMouseUp: undefined,
  handleAddText: undefined,
  handleTextChange: undefined,
  handleAddShape: undefined,
  handleShapeSelect: undefined,
  selectPdf: undefined,
  loadPrevPage: undefined,
  loadNextPage: undefined,
  selectImage: undefined,
  elements: [],
  handleSaveAsPDF: async () => {},
  showWhiteBoard: undefined,
  setShowWhiteBoard: undefined,
});

export default function WhiteboardProvider({ children }) {
  const state = useWhiteboard();

  return (
    <WhiteboardContext.Provider value={state}>
      {children}
    </WhiteboardContext.Provider>
  );
}
