import { useState, useRef, useEffect } from "react";
import * as pdfJSLib from "pdfjs-dist/build/pdf";
// import * as pdfJSWorker from "pdfjs-dist/build/pdf.worker.entry";
import { PDFDocument } from "pdf-lib";
import rough from "roughjs/bundled/rough.esm";
import {
  createElement,
  adjustElementCoordinates,
  cursorForPosition,
  resizedCoordinates,
  midPointBtw,
  getElementAtPosition,
  getCoordinatesForTranslate,
  distance,
} from "../components/Whiteboard/components/element";
import { wbToolsList } from "../components/Whiteboard/theme/svg";
import { toast } from "react-toastify";

// const a = (2 * Math.PI) / 6; //hexagon angle
const mouseEvent = {
  mousemove: "mousemove",
  mousedown: "mousedown",
  mouseup: "mouseup",
};
let firstRender = true;
const IMG_MAX_SIZE = 5 * 1024 * 1024;
let roughCanvas = null;
const useWhiteboard = () => {
  const wbRef = useRef(null);
  const [showWhiteBoard, setShowWhiteBoard] = useState(false);
  const [wbBgColor, setWbBgColor] = useState("#FFFFFF");
  const [textToAdd, setTextToAdd] = useState("Hello World!");
  const [shapeSelect, setShapeSelect] = useState("oval");
  const [currentPenIndex, setCurrentPenIndex] = useState(0);
  const [pageNum, setPageNum] = useState(0);
  const addTextFlag = useRef(false);
  const addShapeFlag = useRef(false);
  const textToAddRef = useRef(textToAdd);
  const shapeSelectRef = useRef(shapeSelect);
  const inputPdfFileRef = useRef(null);
  const pdfFileRef = useRef(null);
  const inputImgFileRef = useRef(null);
  const imgFileRef = useRef(null);
  const imgFileRefProps = useRef({
    img: null,
    width: null,
    height: null,
    angle: null,
  });
  const pdfDoc = useRef(null);
  const pdfViewPort = useRef(null);
  const modifiedPagesDownlaodRef = useRef(new Map());
  const [points, setPoints] = useState([]);
  const [path, setPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState([]);
  const [action, setAction] = useState("none");
  const [wbToolType, setWBToolType] = useState("pencil");
  const [selectedElement, setSelectedElement] = useState(null);
  const [colorWidth, setColorWidth] = useState({
    hex: "#000",
    hsv: {},
    rgb: {},
  });
  const [width, setWidth] = useState(1);
  const [shapeWidth, setShapeWidth] = useState(1);
  const [popped, setPopped] = useState(false);
  const [images, setImages] = useState([]);
  const [wbPages, setWbPages] = useState([]);
  const [isPageUpdated, setIsPageUpdated] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const selectImage = async (e) => {
    setElements([]);
    const selectedImg = e?.target?.files?.[0];
    if (selectedImg?.size > IMG_MAX_SIZE) {
      toast.info("File size exceeds the limit of 5 MB");
      return;
    }
    imgFileRef.current = selectedImg;
    await loadImage(selectedImg, 0, 0, true);
    setIsPageUpdated(true);
  };

  const loadImage = async (
    selectedImg,
    imgwidth = imgFileRefProps.current.width,
    imgheight = imgFileRefProps.current.height,
    isNewImg,
    x1,
    y1
  ) => {
    try {
      const wbr = wbRef.current;
      const ctx = wbr.getContext("2d");
      // Get canvas dimensions
      const canvasWidth = wbr.width;
      const canvasHeight = wbr.height;
      if (selectedImg) {
        console.log("imgselect", selectedImg);
        const dataUrl = await readFileAsDataURL(selectedImg); // Read the selected file as a data URL
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = dataUrl;
        });
        // Clear the canvas before adding a new image
        ctx.clearRect(0, 0, ctx.width, ctx.height);
        // Draw the image on the canvas
        console.log(img.width, img.height, "::::: laod img :::::");
        // Get image dimensions
        const imageWidth = img.width;
        const imageHeight = img.height;

        // Calculate aspect ratios
        const aspectRatioCanvas = canvasWidth / canvasHeight;
        const aspectRatioImage = imageWidth / imageHeight;

        let renderWidth = canvasWidth;
        let renderHeight = canvasHeight;
        let x = 0;
        let y = 0;
        ctx.save();

        if (aspectRatioImage > aspectRatioCanvas) {
          // Image is wider than the canvas
          renderWidth = canvasWidth;
          renderHeight = canvasWidth / aspectRatioImage;
          y = (canvasHeight - renderHeight) / 2;
        } else {
          // Image is taller than the canvas
          renderWidth = canvasHeight * aspectRatioImage;
          renderHeight = canvasHeight;
          x = (canvasWidth - renderWidth) / 2;
        }
        console.log(":::Pos:::", x, y);
        if (imgFileRefProps?.current?.angle !== null) {
          let { x, y } = getCoordinatesForTranslate(
            imgFileRefProps?.current?.angle,
            imgwidth,
            imgheight
          );
          ctx.translate(x, y);
          ctx.rotate((imgFileRefProps?.current?.angle * Math.PI) / 180);
        }
        if (!imgwidth) {
          imgFileRefProps.current.img = img;
          imgFileRefProps.current.width = renderWidth;
          imgFileRefProps.current.height = renderHeight;
          loadImageDom(img, renderWidth, renderHeight);
        }
        ctx.drawImage(
          img,
          0,
          0,
          imgwidth || renderWidth,
          imgheight || renderHeight
        );
        ctx.restore();

        // ctx.drawImage(img, 0, 0, wbr.width, wbr.height);
        if (isNewImg) {
          setWBToolType("imageresize");
        }
        addLayer(window.wbLayer, window.client);
      }
    } catch (error) {
      toast.error("Something went wrong while uploading image");
      console.log(error);
    }
  };

  const loadImageDom = (img, renderWidth, renderHeight) => {
    const outerWrapper = document.getElementById("wb_wrapper");
    const wbwrapper = document.getElementById("wb-preview");
    const _imgContDiv = document.getElementById("resizable-container");
    // const _imgDiv = document.getElementById("wb-image");
    const handle = document.getElementById("resize-handle");
    outerWrapper.style.width = wbwrapper.width + "px";
    outerWrapper.style.height = wbwrapper.height + "px";
    _imgContDiv.style.width = renderWidth + "px";

    _imgContDiv.style.height = renderHeight + "px";
    // _imgDiv.style.backgroundImage = `url(${img?.src})`;
    // _imgDiv.style.backgroundPosition = "center";
    // _imgDiv.style.backgroundSize = "cover";
    if (firstRender) {
      handle.addEventListener("mousedown", handleImageResizeFunc);
      firstRender = false;
    }
  };

  useEffect(() => {
    // if (imgFileRefProps.current?.img && wbToolType === "imageresize")
    //   loadImageDom(
    //     imgFileRefProps.current?.img,
    //     imgFileRefProps.current.width,
    //     imgFileRefProps.current.height
    //   );
    if (wbToolType === "brush") {
      setWidth(5);
      setShapeWidth(5);
    } else {
      setWidth(1);
      setShapeWidth(1);
    }
  }, [wbToolType]);

  useEffect(() => {
    if (showWhiteBoard && wbRef.current && wbToolType !== "selection") {
      wbRef.current.style.cursor = `url("data:image/svg+xml,${encodeURIComponent(
        wbToolsList[wbToolType]
      )}"), auto`;
    }
    if (showWhiteBoard && wbRef.current && wbToolType === "imageresize") {
      document.getElementById(
        "wb_wrapper"
      ).style.cursor = `url("data:image/svg+xml,${encodeURIComponent(
        wbToolsList[wbToolType]
      )}"), auto`;
    }
    return () => {
      document.body.style.cursor = "default";
    };
  }, [wbToolType, showWhiteBoard]);

  const handleImageResizeFunc = () => {
    const outerWrapper = document.getElementById("wb_wrapper");
    outerWrapper.addEventListener("mousemove", handleImageResize);
    outerWrapper.addEventListener("mouseup", async (e) => {
      outerWrapper.removeEventListener("mousemove", handleImageResize);
      const container = document.getElementById("resizable-container");
      if (
        imgFileRefProps.current.angle === 90 ||
        imgFileRefProps.current.angle === 270
      ) {
        imgFileRefProps.current.width =
          container.getBoundingClientRect().height;
        imgFileRefProps.current.height =
          container.getBoundingClientRect().width;
      } else {
        imgFileRefProps.current.width = container.getBoundingClientRect().width;
        imgFileRefProps.current.height =
          container.getBoundingClientRect().height;
      }
      setIsResizing((ps) => !ps);
    });
  };

  const handleImageResize = (e) => {
    setIsPageUpdated(true);
    const container = document.getElementById("resizable-container");
    const outerbox = document.getElementById("wb-preview");
    const newWidth = e.clientX - container.getBoundingClientRect().left;
    const newHeight = e.clientY - container.getBoundingClientRect().top;
    if (newHeight <= outerbox.height && newWidth <= outerbox.width) {
      container.style.width = `${newWidth}px`;
      container.style.height = `${newHeight}px`;
      // loadImage();
    }
  };

  const rotateImg = async (ang) => {
    let _angle = imgFileRefProps?.current?.angle;
    if (_angle === null) {
      _angle = ang;
    } else {
      _angle += ang;
    }
    _angle = _angle < 0 ? 360 + _angle : _angle >= 360 ? _angle - 360 : _angle;
    imgFileRefProps.current.angle = _angle;
    const _imgDiv = document.getElementById("resizable-container");
    const { w, h } = getCoordinatesForTranslate(
      imgFileRefProps?.current?.angle,
      imgFileRefProps?.current?.width,
      imgFileRefProps?.current?.height
    );
    _imgDiv.style.width = `${w}px`;
    _imgDiv.style.height = `${h}px`;
    await whiteboardInitialize();
    setIsPageUpdated(true);
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        resolve(e.target?.result);
      };
      reader.onerror = function (error) {
        reject(error);
      };
      // Read the selected file as a data URL
      reader.readAsDataURL(file);
    });
  };

  const selectPdf = (e) => {
    const selectedFile = e?.target?.files?.[0];
    pdfFileRef.current = selectedFile;
    resetToolTopencil(true);
    setElements([]);
    setPath([]);
    setPageNum(0);
    window.pageNum = 0;
    // loadPdfDoc(selectedFile, true)
    //   .then((res) => {
    //     renderPage(1);
    //   })
    //   .then((res) => console.log("finshed"))
    //   .catch(() => console.log("loading error"));
  };
  useEffect(() => {
    if (
      pageNum >= 1 &&
      pageNum <= window.whiteboardPDFPages &&
      pdfDoc.current
    ) {
      renderPage(pageNum);
      window.pageNum = pageNum;
    }
  }, [pageNum]);

  // const loadPdfDoc = async (file, isNewFile) => {
  //   pdfJSLib.GlobalWorkerOptions.workerSrc = pdfJSWorker;
  //   const reader = new FileReader();
  //   reader.onload = async (event) => {
  //     const pdfData = new Uint8Array(event.target.result);

  //     try {
  //       let pdfDocfilesDetails = await pdfJSLib.getDocument({ data: pdfData })
  //         .promise;
  //       pdfDoc.current = pdfDocfilesDetails;
  //       window.whiteboardPDFPages = pdfDocfilesDetails._pdfInfo.numPages;
  //       if (isNewFile) {
  //         setPageNum(1);
  //         window.pageNum = 1;
  //       } else {
  //         if (window.pageNum) {
  //           setPageNum(window.pageNum);
  //         } else {
  //           setPageNum(1);
  //           window.pageNum = 1;
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error loading PDF:", error);
  //     }
  //   };
  //   reader.readAsArrayBuffer(file);
  // };

  const renderPage = async (pageNum) => {
    // Prepare canvas using PDF page dimensions.
    try {
      const wbr = wbRef.current;
      const canvasContext = wbr.getContext("2d");
      canvasContext.fillStyle = wbBgColor;
      canvasContext.fillRect(0, 0, wbRef.current.width, wbRef.current.height);
      const page = await pdfDoc.current.getPage(pageNum);

      // Calculate the scaling factor to fit the canvas
      const viewport = page.getViewport({ scale: 1 });
      const canvasWidth = wbr.width;
      const canvasHeight = wbr.height;
      const pageWidth = viewport.width;
      const pageHeight = viewport.height;
      pdfViewPort.current = { width: pageWidth, height: pageHeight };
      const scaleX = canvasWidth / pageWidth;
      const scaleY = canvasHeight / pageHeight;
      const scale = Math.min(scaleX, scaleY);

      // Render PDF page into canvas context.
      const scaledViewport = page.getViewport({ scale });

      const pdfCanvas = document.createElement("canvas");
      const pdfCtx = pdfCanvas.getContext("2d");
      pdfCanvas.width = wbr.width;
      pdfCanvas.height = wbr.height;

      const renderContext = {
        canvasContext: pdfCtx,
        viewport: scaledViewport,
      };

      // const renderContext = { canvasContext, viewport: scaledViewport };
      await page.render(renderContext).promise.then(function () {
        // Calculate the offset to center align the rendered page
        const xOffset = (canvasWidth - scaledViewport.width) / 2;
        const yOffset = (canvasHeight - scaledViewport.height) / 2;
        // Draw the rendered PDF page on the main canvas
        canvasContext.drawImage(pdfCanvas, xOffset, yOffset);
      });
      // const renderTask = await page.render(renderContext);
      // canvasContext.drawImage(pdfCanvas, 0, 0);
      addLayer(window.wbLayer, window.client);
    } catch (err) {
      console.log(err);
      if (err.name === "RenderingCancelledException") {
        renderPage(pageNum);
      } else {
        console.log("some other error");
      }
    }
  };

  const handleImageClear = async () => {
    const wbr = wbRef.current;
    const ctx = wbr.getContext("2d");
    ctx.fillStyle = wbBgColor;
    ctx.fillRect(0, 0, wbRef.current.width, wbRef.current.height);
    imgFileRef.current = null;
    inputImgFileRef.current.value = null;
    setIsPageUpdated(true);
    await redrawPaths();
    resetToolTopencil(false);
  };

  const handleErasePDF = (pdfProperties) => {
    if (pdfProperties) {
      const wbr = wbRef.current;
      const ctx = wbr.getContext("2d");
      ctx.fillStyle = wbBgColor;
      ctx.fillRect(0, 0, wbRef.current.width, wbRef.current.height);
      pdfFileRef.current = null;
      pdfDoc.current = null;
      pdfViewPort.current = null;
      inputPdfFileRef.current.value = null;
      setPageNum(0);
      window.pageNum = 0;
      modifiedPagesDownlaodRef.current = new Map();
      // const _me = elements.filter((ele) => ele.isPdfFile != true);
      // setElements(_me);
      // const _mp = path.filter((stroke) => ({
      //   ...stroke,
      //   element: stroke.element.filter((p) => p.isPdfFile != true),
      // }));
      // setPath(_mp);
      setElements([]);
      setPath([]);
    }
  };

  const recalculate = (event, eventType) => {
    const adjustedEvent = adjustEventCoordinates(event);
    return {
      x: adjustedEvent.clientX,
      y: adjustedEvent.clientY,
      type: eventType,
    };
  };

  const adjustEventCoordinates = (e) => {
    // const boundingRect = e.target.getBoundingClientRect();
    // const adjustedX = e.clientX - boundingRect.left;
    // const adjustedY = e.clientY - boundingRect.top;
    let canvas = e.target;

    const boundingRect = canvas.getBoundingClientRect();
    const adjustedX =
      (e.clientX - boundingRect.left) * (canvas.width / boundingRect.width);
    const adjustedY =
      (e.clientY - boundingRect.top) * (canvas.height / boundingRect.height);

    return {
      ...e,
      clientX: adjustedX,
      clientY: adjustedY,
    };
  };

  const handleMouseDown = async (
    e,
    wbLayer,
    toolType,
    selectecPdfFile,
    pdfPageNum
  ) => {
    const adjustedEvent = adjustEventCoordinates(e);
    window.isDrawing = true;
    // const { clientX, clientY } = e;
    const { clientX, clientY } = adjustedEvent;
    // const canvas = document.getElementById("wb-preview");
    const context = wbRef?.current?.getContext("2d");

    if (toolType === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        const offsetX = clientX - element.x1;
        const offsetY = clientY - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });
        if (element.position === "inside") {
          setAction("moving");
        } else {
          setAction("resize");
        }
      }
    } else if (toolType === "eraser") {
      setAction("erasing");
      checkPresent(clientX, clientY, pdfPageNum);
    } else if (toolType === "scroll") {
      return;
    } else if (toolType === "text") {
      if (
        textToAddRef.current?.input?.value !== "" &&
        textToAddRef.current?.input?.value !== null &&
        textToAddRef.current?.input?.value !== undefined
      ) {
        const evt = recalculate(e, "mousedown");
        const id = elements.length;
        const newColour = colorWidth.hex;
        const newWidth = shapeWidth;
        const _textElement = drawText(
          context,
          evt,
          id,
          newWidth,
          newColour,
          textToAddRef.current?.input?.value
        );
        setElements((prevState) => [
          ...prevState,
          {
            ..._textElement,
            pageNum: pdfPageNum,
            isPdfFile: selectecPdfFile ? true : false,
          },
        ]);
        setSelectedElement({
          ..._textElement,
          pageNum: pdfPageNum,
          isPdfFile: selectecPdfFile ? true : false,
        });
      } else {
        return;
      }

      // setSelectedElement(_textElement);
    } else {
      const id = elements.length;
      if (toolType === "pencil" || toolType === "brush") {
        setAction("sketching");
        setIsDrawing(true);

        const newColour = colorWidth.hex;
        const newLinewidth = width;
        const transparency = toolType === "brush" ? "0.1" : "1.0";
        const newEle = {
          clientX,
          clientY,
          newColour,
          newLinewidth,
          transparency,
          pageNum: pdfPageNum,
          isPdfFile: selectecPdfFile ? true : false,
        };
        setPoints((state) => [...state, newEle]);

        context.strokeStyle = newColour;
        context.lineWidth = newLinewidth;
        context.lineCap = 5;
        context.moveTo(clientX, clientY);
        context.beginPath();
      } else {
        setAction("drawing");
        const newColour = colorWidth.hex;
        const newWidth = shapeWidth;
        const element = createElement(
          id,
          clientX,
          clientY,
          clientX,
          clientY,
          toolType,
          newWidth,
          newColour,
          context
        );
        setElements((prevState) => [
          ...prevState,
          {
            ...element,
            pageNum: pdfPageNum,
            isPdfFile: selectecPdfFile ? true : false,
          },
        ]);
        setSelectedElement({
          ...element,
          pageNum: pageNum,
          isPdfFile: selectecPdfFile ? true : false,
        });
      }
    }
    if (wbLayer) {
      await addLayer(wbLayer, window.client);
    }
    setIsPageUpdated(true);
  };
  const handleMouseMove = async (
    e,
    wbLayer,
    toolType,
    selectecPdfFile,
    pdfPageNum
  ) => {
    const context = wbRef.current?.getContext("2d");
    const adjustedEvent = adjustEventCoordinates(e);
    // const { clientX, clientY } = e;
    const { clientX, clientY } = adjustedEvent;

    if (toolType === "selection") {
      const element = getElementAtPosition(clientX, clientY, elements);
      wbRef.current.style.cursor = element
        ? cursorForPosition(element.position)
        : "default";
    }
    if (action === "erasing") {
      checkPresent(clientX, clientY, pdfPageNum);
    }
    if (action === "sketching") {
      if (!isDrawing) return;
      const colour = points[points.length - 1].newColour;
      const linewidth = points[points.length - 1].newLinewidth;
      const transparency = points[points.length - 1].transparency;
      const newEle = { clientX, clientY, colour, linewidth, transparency };

      setPoints((state) => [
        ...state,
        {
          ...newEle,
          pageNum: pdfPageNum,
          isPdfFile: selectecPdfFile ? true : false,
        },
      ]);
      var midPoint = midPointBtw(clientX, clientY);
      context.quadraticCurveTo(clientX, clientY, midPoint.x, midPoint.y);
      context.lineTo(clientX, clientY);
      context.stroke();
    } else if (toolType === "scroll") {
      return;
    } else if (toolType === "text") {
      return;
    } else if (action === "drawing") {
      const index = elements.length - 1;
      const { x1, y1 } = elements[index];
      elements[index].strokeColor = colorWidth.hex;
      elements[index].strokeWidth = shapeWidth;
      updateElement(
        index,
        x1,
        y1,
        clientX,
        clientY,
        toolType,
        shapeWidth,
        colorWidth.hex,
        context,
        mouseEvent.mousemove
      );
    } else if (action === "moving") {
      const {
        id,
        x1,
        x2,
        y1,
        y2,
        type,
        offsetX,
        offsetY,
        shapeWidth,
        strokeColor,
      } = selectedElement;
      const offsetWidth = x2 - x1;
      const offsetHeight = y2 - y1;
      const newX = clientX - offsetX;
      const newY = clientY - offsetY;
      updateElement(
        id,
        newX,
        newY,
        newX + offsetWidth,
        newY + offsetHeight,
        type,
        shapeWidth,
        strokeColor,
        context,
        mouseEvent.mousemove
      );
    } else if (action === "resize") {
      const { id, type, position, ...coordinates } = selectedElement;
      const { x1, y1, x2, y2 } = resizedCoordinates(
        clientX,
        clientY,
        position,
        coordinates
      );
      updateElement(
        id,
        x1,
        y1,
        x2,
        y2,
        type,
        shapeWidth,
        colorWidth.hex,
        context,
        mouseEvent.mousemove
      );
    }
    if (wbLayer) {
      await addLayer(wbLayer, window.client);
    }
  };

  const handleMouseUp = async (
    event,
    wbLayer,
    toolType,
    pdfRef,
    pdfPageNum
  ) => {
    window.isDrawing = false;
    const context = wbRef.current.getContext("2d");
    if (action === "resize") {
      const index = selectedElement.id;
      const { id, type, strokeWidth, strokeColor } = elements[index];
      const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
      updateElement(
        id,
        x1,
        y1,
        x2,
        y2,
        type,
        strokeWidth,
        strokeColor,
        context,
        mouseEvent.mouseup
      );
    } else if (toolType === "scroll") {
      return;
    } else if (toolType === "text") {
      return;
    } else if (action === "drawing") {
      const index = selectedElement.id;
      const { id, type, strokeWidth } = elements[index];
      const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
      updateElement(
        id,
        x1,
        y1,
        x2,
        y2,
        type,
        strokeWidth,
        colorWidth.hex,
        context,
        mouseEvent.mouseup
      );
    } else if (action === "sketching") {
      context.closePath();
      const element = [...points];
      let maxX = element[0].clientX;
      let minX = element[0].clientX;
      let maxY = element[0].clientY;
      let minY = element[0].clientY;
      element.forEach((ele) => {
        maxX = Math.max(ele.clientX, maxX);
        minX = Math.min(ele.clientX, minX);
        maxY = Math.max(ele.clientY, maxY);
        minY = Math.min(ele.clientY, minY);
      });
      setPoints([]);
      setPath((prevState) => [
        ...prevState,
        {
          x1: minX,
          y1: minY,
          x2: maxX,
          y2: maxY,
          element,
          pageNum: pdfPageNum,
        },
      ]); //tuple
      setIsDrawing(false);
    }
    setAction("none");
    if (wbLayer) {
      await addLayer(wbLayer, window.client);
    }
  };

  function drawText(ctx, evt, id, width, strokeColor, txtvalue) {
    ctx.closePath();
    ctx.font = "30px Arial";
    ctx.fillStyle = colorWidth.hex;

    // Ensure the cursor position is within the visible area
    const x = Math.max(evt.x, 0);
    const y = Math.max(evt.y, 0);

    const textRect = ctx.measureText(txtvalue);

    ctx.fillText(txtvalue, x, y);
    return {
      id: id,
      x1: x,
      y1: y,
      x2: x + textRect.width,
      y2: y + 35,
      type: "text",
      width: width,
      strokeColor: strokeColor,
      value: txtvalue,
      roughElement: {
        shape: "text",
        sets: [
          {
            type: "path",
            ops: [
              {
                op: "move",
                data: [367, 272],
              },
              {
                op: "bcurveTo",
                data: [
                  444.19443404640054, 272, 521.3888680928011, 272, 560, 272,
                ],
              },
            ],
          },
        ],
        options: {
          maxRandomnessOffset: 2,
          roughness: 0,
          bowing: 1,
          stroke: strokeColor,
          strokeWidth: 1,
          curveTightness: 0,
          curveFitting: 0.95,
          curveStepCount: 9,
          fillStyle: "hachure",
          fillWeight: -1,
          hachureAngle: -41,
          hachureGap: -1,
          dashOffset: -1,
          dashGap: -1,
          zigzagOffset: -1,
          seed: 0,
          disableMultiStroke: false,
          disableMultiStrokeFill: false,
          preserveVertices: false,
          fillShapeRoughnessGain: 0.8,
          randomizer: {
            seed: 0,
          },
        },
      },
      evt: evt,
    };
  }

  const handleAddText = (val) => {
    addTextFlag.current = val;
  };

  const handleAddShape = (val) => {
    addShapeFlag.current = val;
  };

  const handleTextChange = (val) => {
    setTextToAdd(val);
    textToAddRef.current = val;
  };

  const handleShapeSelect = (val) => {
    setShapeSelect(val);
    shapeSelectRef.current = val;
  };

  // Update Layer
  // Adds a layer to the layer array and draws it to the canvas
  const updateLayer = async (layer, client) => {
    switch (layer.type) {
      case "VIDEO":
        updateSDKLayer(layer, client);
        break;
      case "SCREENSHARE":
        updateSDKLayer(layer, client);
        break;
      case "IMAGE":
        updateSDKLayer(layer, client);
        break;
      default:
        break;
    }
  };

  // Updates a layer
  const updateSDKLayer = async (layer, client) => {
    try {
      const { name, device, type, ...layerProps } = layer;
      await client.updateVideoDeviceComposition(name, layerProps);
    } catch (err) {
      throw Error(err);
    }
  };

  // Add Layer
  // Adds a layer to the layer array and draws it to the canvas
  const addLayer = async (layer, client) => {
    try {
      switch (layer.type) {
        case "VIDEO":
          await addVideoLayer(layer, client);
          break;
        case "SCREENSHARE":
          await addScreenshareLayer(layer, client);
          break;
        case "IMAGE":
          await addImageLayer(layer, client);
          break;
        case "CANVAS":
          await addImageCanvasLayer(layer, client);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Adds a video layer
  const addVideoLayer = async (layer, client) => {
    try {
      if (layer.visible) {
        const { name, device, ...layerProps } = layer;

        // If a layer with the same name is already added, remove it
        if (client.getVideoInputDevice(layer.name)) {
          await removeLayer(layer, client);
        }

        // Width: 1920, Height: 1080 is 16:9 "1080p"
        // Width: 3840, Height: 2160 is 16:9 "4k"
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: device.deviceId },
            width: {
              ideal: 1920,
              max: 3840,
            },
            height: {
              ideal: 1080,
              max: 2160,
            },
          },
          audio: true,
          aspectRatio: { ideal: 16 / 9 },
          frameRate: 30,
        });

        await client.addVideoInputDevice(cameraStream, name, layerProps);
      }
    } catch (err) {
      throw Error(err);
    }
  };

  // Adds a screenshare layer
  const addScreenshareLayer = async (layer, client) => {
    try {
      if (layer.visible) {
        const { name, stream, ...layerProps } = layer;

        // If a layer with the same name is already added, remove it
        if (client.getVideoInputDevice(layer.name)) {
          await removeLayer(layer, client);
        }

        await client.addVideoInputDevice(stream, name, layerProps);
      }
    } catch (err) {
      throw Error(err);
    }
  };

  // Adds an image layer
  const addImageLayer = async (layer, client) => {
    try {
      const { name, imageSrc, type, ...layerProps } = layer;

      // If a layer with the same name is already added, throw an error
      if (client.getVideoInputDevice(layer.name)) {
        await removeLayer(layer, client);
      }

      const img = new Image();
      img.src = `${imageSrc}`;

      img.addEventListener(
        "load",
        async () => {
          await client.addImageSource(img, name, layerProps);
        },
        { once: true }
      );
    } catch (err) {
      throw Error(err);
    }
  };

  // Adds a canvas layer
  const addImageCanvasLayer = async (layer, client) => {
    try {
      const { name, imageSrc, type, ...layerProps } = layer;

      // If a layer with the same name is already added, throw an error
      if (client.getVideoInputDevice(name)) {
        await removeLayer(layer, client);
        await updateSDKLayer(layer, client);
      }

      const img = imageSrc;
      await client.addImageSource(img, name, layerProps);
    } catch (err) {
      throw Error(err);
    }
  };

  // Remove layer
  // Removes a layer from the layer array and removes it from the canvas
  const removeLayer = async (layer, client) => {
    if (!layer) return;
    try {
      const { name } = layer;
      if (!name) return;
      switch (layer.type) {
        case "VIDEO":
          const videoStream = client.getVideoInputDevice(name);
          if (videoStream) {
            for (const track of videoStream.source.getVideoTracks()) {
              track.stop();
            }
          }
          await client.removeVideoInputDevice(name);
          break;
        case "SCREENSHARE":
          const screenShareStream = client.getVideoInputDevice(name);
          if (screenShareStream) {
            for (const track of screenShareStream.source.getVideoTracks()) {
              track.stop();
            }
          }
          await client.removeVideoInputDevice(name);
          break;
        case "IMAGE":
          await client.removeImage(name);
          break;
        case "CANVAS":
          await client.removeImage(name);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(err);
    }
  };

  async function redrawPaths() {
    const canvas = document.getElementById("wb-preview");
    const context = canvas?.getContext("2d");
    const drawPaths = () => {
      path?.forEach((strokes, index) => {
        context.beginPath();
        const strokessOnCurrentPage = strokes.element.filter(
          (stroke) => stroke.pageNum === window.pageNum
        );
        strokessOnCurrentPage.forEach((point, i) => {
          context.strokeStyle = point.newColour;
          context.lineWidth = point.newLinewidth;

          var midPoint = midPointBtw(point.clientX, point.clientY);
          context.quadraticCurveTo(
            point.clientX,
            point.clientY,
            midPoint.x,
            midPoint.y
          );
          context.lineTo(point.clientX, point.clientY);
          context.stroke();
        });
        context.closePath();
        context.save();
      });
    };

    if (path !== undefined && path.length > 0) drawPaths();
  }

  async function redrawShapes() {
    const canvas = document.getElementById("wb-preview");
    const context = canvas?.getContext("2d");
    context.lineWidth = shapeWidth;
    const elementsOnCurrentPage = elements.filter(
      (element) => element.pageNum === window.pageNum
    );
    if (elementsOnCurrentPage?.length) {
      context.fillStyle = wbBgColor;
      context.fillRect(0, 0, wbRef.current.width, wbRef.current.height);
    }
    if (path !== undefined && path.length > 0) await redrawPaths();
    for (const { roughElement, ...rest } of elementsOnCurrentPage) {
      if (rest.type === "text") {
        drawText(
          context,
          rest.evt,
          rest.id,
          rest.width,
          rest.strokeColor,
          rest.value
        );
      } else {
        context.globalAlpha = "1";
        context.strokeStyle = roughElement?.options?.stroke;
        roughCanvas.draw(roughElement);
      }
    }
  }

  async function whiteboardInitialize() {
    const canvas = document.getElementById("wb-preview");
    if (canvas && wbRef.current) {
      const context = canvas?.getContext("2d");
      context.lineCap = "round";
      context.lineJoin = "round";

      context.save();

      if (wbToolType === "eraser" && popped === true) {
        context.fillStyle = wbBgColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        setPopped(false);
      }
      if (!roughCanvas) {
        roughCanvas = rough.canvas(canvas);
      }
      context.fillStyle = wbBgColor;
      context.fillRect(0, 0, wbRef.current.width, wbRef.current.height);
      if (pdfFileRef.current) {
        // await loadPdfDoc(pdfFileRef.current, false);
        await renderPage(window.pageNum);
        // await handlePersistAsPDF(window.pageNum);
      }
      if (imgFileRef.current) {
        await loadImage(imgFileRef.current);
      }

      await redrawPaths();
      if (!pdfFileRef.current) {
        await redrawShapes();
      }
      if (pdfFileRef.current) {
        await handlePersistAsPDF(window.pageNum);
      }

      return () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
      };
    }
  }

  useEffect(() => {
    if (showWhiteBoard) whiteboardInitialize();
  }, [
    popped,
    wbRef,
    pdfFileRef,
    pageNum,
    showWhiteBoard,
    wbBgColor,
    isResizing,
  ]);

  useEffect(() => {
    if (showWhiteBoard) redrawPaths();
  }, [path, width, showWhiteBoard]);

  useEffect(() => {
    if (showWhiteBoard) redrawShapes();
  }, [elements, showWhiteBoard]);

  const updateElement = (
    index,
    x1,
    y1,
    x2,
    y2,
    wbToolType,
    strokeWidth,
    strokeColor,
    ctx,
    _mouseEvent
  ) => {
    let updatedElement = createElement(
      index,
      x1,
      y1,
      x2,
      y2,
      wbToolType,
      strokeWidth,
      strokeColor,
      ctx
    );
    const elementsCopy = [...elements];
    elementsCopy[index] = { ...elementsCopy[index], ...updatedElement };
    setElements(elementsCopy);
  };

  const checkPresent = (clientX, clientY, _pageNum) => {
    if (path === undefined) return;
    var newPath = [...path];
    path.forEach((stroke, index) => {
      if (
        ((clientX >= stroke.x1 && clientX <= stroke.x2) ||
          (clientX >= stroke.x2 && clientX <= stroke.x1)) &&
        ((clientY >= stroke.y1 && clientY <= stroke.y2) ||
          (clientY >= stroke.y2 && clientY <= stroke.y1)) &&
        stroke.pageNum === pageNum
      ) {
        newPath.splice(index, 1);
        setPopped(true);
        setPath(newPath);
        return;
      }
    });
    const newElements = [...elements];
    newElements.forEach((ele, index) => {
      const range = 15; // Adjust the range value as needed
      if (ele.type === "text") {
        // const _newelements = elements.filter((ele, index) => {
        //   if (
        //     ele.type === "text" &&
        //     clientY >= ele.y1 - range &&
        //     clientY <= ele.y2 + range &&
        //     clientX >= ele.x1 - range &&
        //     clientX <= ele.x2 + range &&
        //     ele.pageNum === window.pageNum
        //   ) {
        //     setPopped(true);
        //     return false;
        //   }
        //   return true;
        // });
        // setElements(_newelements);
        if (
          clientY >= ele.y1 - range &&
          clientY <= ele.y2 + range &&
          clientX >= ele.x1 - range &&
          clientX <= ele.x2 + range &&
          ele.pageNum === pageNum
        ) {
          newElements.splice(index, 1);
          setPopped(true);
          setElements(newElements);
        }
      } else {
        if (ele.type === "circle") {
          const a = { x: ele.x1, y: ele.y1 };
          const b = { x: ele.x2, y: ele.y2 };
          const c = { x: clientX, y: clientY };
          const inside =
            Math.abs(distance(a, c)) < distance(a, b) ? true : false;
          if (inside) {
            newElements.splice(index, 1);
            setPopped(true);
            setElements(newElements);
          }
        } else if (
          ((clientX >= ele.x1 && clientX <= ele.x2) ||
            (clientX >= ele.x2 && clientX <= ele.x1)) &&
          ((clientY >= ele.y1 && clientY <= ele.y2) ||
            (clientY >= ele.y2 && clientY <= ele.y1)) &&
          ele.pageNum === pageNum
        ) {
          newElements.splice(index, 1);
          setPopped(true);
          setElements(newElements);
        }
      }
    });
  };

  const handlePersistAsPDF = async (pageNum) => {
    // Draw the canvas content onto the PDF page
    const imageBytes = await convertCanvasToUint8Array(wbRef.current);
    modifiedPagesDownlaodRef.current.set(pageNum - 1, {
      pageNum: pageNum - 1,
      imageBytes: imageBytes,
    });
  };

  async function handleSaveAsPDF(file, topic, _pageNum, clearPDFAfterDownload) {
    // await handlePersistAsPDF(window.pageNum);
    // pdfJSLib.GlobalWorkerOptions.workerSrc = pdfJSWorker;
    // const reader = new FileReader();
    // reader.onload = async (event) => {
    //   const pdfData = new Uint8Array(event.target.result);
    //   try {
    //     const pdfDoc = await PDFDocument.load(pdfData);

    //     for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    //       const _modPage = modifiedPagesDownlaodRef.current.get(i);
    //       if (modifiedPagesDownlaodRef.current.size > 0 && _modPage) {
    //         // const { width, height } = pdfDoc.getPage(i).getSize();
    //         const page = pdfDoc.getPage(i);
    //         // // Draw canvas image on each page
    //         const pdfImage = await pdfDoc.embedPng(_modPage.imageBytes);
    //         page.setSize(wbRef.current.width, wbRef.current.height);
    //         page.drawImage(pdfImage, {
    //           x: 0,
    //           y: 0,
    //           width: wbRef.current.width,
    //           height: wbRef.current.height,
    //         });
    //       }
    //     }
    //     const modifiedPdfBytes = await pdfDoc.save();
    //     // Download the modified PDF
    //     const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
    //     const link = document.createElement("a");
    //     link.href = window.URL.createObjectURL(blob);
    //     link.download = `WBSlide-${new Date().getTime()}-${topic}.pdf`;
    //     link.click();

    //     if (clearPDFAfterDownload) {
    //       handleErasePDF(pdfViewPort.current);
    //     }
    //   } catch (error) {
    //     console.error("Error loading PDF:", error);
    //   }
    // };
    // reader.readAsArrayBuffer(file);
  }

  async function convertCanvasToUint8Array(canvas) {
    return new Promise((resolve, reject) => {
      // Get canvas data as data URL
      const imageDataURL = canvas.toDataURL("image/png"); // Change to desired image format if needed

      // Convert data URL to Blob
      const blob = dataURLToBlob(imageDataURL);

      // Read Blob as ArrayBuffer
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(uint8Array);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(blob);
    });
  }
  // Function to convert data URL to Blob
  function dataURLToBlob(dataURL) {
    const parts = dataURL.split(";base64,");
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }
  const resetToolTopencil = (flag) => {
    if (
      flag ||
      wbToolType === "imageresize" ||
      ["rectangle", "line", "circle", "triangle"]?.includes(wbToolType)
    ) {
      setWBToolType("pencil");
      setCurrentPenIndex(0);
    }
  };

  const handleResetWhitboard = (page = 0, updated) => {
    const wbr = wbRef.current;
    const ctx = wbr.getContext("2d");
    ctx.fillStyle = wbBgColor;
    ctx.fillRect(0, 0, wbr.width, wbr.height);
    pdfFileRef.current = null;
    pdfDoc.current = null;
    pdfViewPort.current = null;
    inputPdfFileRef.current.value = null;
    imgFileRef.current = null;
    imgFileRefProps.current = {
      img: null,
      width: null,
      height: null,
      angle: null,
    };
    inputImgFileRef.current.value = null;
    setPageNum(page);
    window.pageNum = page;
    setElements([]);
    setPath([]);
    resetToolTopencil(false);
    if (updated) {
      setIsPageUpdated(true);
    }
  };

  const resetCompleteWB = () => {
    handleResetWhitboard(0);
    setWbPages([]);
  };

  const setWbCurrentState = async (pg) => {
    let item = wbPages[pg];
    if (item) {
      setPageNum(pg);
      window.pageNum = pg;
      if (item?.img) {
        imgFileRef.current = item?.img;
        imgFileRefProps.current = item?.imgProps;
      } else {
        setElements(item?.elements);
      }
      setPath(item?.path);
      await whiteboardInitialize();
      setIsPageUpdated(false);
    }
  };

  const saveWbCurrentState = async (flag, pg) => {
    if (flag) {
      let copyWbPages = [...wbPages];
      copyWbPages[pg] = {
        pageNo: pg,
        elements: [...elements],
        path: [...path],
        imgByte: await convertCanvasToUint8Array(wbRef.current),
        img: imgFileRef.current,
        imgProps: imgFileRefProps.current,
      };
      setWbPages(copyWbPages);
      handleResetWhitboard(copyWbPages.length);
      setIsPageUpdated(false);
    } else {
      handleResetWhitboard(wbPages.length);
    }
  };

  const saveWbPagesPDF = async () => {
    try {
      let copyWbPages = [...wbPages];
      if (elements?.length || path?.length || imgFileRef.current) {
        copyWbPages[pageNum] = {
          pageNo: pageNum,
          elements: elements,
          path: path,
          imgByte: await convertCanvasToUint8Array(wbRef.current),
          img: imgFileRef.current,
          imgProps: imgFileRefProps.current,
        };
        setWbPages(copyWbPages);
      }
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      for (const item of copyWbPages || []) {
        const page = pdfDoc.addPage([
          wbRef.current.width,
          wbRef.current.height,
        ]);
        // // Draw canvas image on each page
        const pdfImage = await pdfDoc.embedPng(item?.imgByte);
        page.setSize(wbRef.current.width, wbRef.current.height);
        page.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: wbRef.current.width,
          height: wbRef.current.height,
        });
      }
      const modifiedPdfBytes = await pdfDoc.save();
      // Download the modified PDF
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `WBSlide-${new Date().getTime()}.pdf`;
      link.click();
    } catch (error) {
      console.error("Error saving PDF:", error);
    }
  };

  const updatePageElements = (items, pg) => {
    return items?.map((item) => ({ ...item, pageNum: pg }));
  };

  const updatePagePath = (items, pg) => {
    return items?.map((item) => ({
      ...item,
      pageNum: pg,
      element: item?.element?.map((elem) => ({ ...elem, pageNum: pg })),
    }));
  };

  const deleteWbPage = (pageNo) => {
    let copyWbPages = [...wbPages];
    const indexToDelete = copyWbPages?.findIndex(
      (page) => page.pageNo === pageNo
    );

    if (indexToDelete !== -1) {
      copyWbPages?.splice(indexToDelete, 1);

      // Adjust pageNo values for subsequent pages
      for (let i = indexToDelete; i < copyWbPages.length; i++) {
        if (copyWbPages[i].elements.length)
          copyWbPages[i].elements = updatePageElements(
            [...copyWbPages[i].elements],
            copyWbPages[i].pageNo - 1
          );
        if (copyWbPages[i].path.length)
          copyWbPages[i].path = updatePagePath(
            [...copyWbPages[i].path],
            copyWbPages[i].pageNo - 1
          );
        copyWbPages[i].pageNo--;
      }
    }
    handleResetWhitboard(copyWbPages.length);
    setWbPages(copyWbPages);
  };

  return {
    wbRef,
    wbBgColor,
    setWbBgColor,
    textToAdd,
    updateLayer,
    addLayer,
    removeLayer,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleAddText,
    handleTextChange,
    handleAddShape,
    handleShapeSelect,
    selectPdf,
    selectImage,
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
    inputImgFileRef,
    imgFileRef,
    rotateImg,
    textToAddRef,
    pageNum,
    setPageNum,
    pdfViewPort,
    handleErasePDF,
    handleImageClear,
    handleSaveAsPDF,
    handlePersistAsPDF,
    images,
    setImages,
    elements,
    handleResetWhitboard,
    resetCompleteWB,
    path,
    showWhiteBoard,
    setShowWhiteBoard,
    wbPages,
    deleteWbPage,
    setWbCurrentState,
    saveWbCurrentState,
    saveWbPagesPDF,
    isPageUpdated,
  };
};

export default useWhiteboard;
