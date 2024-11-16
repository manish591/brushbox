import { ROTATION_HANDLER_OFFSET, SHAPE_HANDLERS } from "../constants/shape-handlers";
import { TMovingOffsets } from "../tools/selectTool";
import { distanceBetweenTwoPoints, rotate } from "../utils/math";
import { BaseShape, TBaseShape, TShapeBounds, TShapeHandler, TShapes } from "./baseShape";

export type FreeDrawPoints = [number, number];

export type TFreeDraw = Partial<TBaseShape> & {
  type?: TShapes,
  angle?: number,
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  points: FreeDrawPoints[];
}

export class Freedraw extends BaseShape {
  type: TShapes;
  angle: number;
  x: number;
  y: number;
  width: number;
  height: number;
  points: FreeDrawPoints[];

  constructor(options: TFreeDraw) {
    super(options);
    this.type = options.type ?? "freedraw";
    this.angle = options.angle ?? 0;
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.width = options.width ?? 0;
    this.height = options.height ?? 0;
    this.points = options.points;
  }

  draw(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext("2d")!;
    if (!context) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    this.points.forEach(([a, b]) => {
      minX = Math.min(minX, a);
      maxX = Math.max(maxX, a);
      minY = Math.min(minY, b);
      maxY = Math.max(maxY, b);
    });

    const cx = (minX + maxX) / 2;
    const cy = (maxY + minY) / 2;

    context.save();
    context.beginPath();
    context.translate(cx, cy);
    context.rotate(this.angle);
    context.translate(-cx, -cy);
    context.moveTo(this.points[0][0], this.points[0][1]);

    for (let i = 1; i < this.points.length; i++) {
      context.lineTo(this.points[i][0], this.points[i][1]);
    }

    context.stroke();
    context.restore();
  }

  contain(x: number, y: number): boolean {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    this.points.forEach(([a, b]) => {
      minX = Math.min(minX, a);
      maxX = Math.max(maxX, a);
      minY = Math.min(minY, b);
      maxY = Math.max(maxY, b);
    });

    const cx = (minX + maxX) / 2;
    const cy = (maxY + minY) / 2;

    const [rotatedX, rotatedY] = rotate(x, y, cx, cy, -this.angle);

    for (let i = 1; i < this.points.length; i++) {
      const point1 = this.points[i];
      const point2 = this.points[i - 1];
      const ab = distanceBetweenTwoPoints({ x: point1[0], y: point1[1] }, { x: point2[0], y: point2[1] });
      const ac = distanceBetweenTwoPoints({ x: point1[0], y: point1[1] }, { x: rotatedX, y: rotatedY });
      const bc = distanceBetweenTwoPoints({ x: rotatedX, y: rotatedY }, { x: point2[0], y: point2[1] });

      if (Math.abs(ab - (ac + bc)) < 1) {
        return true;
      }
    }
    return false;
  }

  getBounds(): TShapeBounds {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    this.points.forEach(([a, b]) => {
      minX = Math.min(minX, a);
      maxX = Math.max(maxX, a);
      minY = Math.min(minY, b);
      maxY = Math.max(maxY, b);
    });

    return {
      startX: minX,
      startY: minY,
      endX: maxX,
      endY: maxY,
    }
  }

  getHandlers(): TShapeHandler[] {
    const bounds = this.getBounds();

    return [
      {
        type: SHAPE_HANDLERS.ROTATION,
        x: ((bounds.startX + bounds.endX) / 2),
        y: bounds.startY - ROTATION_HANDLER_OFFSET,
      }
    ]
  }

  getRotationAngle(): number {
    return this.angle;
  }

  translate({
    offsetX,
    offsetY,
    pointsOffsets
  }: TMovingOffsets): void {
    this.x = offsetX;
    this.y = offsetY;
    this.points = pointsOffsets!;
  }

  rotate(angle: number): void {
    this.angle = angle;
  }
}