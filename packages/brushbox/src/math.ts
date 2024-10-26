import type { Element } from "./element";
import type { Coordinate } from "./types";

export type Cursor = "n" | "w" | "e" | "s" | "nw" | "ne" | "sw" | "se" | "rotate";

export type ResizeHandler = {
  x: number,
  y: number,
  handle: Cursor
}

export function isPointLiesInsideRectangle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  angle: number,
  coords: Coordinate
) {
  // Calculate the center of the rectangle
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;

  // Translate the point to the rectangle's local coordinates
  const translatedX = coords.x - centerX;
  const translatedY = coords.y - centerY;

  // Rotate the point back by the negative angle
  const cosAngle = Math.cos(-angle);
  const sinAngle = Math.sin(-angle);

  const rotatedX = translatedX * cosAngle - translatedY * sinAngle;
  const rotatedY = translatedX * sinAngle + translatedY * cosAngle;

  // Check if the rotated point is within the original rectangle boundaries
  return (rotatedX >= (x1 - centerX) && rotatedX <= (x2 - centerX)) &&
    (rotatedY >= (y1 - centerY) && rotatedY <= (y2 - centerY));
}

export function getAbsoluteX1(element: Element) {
  return element.width >= 0 ? element.x : element.x + element.width;
}

export function getAbsoluteX2(element: Element) {
  return element.width >= 0 ? element.x + element.width : element.x;
}

export function getAbsoluteY1(element: Element) {
  return element.height >= 0 ? element.y : element.y + element.height;
}

export function getAbsoluteY2(element: Element) {
  return element.height >= 0 ? element.y + element.height : element.y;
}

export function distanceBetweenTwoPoints(a: Coordinate, b: Coordinate) {
  return Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2));
}

export function normalizeShapes(element: Element) {
  const newElement = { ...element };

  if (element.width < 0) {
    newElement.width = Math.abs(element.width);
    newElement.x = element.x + element.width;
  }

  if (element.height < 0) {
    newElement.height = Math.abs(element.height);
    newElement.y = element.y + element.height;
  }

  return newElement;
}

export function getResizeHandlers(x1: number, x2: number, y1: number, y2: number) {
  const handlers: ResizeHandler[] = [];
  const cornerSize = 8;

  // bottom
  handlers.push({
    x: (x1 + x2) / 2 - (cornerSize / 2),
    y: y2,
    handle: "s",
  });

  // top
  handlers.push({
    x: (x1 + x2) / 2 - (cornerSize / 2),
    y: y1 - cornerSize,
    handle: "n",
  });

  // right
  handlers.push({
    x: x2,
    y: (y1 + y2) / 2 - (cornerSize / 2),
    handle: "e",
  });

  // left
  handlers.push({
    x: x1 - cornerSize,
    y: (y1 + y2) / 2 - (cornerSize / 2),
    handle: "w",
  });

  // top left
  handlers.push({
    x: x1 - cornerSize,
    y: y1 - cornerSize,
    handle: "nw",
  });

  // top right
  handlers.push({
    x: x2,
    y: y1 - cornerSize,
    handle: "ne",
  });

  // bottom left
  handlers.push({
    x: x1 - cornerSize,
    y: y2,
    handle: "sw",
  });

  // bottom right
  handlers.push({
    x: x2,
    y: y2,
    handle: "se"
  });

  // rotation
  handlers.push({
    x: ((x1 + x2) / 2),
    y: y1 - 25,
    handle: "rotate"
  });

  return handlers;
}

export function rotate(x: number, y: number, cx: number, cy: number, angle: number) {
  const translatedX = x - cx;
  const translatedY = y - cy;

  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  const rotatedX = translatedX * cosAngle - translatedY * sinAngle + cx;
  const rotatedY = translatedX * sinAngle + translatedY * cosAngle + cy;

  return [rotatedX, rotatedY];
}