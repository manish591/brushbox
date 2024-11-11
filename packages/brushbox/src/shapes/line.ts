import { SHAPE_HANDLERS } from "../constants/shape-handlers";
import { TMovingOffsets } from "../tools/selectTool";
import { distanceBetweenTwoPoints } from "../utils/math";
import { BaseShape, TBaseShape, TShapeBounds, TShapeHandler, TShapes } from "./baseShape";

export type TLine = Partial<TBaseShape> & {
  type?: TShapes,
  angle?: number,
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number
}

export class Line extends BaseShape {
  type: TShapes;
  angle: number;
  x: number;
  y: number;
  width: number;
  height: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;

  constructor(options: TLine) {
    super(options);
    this.type = options.type ?? "rectangle";
    this.angle = options.angle ?? 0;
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.width = options.width ?? 0;
    this.height = options.height ?? 0;
    this.startX = options.startX;
    this.startY = options.startY;
    this.endX = options.endX;
    this.endY = options.endY;
  }

  draw(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext("2d")!;
    if (!context) return;

    context.save();
    context.beginPath();
    context.moveTo(this.startX, this.startY);
    context.lineTo(this.endX, this.endY);
    context.stroke();
    context.restore();
  }

  contain(x: number, y: number): boolean {
    const ab = distanceBetweenTwoPoints({ x: this.startX, y: this.startY }, { x: this.endX, y: this.endY });
    const ac = distanceBetweenTwoPoints({ x: this.startX, y: this.startY }, { x, y });
    const bc = distanceBetweenTwoPoints({ x, y }, { x: this.endX, y: this.endY });
    return Math.abs(ab - (ac + bc)) < 1;
  }

  getBounds(): TShapeBounds {
    const minX = Math.min(this.startX, this.endX);
    const maxX = Math.max(this.startX, this.endX);
    const minY = Math.min(this.startY, this.endY);
    const maxY = Math.max(this.startY, this.endY);

    return {
      startX: minX,
      startY: minY,
      endX: maxX,
      endY: maxY,
    }
  }

  getHandlers(): TShapeHandler[] {
    return [
      {
        type: SHAPE_HANDLERS.ARROW_START,
        x: this.startX,
        y: this.startY
      },
      {
        type: SHAPE_HANDLERS.ARROW_END,
        x: this.endX,
        y: this.endY
      }
    ];
  }

  getRotationAngle(): number {
    return this.angle;
  }

  translate({
    offsetX,
    offsetY,
    lineEndOffsetX,
    lineEndOffsetY,
    lineStartOffsetX,
    lineStartOffsetY
  }: TMovingOffsets): void {
    this.x = offsetX;
    this.y = offsetY;
    this.startX = lineStartOffsetX!;
    this.startY = lineStartOffsetY!;
    this.endX = lineEndOffsetX!;
    this.endY = lineEndOffsetY!;
  }

  rotate(angle: number): void {
    this.angle = angle;
  }
}