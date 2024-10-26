import type { Element } from "./element";

export function clearCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d")!;
  context.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawRectangle(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number
) {
  const context = canvas.getContext("2d")!;
  if (!context) return;

  context.save();
  context.beginPath();
  context.translate(x + width / 2, y + height / 2);
  context.rotate(angle);
  context.rect(-width / 2, -height / 2, width, height);
  context.stroke();
  context.restore();
}

export function drawEllipse(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
) {
  const context = canvas.getContext("2d")!;
  if (!context) return;

  const originX = Math.floor((x + (x + width)) / 2);
  const originY = Math.floor((y + (y + height)) / 2);
  const radiusX = Math.floor(Math.abs(width) / 2);
  const radiusY = Math.floor(Math.abs(height) / 2);

  context.save();
  context.beginPath();
  context.translate(originX, originY);
  context.rotate(angle);
  context.ellipse(0, 0, radiusX, radiusY, Math.PI, 0, 2 * Math.PI);
  context.stroke();
  context.restore();
}

export function drawLine(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number
) {
  const context = canvas.getContext("2d")!;
  if (!context) return;

  const centerX = (x + (x + width)) / 2;
  const centerY = (y + (y + height)) / 2;

  context.save();
  context.beginPath();
  context.translate(centerX, centerY);
  context.rotate(angle);
  context.moveTo(x - centerX, y - centerY);
  context.lineTo((x + width) - centerX, (y + height) - centerY);
  context.stroke();
  context.restore();
}

export const drawSelectionBorder = (
  canvas: HTMLCanvasElement,
  element: Element
) => {
  const context = canvas.getContext("2d")!;
  const { x, y, width, height, angle } = element;
  const minX = x;
  const minY = y;
  const maxX = x + Math.abs(width);
  const maxY = y + Math.abs(height);
  const threshold = 5;
  const cornerSize = 8;
  const offset = 25;
  const offsetX = ((maxX - minX) + threshold * 2) / 2;
  const offsetY = ((maxY - minY) + threshold * 2) / 2;

  const corners = [
    [-offsetX, -offsetY],
    [0, -offsetY],
    [offsetX, -offsetY],
    [offsetX, 0],
    [-offsetX, offsetY],
    [0, offsetY],
    [offsetX, offsetY],
    [-offsetX, 0],
  ];

  context.save();
  context.strokeStyle = "blue";
  context.fillStyle = "white";

  context.translate((maxX + minX) / 2, (maxY + minY) / 2);
  context.rotate(angle);

  // draw main border
  context.strokeRect(
    -offsetX,
    -offsetY,
    (maxX - minX) + threshold * 2,
    (maxY - minY) + threshold * 2
  );

  // draw corners
  corners.forEach(([cx, cy]) => {
    context.beginPath();
    context.rect(cx - cornerSize / 2, cy - cornerSize / 2, cornerSize, cornerSize);
    context.fill();
    context.stroke();
  });

  // draw rotation circle
  context.beginPath();
  context.arc(0, -((maxY - minY)) / 2 - offset, 4, 0, Math.PI * 2, true);
  context.stroke();

  context.restore();
};

export const drawSelectionPath = (
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const context = canvas.getContext("2d")!;
  if (!context) return;

  context.save();
  context.beginPath();
  context.strokeStyle = "blue";
  context.fillStyle = "rgba(144, 238, 144, 0.06)";
  context.rect(x, y, width, height);
  context.stroke();
  context.fill();
  context.restore();
};

export function draw(canvas: HTMLCanvasElement, element: Element) {
  const context = canvas.getContext("2d")!;
  if (!context) return;

  const { x, y, width, height, type, angle } = element;

  if (type === "selection") {
    drawSelectionPath(canvas, x, y, width, height);
  } else if (type === "rectangle") {
    drawRectangle(canvas, x, y, width, height, angle);
  } else if (type === "ellipse") {
    drawEllipse(canvas, x, y, width, height, angle);
  }
}