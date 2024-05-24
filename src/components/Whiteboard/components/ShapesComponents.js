import React, { useState } from "react";
import {
  Line,
  // Triangle,
  Rectangle,
  Circle,
  Shapes,
} from "../theme/svg";
import { Popover, Tooltip } from "antd";

const ShapesComponents = ({
  wbToolType,
  colorWidth,
  setWBToolType,
  setDisplayStroke,
  setShapeWidth,
}) => {
  const [currentIndex, setCurrentIndex] = useState(2);

  const _shapes = [
    {
      id: 1,
      comp: (
        <Line
          wbToolType={wbToolType}
          colorWidth={colorWidth}
          fill={wbToolType === "line" ? "#1570EF" : "#000000"}
        />
      ),
      domprop: { id: "line", title: "Rectangle", toolVal: "line" },
    },
    {
      id: 2,
      comp: (
        <Rectangle
          wbToolType={wbToolType}
          colorWidth={colorWidth}
          fill={wbToolType === "rectangle" ? "#1570EF" : "#0000000"}
        />
      ),
      domprop: { id: "_rectangle", title: "Rectangle", toolVal: "rectangle" },
    },
    {
      id: 3,
      comp: (
        <Circle
          wbToolType={wbToolType}
          colorWidth={colorWidth}
          fill={wbToolType === "circle" ? "#1570EF" : "#0000000"}
        />
      ),
      domprop: { id: "circle", title: "Rectangle", toolVal: "circle" },
    },
    // {
    //   id: 4,
    //   comp: (
    //     <Triangle
    //       wbToolType={wbToolType}
    //       colorWidth={colorWidth}
    //       fill={wbToolType === "triangle" ? "#1570EF" : "#0000000"}
    //     />
    //   ),
    //   domprop: { id: "triangle", title: "Rectangle", toolVal: "triangle" },
    // },
    {
      id: 4,
      comp: (
        <Shapes
          wbToolType={wbToolType}
          colorWidth={colorWidth}
          fill={
            wbToolType === "rectangle" ||
            wbToolType === "circle" ||
            wbToolType === "triangle" ||
            wbToolType === "line"
              ? "#1570EF"
              : "#000000"
          }
        />
      ),
      domprop: { id: "shapes", title: "Rectangle", toolVal: "shapes" },
    },
  ];

  return (
    <Tooltip placement="right" title={"Shapes"}>
      <Popover
        className="whitboard-shapers-popover"
        placement="rightTop"
        title={null}
        content={
          <div className="icon-bar column-bar">
            <button
              id="line"
              data-toggle="tooltip"
              data-placement="top"
              title="Line"
              onClick={() => {
                setWBToolType("line");
                setShapeWidth(1);
                setCurrentIndex(0);
              }}
            >
              <Line
                wbToolType={wbToolType}
                colorWidth={colorWidth}
                fill={wbToolType === "line" ? "#1570EF" : "#000000"}
              />
            </button>
            <button
              id="_rectangle"
              data-toggle="tooltip"
              data-placement="top"
              title="Rectangle"
              onClick={() => {
                setWBToolType("rectangle");

                setShapeWidth(1);
                setCurrentIndex(1);
              }}
            >
              <Rectangle
                wbToolType={wbToolType}
                colorWidth={colorWidth}
                fill={wbToolType === "rectangle" ? "#1570EF" : "#000000"}
              />
            </button>
            <button
              id="circle"
              data-toggle="tooltip"
              data-placement="top"
              title="Circle"
              onClick={() => {
                setWBToolType("circle");

                setShapeWidth(1);
                setCurrentIndex(2);
              }}
            >
              <Circle
                wbToolType={wbToolType}
                colorWidth={colorWidth}
                fill={wbToolType === "circle" ? "#1570EF" : "#000000"}
              />
            </button>
            {/* <button
              id="triangle"
              data-toggle="tooltip"
              data-placement="top"
              title="Triangle"
              onClick={() => {
                setWBToolType("triangle");

                setShapeWidth(1);
                setCurrentIndex(3);
              }}
            >
              <Triangle
                wbToolType={wbToolType}
                colorWidth={colorWidth}
                fill={wbToolType === "triangle" ? "#1570EF" : "#000000"}
              />
            </button> */}
            {/* <hr width="80%" />
            <button
              id="triangle"
              data-toggle="tooltip"
              data-placement="top"
              title="Triangle"
              onClick={() => {
                setCurrentIndex(4);
              }}
            >
              <Shapes
                wbToolType={wbToolType}
                colorWidth={colorWidth}
                fill={
                  wbToolType === "rectangle" ||
                  wbToolType === "circle" ||
                  wbToolType === "triangle"
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
          id="_rectangle"
          data-toggle="tooltip"
          data-placement="top"
          title="Rectangle"
          onClick={() => {
            setDisplayStroke(false);
          }}
        >
          {["line", "rectangle", "circle", "triangle"].includes(wbToolType)
            ? _shapes[currentIndex].comp
            : _shapes[3].comp}
        </button>
      </Popover>
    </Tooltip>
  );
};

export default ShapesComponents;
