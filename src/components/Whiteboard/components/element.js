import rough from "roughjs/bundled/rough.esm";
const generator = rough.generator();

// const drawRectangle = (ctx, x1, y1, x2, y2) => {
//   ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
// };
// const drawCircle = (ctx, x1, y1, x2, y2) => {
//   const radiusX = x2 - x1;
//   const radiusY = y2 - y1;
//   const radius = Math.min(radiusX, radiusY);
//   ctx.beginPath();
//   ctx.arc(x1, y1, 3.14 * radius * radius, 0, 2 * Math.PI); // x, y, radius, startAngle, endAngle
//   ctx.stroke();
// };

export const createTextElement = (
  id,
  x1,
  y1,
  x2,
  y2,
  type,
  width,
  strokeColor,
  wbRef
) => {
  const ctx = wbRef.current.getContext("2d");
  ctx.font = "18px Arial";
  // Get the input field
  const inputField = document.createElement("input");
  document.getElementById("root").innerHTML(inputField);
  inputField.style.position = "";
  // Event listener to update canvas text when input field changes
  inputField.addEventListener("input", function () {
    const text = this.value; // Get the input value
    // Clear canvas and redraw text
    ctx.clearRect(0, 0, 50, 100);
    ctx.font = "20px Arial";
    ctx.fillText(text, 50, 100);
  });
};
export function createElement(
  id,
  x1,
  y1,
  x2,
  y2,
  type,
  width,
  strokeColor,
  ctx
) {
  let roughElement = null;
  switch (type) {
    case "line":
      roughElement = generator.line(x1, y1, x2, y2, {
        stroke: strokeColor,
        strokeWidth: width,
        roughness: 0,
      });
      break;
    case "rectangle":
      roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
        stroke: strokeColor,
        strokeWidth: width,
        roughness: 0,
      });
      break;
    case "circle":
      roughElement = generator.circle(
        x1,
        y1,
        2 * Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
        {
          stroke: strokeColor,
          strokeWidth: width,
          roughness: 0,
        }
      );
      break;
    case "triangle":
      roughElement = generator.linearPath(
        [
          [x1, y1],
          [x2, y2],
          [x1, y2],
          [x1, y1],
        ],
        {
          stroke: strokeColor,
          strokeWidth: width,
          roughness: 0,
        }
      );
      break;
    default:
      generator.line(0, 0, 0, 0, { roughness: 0 });
  }

  return {
    id,
    x1,
    y1,
    x2,
    y2,
    type,
    roughElement,
    width,
    strokeColor,
  };
}
const nearPoint = (x, y, x1, y1, name) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
};
const positionWithinElement = (x, y, element) => {
  const { type, x1, x2, y1, y2 } = element;
  if (["rectangle", "triangle"]?.includes(type)) {
    const topLeft = nearPoint(x, y, x1, y1, "tl");
    const topRight = nearPoint(x, y, x2, y1, "tr");
    const bottomLeft = nearPoint(x, y, x1, y2, "bl");
    const bottomRight = nearPoint(x, y, x2, y2, "br");
    const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    return topLeft || inside || topRight || bottomLeft || bottomRight;
  } else if (type === "circle") {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const radius = distance(a,b);
    const curr = distance(a,c);
    const start = nearPoint(x, y, x1, y1, "start");
    const end = nearPoint(x, y, x2, y2, "end");
    const border =  Math.floor(Math.abs(curr)) === Math.floor(Math.abs(radius)) ? "end" : null;
    const inside = Math.abs(curr) < radius ? "inside" : null;
    return start || end || border || inside;
  } else {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    const start = nearPoint(x, y, x1, y1, "start");
    const end = nearPoint(x, y, x2, y2, "end");
    const inside = Math.abs(offset) < 1 ? "inside" : null;
    return start || end || inside;
  }
};
export const distance = (a, b) =>
  Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

export const getElementAtPosition = (x, y, elements) => {
  return elements
    .map((ele) => ({
      ...ele,
      position: positionWithinElement(x, y, ele),
    }))
    .find((ele) => ele.position !== null);
};

export const adjustElementCoordinates = (element) => {
  const { type, x1, y1, x2, y2 } = element;
  if (type === "rectangle") {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    return { x1: minX, y1: minY, x2: maxX, y2: maxY };
  } else {
    if (x1 < x2 || (x1 === x2 && y1 < y2)) {
      return { x1, y1, x2, y2 };
    } else {
      return { x1: x2, y1: y2, x2: x1, y2: y1 };
    }
  }
};
export const cursorForPosition = (position) => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move";
  }
};
export const resizedCoordinates = (clientX, clientY, position, coordinates) => {
  const { x1, y1, x2, y2 } = coordinates;
  switch (position) {
    case "tl":
    case "start":
      return { x1: clientX, y1: clientY, x2, y2 };
    case "tr":
      return { x1, y1: clientY, x2: clientX, y2 };
    case "bl":
      return { x1: clientX, y1, x2, y2: clientY };
    case "br":
    case "end":
      return { x1, y1, x2: clientX, y2: clientY };
    default:
      return null;
  }
};

export const midPointBtw = (p1, p2) => {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  };
};

export const getCoordinatesForTranslate = (angle, width, height) => {
  let x, y, w, h;
  console.log("relative angle", angle);
  switch (parseInt(angle)) {
    case 0:
      x = 0;
      y = 0;
      w = width;
      h = height;
      break;
    case 90:
      x = height;
      y = 0;
      w = height;
      h = width;
      break;
    case 180:
      x = width;
      y = height;
      w = width;
      h = height;
      break;
    case 270:
      x = 0;
      y = width;
      w = height;
      h = width;
      break;
    default:
      x = 0;
      y = 0;
      w = width;
      h = height;
  }
  return { x, y, w, h };
};
