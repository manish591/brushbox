import { HANDLER_SIZE, ROTATION_HANDLER_OFFSET, SHAPE_HANDLERS } from "../constants/shape-handlers";
import { TMovingOffsets } from "../tools/selectTool";
import { rotate } from "../utils/math";
import { BaseShape, TBaseShape, TShapeBounds, TShapeHandler, TShapes } from "./baseShape";

export type TRectangle = Partial<TBaseShape> & {
  type?: TShapes,
  angle?: number,
  x: number,
  y: number,
  width: number,
  height: number,
}

export class Rectangle extends BaseShape {
  type: TShapes;
  angle: number;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(options: TRectangle) {
    super(options);
    this.type = options.type ?? "rectangle";
    this.angle = options.angle ?? 0;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
  }

  draw(canvas: HTMLCanvasElement): void {
    const context = canvas.getContext("2d")!;
    if (!context) return;

    context.save();
    context.beginPath();
    context.fillStyle = this.backgroundColor;
    context.strokeStyle = this.strokeColor;
    context.translate(this.x + this.width / 2, this.y + this.height / 2);
    context.rotate(this.angle);
    context.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    context.stroke();
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
        type: SHAPE_HANDLERS.BOTTOM,
        x: (bounds.startX + bounds.endX) / 2 - (HANDLER_SIZE / 2),
        y: bounds.endY,
      },
      {
        type: SHAPE_HANDLERS.TOP,
        x: (bounds.startX + bounds.endX) / 2 - (HANDLER_SIZE / 2),
        y: bounds.startY - HANDLER_SIZE,
      },
      {
        type: SHAPE_HANDLERS.RIGHT,
        x: bounds.endX,
        y: (bounds.startY + bounds.endY) / 2 - (HANDLER_SIZE / 2),
      },
      {
        type: SHAPE_HANDLERS.LEFT,
        x: bounds.startX - HANDLER_SIZE,
        y: (bounds.startY + bounds.endY) / 2 - (HANDLER_SIZE / 2),
      },
      {
        type: SHAPE_HANDLERS.TOP_LEFT,
        x: bounds.startX - HANDLER_SIZE,
        y: bounds.startY - HANDLER_SIZE,
      },
      {
        type: SHAPE_HANDLERS.TOP_RIGHT,
        x: bounds.endX,
        y: bounds.startY - HANDLER_SIZE,
      },
      {
        type: SHAPE_HANDLERS.BOTTOM_LEFT,
        x: bounds.startX - HANDLER_SIZE,
        y: bounds.endY,
      },
      {
        type: SHAPE_HANDLERS.BOTTOM_RIGHT,
        x: bounds.endX,
        y: bounds.endY,
      },
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

  translate({ offsetX, offsetY }: TMovingOffsets): void {
    this.x = offsetX;
    this.y = offsetY;
  }

  rotate(angle: number): void {
    this.angle = angle;
  }
}