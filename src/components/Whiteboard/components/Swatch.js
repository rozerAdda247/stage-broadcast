import React, { useEffect, useRef, useState } from "react";
import {
  // Input,
  Modal,
  Popover,
  Tooltip,
} from "antd";
import {
  Cursor,
  Eraser,
  // Texts,
  Reset,
  ImageResize,
  AddaLogo,
  HamburgerIcon,
  CircleFill,
} from "../theme/svg";
import { SketchPicker } from "react-color";
import ShapesComponents from "./ShapesComponents";
import PenPencilComponents from "./PenPencilComponenets";
import {
  FileAddOutlined,
  FileImageOutlined,
  FileOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
} from "@ant-design/icons";
import { FiDelete as DeleteIcon } from "react-icons/fi";

export default function Swatch({
  wbToolType,
  setWBToolType,
  wbBgColor,
  setWbBgColor,
  pdfFileRef,
  imgFileRef,
  rotateImg,
  currentPenIndex,
  setCurrentPenIndex,
  width,
  setWidth,
  setElements,
  setColorWidth,
  setPath,
  colorWidth,
  setShapeWidth,
  textToAddRef,
  handleSaveAsPDF,
  elements,
  toggleTooltip,
  btntooltipRef,
  handleResetWhiteboard,
  wbPages,
  deleteWbPage,
  setWbCurrentState,
  saveWbCurrentState,
  saveWbPagesPDF,
  isPageUpdated,
}) {
  const _wbBgColors = [
    { id: 1, hexColor: "#ffffff" },
    { id: 2, hexColor: "#f8f9fa" },
    { id: 3, hexColor: "#f5faff" },
    { id: 4, hexColor: "#fffce8" },
    { id: 5, hexColor: "#fdf8f6" },
  ];

  const [showModal, setShowModal] = useState(false);
  const [toLastPage, setToLastPage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [currentWbPage, setCurrentWBPage] = useState(null);
  const [displayStroke, setDisplayStroke] = useState(false);
  const [displayWbBgPicker, setDisplayWbBgPicker] = useState(false);
  const colorPickerRef1 = useRef(null);
  const colorPickerBtnRef1 = useRef(null);
  const colorPickerRef2 = useRef(null);
  const colorPickerBtnRef2 = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef1.current &&
        !colorPickerRef1.current.contains(event.target) &&
        !colorPickerBtnRef1.current.contains(event.target)
      ) {
        setDisplayStroke(false); // Clicked outside the tooltip, so close it
      }
    };

    // Attach the click event listener to the window
    window.addEventListener("click", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef2.current &&
        !colorPickerRef2.current.contains(event.target) &&
        !colorPickerBtnRef2.current.contains(event.target)
      ) {
        setDisplayWbBgPicker(false); // Clicked outside the tooltip, so close it
      }
    };

    // Attach the click event listener to the window
    window.addEventListener("click", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleClickStroke = () => {
    setDisplayStroke(!displayStroke);
    setColorWidth(colorWidth);
  };
  const handleClickWbColor = () => {
    setDisplayWbBgPicker(!displayWbBgPicker);
    setWbBgColor(wbBgColor);
  };
  return (
    <div className="swatch-container">
      <div className="row">
        <div className="icon-bar left-icon-bar column-bar">
          <Tooltip placement="right" title={"Adda247"}>
            <AddaLogo />
          </Tooltip>
          <div className="menuwrap">
            <button
              id="hamburgericon"
              data-toggle="tooltip"
              data-placement="top"
              title="Hamburger Icon"
              onClick={() => {
                toggleTooltip();
                setDisplayStroke(false);
              }}
              ref={btntooltipRef}
            >
              <HamburgerIcon />
            </button>
          </div>
          {!pdfFileRef.current && (
            <>
              <Modal
                title="Change WhiteBoard"
                open={showModal}
                onOk={async () => {
                  await saveWbCurrentState(true, window.pageNum);
                  if (currentWbPage !== null) {
                    await setWbCurrentState(currentWbPage);
                  }
                  if(toLastPage) {
                    handleResetWhiteboard(wbPages.length)
                  }
                  setToLastPage(false);
                  setCurrentWBPage(null);
                  setShowModal(false);
                }}
                onCancel={async () => {
                  await saveWbCurrentState(false, window.pageNum);
                  if (currentWbPage !== null) {
                    await setWbCurrentState(currentWbPage);
                  }
                  if(toLastPage) {
                    handleResetWhiteboard(wbPages.length)
                  }
                  setToLastPage(false);
                  setCurrentWBPage(null);
                  setShowModal(false);
                }}
                okText="Yes"
                cancelText="No"
              >
                <div>Do you need to save changes ?</div>
              </Modal>
              <Modal
                title="Delete WhiteBoard"
                open={showDeleteModal !== null}
                onOk={async () => {
                  deleteWbPage(showDeleteModal);
                  setShowDeleteModal(null);
                }}
                onCancel={() => {
                  setShowDeleteModal(null);
                }}
                okText="Yes"
                cancelText="No"
              >
                <div>Do you want to delete page {showDeleteModal + 1} ?</div>
              </Modal>
              <Popover
                className="whitboard-pages-popover"
                placement="rightTop"
                title={null}
                content={
                  <div>
                    <div className="wb-pages-wrapper">
                      {/* <h4 className="text-center">Saved Pages</h4> */}
                      {wbPages?.map((item, idx) => (
                        <div
                          className="wb-page-item d-flex align-items-center justify-content-between pointer-cursor"
                          key={`wbPage__${idx}`}
                        >
                          <span
                            onClick={async () => {
                              if (wbToolType === "imageresize")
                                setWBToolType("brush");
                              if (isPageUpdated) {
                                setCurrentWBPage(item?.pageNo);
                                setShowModal(true);
                              } else {
                                await saveWbCurrentState(false, window.pageNum);
                                setWbCurrentState(item?.pageNo);
                              }
                            }}
                            className={
                              item?.pageNo === window.pageNum
                                ? "wb-page-item-active"
                                : ""
                            }
                          >
                            Page {parseInt(item?.pageNo) + 1}
                          </span>
                          <span
                            onClick={() => {
                              setShowDeleteModal(item?.pageNo);
                            }}
                          >
                            <DeleteIcon />
                          </span>
                        </div>
                      ))}
                      <div className="wb-page-item pointer-cursor" key={wbPages.length}>
                        <span
                          className={
                            wbPages.length === window.pageNum
                              ? "wb-page-item-active"
                              : ""
                          }
                          onClick={() => {
                            if(isPageUpdated) {
                              setShowModal(true);
                              setToLastPage(true);
                              setCurrentWBPage(window.pageNum)
                            } else {
                              handleResetWhiteboard(wbPages.length)
                            }
                          }}
                        >
                        Page {wbPages?.length + 1}
                        </span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success mt-2"
                        onClick={async () => {
                          if (isPageUpdated) {
                            setShowModal(true);
                          } else {
                            await saveWbCurrentState(true, window.pageNum);
                          }
                        }}
                      >
                        <FileAddOutlined />
                      </button>
                      <button
                        className="btn btn-primary mt-2"
                        onClick={saveWbPagesPDF}
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
                            fill="#fff"
                          />
                          <path
                            d="M11.993 5C11.8605 5 11.7427 5.04416 11.6544 5.14721C11.566 5.25026 11.5071 5.36803 11.5071 5.4858V13.5531L8.40094 10.9621C8.26845 10.8591 8.09179 10.8297 7.92986 10.8885C7.76793 10.9474 7.65015 11.0946 7.62071 11.2566C7.59127 11.4185 7.65015 11.5952 7.78265 11.7129L11.6838 14.9664C11.7132 14.9811 11.728 14.9958 11.7574 15.0105C11.7721 15.0252 11.8016 15.04 11.8163 15.04C11.9341 15.0841 12.0518 15.0841 12.1696 15.04C12.1843 15.0252 12.2138 15.0252 12.2285 15.0105C12.2579 14.9958 12.2874 14.9811 12.3021 14.9664L16.2033 11.7129C16.3357 11.5952 16.3946 11.4332 16.3652 11.2566C16.3357 11.0946 16.218 10.9474 16.056 10.8885C15.8941 10.8297 15.7175 10.8591 15.585 10.9621L12.4788 13.5531V5.4858C12.4788 5.35331 12.4346 5.23554 12.3315 5.14721C12.2285 5.05889 12.1254 5 11.993 5Z"
                            fill="#fff"
                          />
                        </svg>
                        Save PDF
                      </button>
                    </div>
                  </div>
                }
                trigger="click"
              >
                <button
                  id="newWhiteboard"
                  data-toggle="tooltip"
                  data-placement="top"
                  title="New Whiteboard"
                >
                  <FileOutlined />
                  <span className="wb_curr_page">{window?.pageNum + 1}</span>
                </button>
              </Popover>
              {elements?.length > 0 && (
                <Tooltip placement="right" title={"Selection"}>
                  <button
                    id="selection"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="Selection"
                    onClick={() => {
                      setWBToolType("selection");
                      setDisplayStroke(false);
                    }}
                  >
                    <Cursor
                      wbToolType={wbToolType}
                      colorWidth={colorWidth}
                      fill={wbToolType === "selection" ? "#1570EF" : "#000000"}
                    />
                  </button>
                </Tooltip>
              )}
            </>
          )}
          {imgFileRef.current && (
            <Tooltip placement="right" title={"Image Tools"}>
              <Popover
                className="whitboard-shapers-popover"
                placement="rightTop"
                title={null}
                content={
                  <div className="icon-bar column-bar">
                    <Tooltip placement="right" title={"Image Resize"}>
                      <button
                        id="imageresize"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Image Resize"
                        onClick={() => {
                          setWBToolType("imageresize");
                        }}
                      >
                        <ImageResize
                          wbToolType={wbToolType}
                          colorWidth={colorWidth}
                          fill={
                            wbToolType === "imageresize" ? "#1570EF" : "#000000"
                          }
                        />
                      </button>
                    </Tooltip>
                    <hr width="80%" />
                    <div className="d-flex">
                      <button
                        id="rotateLeft"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Rotate Left"
                        onClick={() => rotateImg(-90)}
                      >
                        <RotateLeftOutlined />
                      </button>
                      <button
                        id="rotateRight"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Rotate Right"
                        onClick={() => rotateImg(90)}
                      >
                        <RotateRightOutlined />
                      </button>
                    </div>
                  </div>
                }
                trigger="click"
              >
                <button
                  id="image_tools"
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Image Tools"
                >
                  {["imageresize"]?.includes(wbToolType) ? (
                    <ImageResize
                      wbToolType={wbToolType}
                      colorWidth={colorWidth}
                      fill={"#1570EF"}
                    />
                  ) : (
                    <FileImageOutlined />
                  )}
                </button>
              </Popover>
            </Tooltip>
          )}
          {/* <Tooltip placement="right" title={"Scroll"}>
            <button
              id="scroll"
              data-toggle="tooltip"
              data-placement="top"
              title="Scroll"
              onClick={() => {
                setWBToolType("scroll");
              }}
            >
              <HandIcon
                wbToolType={wbToolType}
                colorWidth={colorWidth}
                fill={wbToolType === "scroll" ? "#1570EF" : "black"}
              />
            </button>
          </Tooltip> */}
          <PenPencilComponents
            wbToolType={wbToolType}
            setWBToolType={setWBToolType}
            setWidth={setWidth}
            setShapeWidth={setShapeWidth}
            setDisplayStroke={setDisplayStroke}
            currentIndex={currentPenIndex}
            setCurrentIndex={setCurrentPenIndex}
          />

          <Tooltip placement="right" title={"Eraser"}>
            <button
              id="eraser"
              data-toggle="tooltip"
              data-placement="top"
              title="Eraser"
              onClick={() => {
                setWBToolType("eraser");
                setDisplayStroke(false);
              }}
            >
              <Eraser
                wbToolType={wbToolType}
                colorWidth={colorWidth}
                fill={wbToolType === "eraser" ? "#1570EF" : "#000000"}
              />
            </button>
          </Tooltip>
          {!pdfFileRef.current && !imgFileRef.current && (
            <>
              {/* <Tooltip
                placement="right"
                title={
                  <Input
                    ref={textToAddRef}
                    onChange={(e) => {
                      textToAddRef.current.input.value = e.target.value;
                    }}
                  />
                }
                trigger={"click"}
              >
                <button
                  id="text"
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Text"
                  onClick={() => {
                    setWBToolType("text");
                    setDisplayStroke(false);
                  }}
                >
                  <Texts
                    wbToolType={wbToolType}
                    colorWidth={colorWidth}
                    fill={wbToolType === "text" ? "#1570EF" : "#000000"}
                  />
                </button>
              </Tooltip> */}
              <ShapesComponents
                wbToolType={wbToolType}
                setWBToolType={setWBToolType}
                setWidth={setWidth}
                setShapeWidth={setShapeWidth}
                setDisplayStroke={setDisplayStroke}
              />
            </>
          )}
          <Tooltip placement="right" title={"Color Changes"}>
            <button
              className="color_picker"
              id="color-picker"
              data-toggle="tooltip"
              data-placement="top"
              title="Color Picker"
              ref={colorPickerBtnRef1}
              onClick={handleClickStroke}
            >
              <div className="picker"></div>
              {/* <ColorPicker /> */}
            </button>
          </Tooltip>

          <div
            style={{
              position: "absolute",
              left: "50px",
              top: "0px",
            }}
          >
            {displayStroke && (
              <div ref={colorPickerRef1}>
                <SketchPicker
                  color={colorWidth}
                  onChangeComplete={(color) => setColorWidth(color)}
                />
              </div>
            )}
          </div>
          <Tooltip placement="right" title="Whiteboard Color">
            <Popover
              className="whitboard-shapers-popover"
              placement="rightTop"
              title={null}
              content={
                <div className="icon-bar column-bar">
                  {_wbBgColors?.map((cl, idx) => (
                    <button
                      onClick={() => {
                        setWbBgColor(cl?.hexColor);
                        setDisplayWbBgPicker(false);
                      }}
                    >
                      <CircleFill key={`wbColor__${idx}`} fill={cl?.hexColor} />
                    </button>
                  ))}
                  <hr width="80%" />
                  <button
                    className="color_picker"
                    id="color-picker"
                    data-toggle="tooltip"
                    data-placement="top"
                    title="Color Picker"
                    ref={colorPickerBtnRef2}
                    onClick={handleClickWbColor}
                  >
                    <div className="picker"></div>
                    {/* <ColorPicker /> */}
                  </button>
                  <div
                    style={{
                      position: "absolute",
                      left: "90px",
                      top: "0px",
                    }}
                  >
                    {displayWbBgPicker && (
                      <div ref={colorPickerRef2}>
                        <SketchPicker
                          color={{ hex: wbBgColor }}
                          onChangeComplete={(color) => {
                            // setDisplayWbBgPicker(false);
                            setWbBgColor(color?.hex);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              }
              trigger="click"
            >
              <button
                id="_rectangle"
                data-toggle="tooltip"
                data-placement="top"
                title="Rectangle"
                onClick={() => {
                  setDisplayStroke(false);
                }}
              >
                <CircleFill fill={wbBgColor} />
              </button>
            </Popover>
          </Tooltip>
          <Tooltip
            placement="right"
            title={<div className="text-warning">Clean Whiteboard</div>}
          >
            <button
              id="reset-wb"
              data-toggle="tooltip"
              data-placement="top"
              title="Reset-Wb"
              onClick={() => handleResetWhiteboard(window.pageNum, true)}
            >
              <Reset />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
