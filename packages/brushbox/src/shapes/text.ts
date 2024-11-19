import {
  BaseShape,
  TBaseShape,
  TShapeBounds,
  TShapeHandler,
  TShapes
} from "./baseShape";
import { ROTATION_HANDLER_OFFSET, SHAPE_HANDLERS } from "../constants/shape-handlers";
import { TMovingOffsets } from "../tools/selectTool";
import { rotate } from "../utils/math";

export type TText = Partial<TBaseShape> & {
  type?: TShapes,
  angle?: number,
  x?: number,
  y?: number,
  width?: number,
  height?: number,
  fontSize?: number,
  fontFamily?: string,
  text: string
}

export class Text extends BaseShape {
  type: TShapes;
  angle: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  fontFamily: string;

  constructor(options: TText) {
    super(options);
    this.type = options.type ?? "freedraw";
    this.angle = options.angle ?? 0;
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.width = options.width ?? 30;
    this.height = options.height ?? 30;
    this.text = options.text;
    this.fontFamily = options.fontFamily ?? "Aerial";
    this.fontSize = options.fontSize ?? 24;
  }

  draw(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext("2d")!;
    if (!context) return;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    context.save();
    context.beginPath();
    context.translate(cx, cy);
    context.rotate(this.angle);
    context.textBaseline = "top";
    context.font = `${this.fontSize}px ${this.fontFamily}`;

    this.text.split("\n").forEach((chunk, index) => {
      context.fillText(chunk, -this.width / 2, -this.height / 2 + (24 * index));
    });

    context.restore();
  }

  contain(x: number, y: number): boolean {
    const minX = Math.min(this.x, this.x + this.width);
    const maxX = Math.max(this.x, this.x + this.width);
    const minY = Math.min(this.y, this.y + this.height);
    const maxY = Math.max(this.y, this.y + this.height);

    const [rotatedX, rotatedY] = rotate(x, y, (minX + maxX) / 2, (minY + maxY) / 2, -this.angle);

    return rotatedX >= minX && rotatedX <= maxX && rotatedY >= minY && rotatedY <= maxY;
  }

  getBounds(): TShapeBounds {
    const minX = Math.min(this.x, this.x + this.width);
    const maxX = Math.max(this.x, this.x + this.width);
    const minY = Math.min(this.y, this.y + this.height);
    const maxY = Math.max(this.y, this.y + this.height);

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
  }: TMovingOffsets): void {
    this.x = offsetX;
    this.y = offsetY;
  }

  rotate(angle: number): void {
    this.angle = angle;
  }
}