import React from "react";
import { Pencil, Marker, Strokes} from "../theme/svg";
import { Popover, Tooltip } from "antd";

const PenPencilComponents = ({
  wbToolType,
  colorWidth,
  setWidth,
  setWBToolType,
  setDisplayStroke,
  setShapeWidth,
  currentIndex,
  setCurrentIndex
}) => {
  // const [currentIndex, setCurrentIndex] = useState(0);

  const _shapes = [
    {
      id: 1,
      comp: (
        <Pencil
          wbToolType={wbToolType}
          colorWidth={colorWidth}
          fill={wbToolType === "pencil" ? "#1570EF" : "#000000"}
        />
      ),
      domprop: { id: "line", title: "Rectangle", toolVal: "line" },
    },
    {
      id: 2,
      comp: (
        <Marker
          wbToolType={wbToolType}
          colorWidth={colorWidth}
          fill={wbToolType === "brush" ? "#1570EF" : "#0000000"}
        />
      ),
      domprop: { id: "_rectangle", title: "Rectangle", toolVal: "rectangle" },
    },
    {
      id: 3,
      comp: (
        <Strokes
          wbToolType={wbToolType}
          colorWidth={colorWidth}
          fill={
            wbToolType === "pencil" ||
            wbToolType === "brush"
              ? "#1570EF"
              : "#000000"
          }
        />
      ),
      domprop: { id: "shapes", title: "Rectangle", toolVal: "shapes" },
    },
  ];

  return (
    <Tooltip placement="right" title={"Sketch"}>
      <Popover
        className="whitboard-shapers-popover"
        placement="rightTop"
        title={null}
        content={
          <div className="icon-bar column-bar">
            <button
              id="pencil"
              data-toggle="tooltip"
              data-placement="top"
              title="Pencil"
              onClick={() => {
                setWBToolType("pencil");
                // setWidth(1);
                // setShapeWidth(1);
                setDisplayStroke(false);
                setCurrentIndex(0)
              }}
            >
              <Pencil
                wbToolType={wbToolType}
                colorWidth={colorWidth}
                fill={wbToolType === "pencil" ? "#1570EF" : "black"}
              />
            </button>
            <button
              id="brush"
              data-toggle="tooltip"
              data-placement="top"
              title="Brush"
              onClick={() => {
                setWBToolType("brush");
                // setWidth(5);
                // setShapeWidth(5);
                setDisplayStroke(false);
                setCurrentIndex(1)
              }}
            >
              <Marker
                wbToolType={wbToolType}
                colorWidth={colorWidth}
                fill={wbToolType === "brush" ? "#1570EF" : "black"}
              />
            </button>
            {/* <hr width="80%" />
            <button
              id="stroke"
              data-toggle="tooltip"
              data-placement="top"
              title="Stroke"
              onClick={() => {
                setCurrentIndex(2);
              }}
            >
              <Strokes
                wbToolType={wbToolType}
                colorWidth={colorWidth}
                fill={
                  wbToolType === "pencil" ||
                  wbToolType === "brush"
                    ? "#1570EF"
                    : "#0000000"
                }
              />
            </button> */}
          </div>
        }
        trigger="click"
      >
        <button
          id="_pencil"
          data-toggle="tooltip"
          data-placement="top"
          title="Rectangle"
          onClick={() => {
            setDisplayStroke(false);
          }}
        >
          {["pencil", "brush"].includes(wbToolType)
            ? _shapes[currentIndex].comp
            : _shapes[2].comp}
        </button>
      </Popover>
    </Tooltip>
  );
};

export default PenPencilComponents;
