import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import rough from "roughjs/bundled/rough.esm";
import { WhiteboardContext } from "../../contexts/WhiteboardContext";
// import { AddaLogo, HamburgerIcon } from "./theme/svg";
import { GrNext, GrPrevious, GrClose } from "react-icons/gr";
import { StageContext } from "../../contexts/StageContext";
import { Modal } from "antd";
const Whiteboard = () => {
  const {
    wbRef,
    wbBgColor,
    setWbBgColor,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    wbToolType,
    setWBToolType,
    currentPenIndex,
    setCurrentPenIndex,
    width,
    setWidth,
    setElements,
    setColorWidth,
    setPath,
    colorWidth,
    setShapeWidth,
    inputPdfFileRef,
    pdfFileRef,
    selectPdf,
    inputImgFileRef,
    imgFileRef,
    rotateImg,
    selectImage,
    textToAddRef,
    pageNum,
    setPageNum,
    pdfViewPort,
    handleErasePDF,
    handleImageClear,
    handleSaveAsPDF,
    elements,
    handlePersistAsPDF,
    path,
    handleResetWhitboard,
    wbPages,
    deleteWbPage,
    setWbCurrentState,
    saveWbCurrentState,
    saveWbPagesPDF,
    isPageUpdated,
    showWhiteBoard,
  } = useContext(WhiteboardContext);
  const { facultyData } = useContext(StageContext);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const tooltipRef = useRef(null);
  const btntooltipRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        !btntooltipRef.current.contains(event.target)
      ) {
        setShowTooltip(false); // Clicked outside the tooltip, so close it
      }
    };

    // Attach the click event listener to the window
    window.addEventListener("click", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleTooltip = () => {
    setShowTooltip((prevState) => !prevState); // Toggle tooltip visibility
  };

  const handlePageChange = async (_pageNum, type) => {
    await handlePersistAsPDF(_pageNum);
    if (type === "dec") {
      if (_pageNum > 1 && _pageNum <= window.whiteboardPDFPages) {
        setPageNum((ps) => ps - 1);
      } else {
        toast.info("You are on first page");
      }
    } else {
      if (_pageNum >= 1 && _pageNum < window.whiteboardPDFPages) {
        setPageNum((ps) => ps + 1);
      } else {
        toast.info("You are on last page");
      }
    }
  };

  return (
    <>
      {showTooltip && (
        <div className="whiteboard-header-menu" ref={tooltipRef}>
          <Modal
            title="Remove PDF"
            open={showModal}
            onOk={async () => {
              await handleSaveAsPDF(
                pdfFileRef.current,
                facultyData.topic || "",
                pageNum,
                true
              );
              setShowModal(false);
            }}
            onCancel={async () => {
              handleErasePDF(pdfViewPort.current);
              setShowModal(false);
            }}
            okText="Yes"
            cancelText="No"
          >
            <div>Do you need to download the PDF before removing ?</div>
          </Modal>
          <div className="whiteboard-header-menuitem">
            <div
              className="header-menuitem-icon"
              onClick={() => inputPdfFileRef.current.click()}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.4995 14.7593C18.367 14.7593 18.2492 14.8035 18.1609 14.9065C18.0726 14.9949 18.0137 15.1273 18.0137 15.2451V17.2031C18.0137 17.4239 17.9253 17.63 17.7781 17.7772C17.6309 17.9244 17.4248 18.0127 17.204 18.0127H6.796C6.57518 18.0127 6.36909 17.9244 6.22187 17.7772C6.07466 17.63 5.98633 17.4239 5.98633 17.2031V15.2451C5.98633 15.0685 5.898 14.9065 5.73607 14.8182C5.58885 14.7299 5.39748 14.7299 5.25026 14.8182C5.10305 14.9065 5 15.0685 5 15.2451V17.2031C5 17.6741 5.19138 18.1305 5.52997 18.4691C5.86856 18.8077 6.32492 18.9991 6.796 18.9991H17.204C17.6751 18.9991 18.1314 18.8077 18.47 18.4691C18.8086 18.1305 19 17.6741 19 17.2031V15.2451C19 15.1126 18.9558 14.9949 18.8528 14.9065C18.7497 14.8182 18.632 14.7593 18.4995 14.7593Z"
                  fill="#202126"
                />
                <path
                  d="M11.993 15.0732C11.8605 15.0732 11.7427 15.0291 11.6544 14.926C11.566 14.823 11.5071 14.7052 11.5071 14.5874V6.52014L8.40094 9.1111C8.26845 9.21415 8.09179 9.24359 7.92986 9.1847C7.76793 9.12582 7.65015 8.9786 7.62071 8.81667C7.59127 8.65473 7.65015 8.47808 7.78265 8.36031L11.6838 5.10689C11.7132 5.09217 11.728 5.07745 11.7574 5.06273C11.7721 5.048 11.8016 5.03328 11.8163 5.03328C11.9341 4.98912 12.0518 4.98912 12.1696 5.03328C12.1843 5.04801 12.2138 5.048 12.2285 5.06273C12.2579 5.07745 12.2874 5.09217 12.3021 5.10689L16.2033 8.36031C16.3357 8.47808 16.3946 8.64001 16.3652 8.81667C16.3357 8.9786 16.218 9.12582 16.056 9.1847C15.8941 9.24359 15.7175 9.21415 15.585 9.1111L12.4788 6.52014V14.5874C12.4788 14.7199 12.4346 14.8377 12.3315 14.926C12.2285 15.0144 12.1254 15.0732 11.993 15.0732Z"
                  fill="#202126"
                />
              </svg>
            </div>
            <div
              className="header-menuitem-lebel"
              onClick={() => {
                if (!pdfFileRef.current && !imgFileRef?.current) {
                  inputPdfFileRef.current.click();
                } else {
                  toast.info("Cannot upload PDF/Image over another");
                }
              }}
            >
              Upload PDF File
            </div>
            {pdfFileRef.current && (
              <>
                <span
                  className="whiteboard-header-icon-btn"
                  onClick={() => handlePageChange(pageNum, "dec")}
                >
                  <GrPrevious />
                </span>
                <span
                  className="whiteboard-header-icon-btn"
                  onClick={() => handlePageChange(pageNum, "inc")}
                >
                  <GrNext />
                </span>
                <span
                  className="whiteboard-header-icon-btn"
                  onClick={() => {
                    setShowModal(true);
                  }}
                >
                  <GrClose />
                </span>
              </>
            )}
          </div>
          <div className="whiteboard-header-menuitem">
            <div className="header-menuitem-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.4995 14.7593C18.367 14.7593 18.2492 14.8035 18.1609 14.9065C18.0726 14.9949 18.0137 15.1273 18.0137 15.2451V17.2031C18.0137 17.4239 17.9253 17.63 17.7781 17.7772C17.6309 17.9244 17.4248 18.0127 17.204 18.0127H6.796C6.57518 18.0127 6.36909 17.9244 6.22187 17.7772C6.07466 17.63 5.98633 17.4239 5.98633 17.2031V15.2451C5.98633 15.0685 5.898 14.9065 5.73607 14.8182C5.58885 14.7299 5.39748 14.7299 5.25026 14.8182C5.10305 14.9065 5 15.0685 5 15.2451V17.2031C5 17.6741 5.19138 18.1305 5.52997 18.4691C5.86856 18.8077 6.32492 18.9991 6.796 18.9991H17.204C17.6751 18.9991 18.1314 18.8077 18.47 18.4691C18.8086 18.1305 19 17.6741 19 17.2031V15.2451C19 15.1126 18.9558 14.9949 18.8528 14.9065C18.7497 14.8182 18.632 14.7593 18.4995 14.7593Z"
                  fill="#202126"
                />
                <path
                  d="M11.993 15.0732C11.8605 15.0732 11.7427 15.0291 11.6544 14.926C11.566 14.823 11.5071 14.7052 11.5071 14.5874V6.52014L8.40094 9.1111C8.26845 9.21415 8.09179 9.24359 7.92986 9.1847C7.76793 9.12582 7.65015 8.9786 7.62071 8.81667C7.59127 8.65473 7.65015 8.47808 7.78265 8.36031L11.6838 5.10689C11.7132 5.09217 11.728 5.07745 11.7574 5.06273C11.7721 5.048 11.8016 5.03328 11.8163 5.03328C11.9341 4.98912 12.0518 4.98912 12.1696 5.03328C12.1843 5.04801 12.2138 5.048 12.2285 5.06273C12.2579 5.07745 12.2874 5.09217 12.3021 5.10689L16.2033 8.36031C16.3357 8.47808 16.3946 8.64001 16.3652 8.81667C16.3357 8.9786 16.218 9.12582 16.056 9.1847C15.8941 9.24359 15.7175 9.21415 15.585 9.1111L12.4788 6.52014V14.5874C12.4788 14.7199 12.4346 14.8377 12.3315 14.926C12.2285 15.0144 12.1254 15.0732 11.993 15.0732Z"
                  fill="#202126"
                />
              </svg>
            </div>
            <div
              className="header-menuitem-lebel"
              onClick={() => {
                if (!pdfFileRef.current && !imgFileRef.current) {
                  inputImgFileRef?.current?.click();
                } else {
                  toast.info("Cannot upload PDF/Image over another");
                }
              }}
            >
              Upload IMAGE File
            </div>
            {imgFileRef.current ? (
              <span
                className="whiteboard-header-icon-btn"
                onClick={() => {
                  handleImageClear();
                }}
              >
                <GrClose />
              </span>
            ) : null}
          </div>
          {pdfFileRef.current ? (
            <div
              className="whiteboard-header-menuitem"
              onClick={() =>
                handleSaveAsPDF(
                  pdfFileRef.current,
                  facultyData.topic || "",
                  pageNum
                )
              }
            >
              <div className="header-menuitem-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.4995 14.7593C18.367 14.7593 18.2492 14.8035 18.1609 14.9065C18.0726 14.9949 18.0137 15.1273 18.0137 15.2451V17.2031C18.0137 17.4239 17.9253 17.63 17.7781 17.7772C17.6309 17.9244 17.4248 18.0127 17.204 18.0127H6.796C6.57518 18.0127 6.36909 17.9244 6.22187 17.7772C6.07466 17.63 5.98633 17.4239 5.98633 17.2031V15.2451C5.98633 15.0685 5.898 14.9065 5.73607 14.8182C5.58885 14.7299 5.39748 14.7299 5.25026 14.8182C5.10305 14.9065 5 15.0685 5 15.2451V17.2031C5 17.6741 5.19138 18.1305 5.52997 18.4691C5.86856 18.8077 6.32492 18.9991 6.796 18.9991H17.204C17.6751 18.9991 18.1314 18.8077 18.47 18.4691C18.8086 18.1305 19 17.6741 19 17.2031V15.2451C19 15.1126 18.9558 14.9949 18.8528 14.9065C18.7497 14.8182 18.632 14.7593 18.4995 14.7593Z"
                    fill="#202126"
                  />
                  <path
                    d="M11.993 5C11.8605 5 11.7427 5.04416 11.6544 5.14721C11.566 5.25026 11.5071 5.36803 11.5071 5.4858V13.5531L8.40094 10.9621C8.26845 10.8591 8.09179 10.8297 7.92986 10.8885C7.76793 10.9474 7.65015 11.0946 7.62071 11.2566C7.59127 11.4185 7.65015 11.5952 7.78265 11.7129L11.6838 14.9664C11.7132 14.9811 11.728 14.9958 11.7574 15.0105C11.7721 15.0252 11.8016 15.04 11.8163 15.04C11.9341 15.0841 12.0518 15.0841 12.1696 15.04C12.1843 15.0252 12.2138 15.0252 12.2285 15.0105C12.2579 14.9958 12.2874 14.9811 12.3021 14.9664L16.2033 11.7129C16.3357 11.5952 16.3946 11.4332 16.3652 11.2566C16.3357 11.0946 16.218 10.9474 16.056 10.8885C15.8941 10.8297 15.7175 10.8591 15.585 10.9621L12.4788 13.5531V5.4858C12.4788 5.35331 12.4346 5.23554 12.3315 5.14721C12.2285 5.05889 12.1254 5 11.993 5Z"
                    fill="#202126"
                  />
                </svg>
              </div>
              <div className="header-menuitem-lebel">Download File</div>
            </div>
          ) : null}
        </div>
      )}
      <canvas
        style={{
          border: "1px solid black",
          display: showWhiteBoard ? "block" : "none",
          zIndex: showWhiteBoard ? 99 : -1,
        }}
        // className="stream-player"
        key="WHITEBOARD_PREVIEW"
        id="wb-preview"
        ref={(e) => {
          const canvas = document.getElementById("wb-preview");
          const roughCanvas = rough.canvas(canvas);
          window.roughCanvas = roughCanvas;
          wbRef.current = e;
        }}
        width={1270}
        height={720}
        onMouseDown={(e) =>
          handleMouseDown(
            e,
            window.wbLayer,
            wbToolType,
            pdfFileRef.current,
            pageNum
          )
        }
        onMouseMove={(e) =>
          handleMouseMove(
            e,
            window.wbLayer,
            wbToolType,
            pdfFileRef.current,
            pageNum
          )
        }
        onMouseUp={(e) =>
          handleMouseUp(
            e,
            window.wbLayer,
            wbToolType,
            pdfFileRef.current,
            pageNum
          )
        }
        onTouchStart={(e) => {
          var touch = e.touches[0];
          handleMouseDown(
            {
              ...e,
              clientX: touch.clientX,
              clientY: touch.clientY,
            },
            window.wbLayer,
            wbToolType,
            pdfFileRef.current,
            pageNum
          );
        }}
        onTouchMove={(e) => {
          var touch = e.touches[0];
          handleMouseMove(
            {
              ...e,
              clientX: touch.clientX,
              clientY: touch.clientY,
            },
            window.wbLayer,
            wbToolType,
            pdfFileRef.current,
            pageNum
          );
        }}
        onTouchEnd={(e) =>
          handleMouseUp(e, window.wbLayer, wbToolType, pageNum)
        }
      ></canvas>
      {/* <div
        className={`wb-wrapper ${
          wbToolType === "imageresize" && showWhiteBoard
            ? "d-block"
            : "d-none"
        }`}
        id="wb_wrapper"
      >
        <div id="resizable-container"><div id="wb-image" alt="" /></div>
        <div id="resize-handle"></div>
      </div> */}

      {/* <input
        id="imgFileUpload"
        onChange={selectImage}
        type="file"
        accept="image/*"
        ref={inputImgFileRef}
        hidden
      />

      <input
        id="pdfFileUpload"
        onChange={selectPdf}
        type="file"
        accept="application/pdf"
        ref={inputPdfFileRef}
        hidden
      /> */}
    </>
  );
};

export default Whiteboard;
