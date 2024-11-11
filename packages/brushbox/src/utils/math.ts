export type Coordinate = {
  x: number,
  y: number
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

export function distanceBetweenTwoPoints(a: Coordinate, b: Coordinate) {
  return Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2));
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