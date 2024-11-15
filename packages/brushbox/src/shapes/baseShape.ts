import { createStringId } from "../utils/crypto";
import { SHAPE_HANDLERS } from "../constants/shape-handlers";
import { TMovingOffsets } from "../tools/selectTool";

export type TShapes = "rectangle" | "ellipse" | "line" | "freedraw" | "text";

export type TBaseShape = {
  id: string,
  backgroundColor: string,
  strokeColor: string,
  strokeWidth: number,
  isSelected: boolean
}

export type TShapeBounds = {
  startX: number,
  startY: number,
  endX: number,
  endY: number,
}

export type TShapeHandler = {
  type: keyof typeof SHAPE_HANDLERS,
  x: number,
  y: number,
}

export abstract class BaseShape {
  id: string;
  backgroundColor: string;
  strokeColor: string;
  strokeWidth: number;
  isSelected: boolean;

  constructor(options: Partial<TBaseShape>) {
    this.id = options.id ?? createStringId();
    this.backgroundColor = options.backgroundColor ?? "white";
    this.strokeColor = options.strokeColor ?? "black";
    this.strokeWidth = options.strokeWidth ?? 1;
    this.isSelected = options.isSelected ?? false;
  }

  abstract draw(canvas: HTMLCanvasElement): void;
  abstract contain(x: number, y: number): boolean;
  abstract getBounds(): TShapeBounds;
  abstract getHandlers(): TShapeHandler[];
  abstract translate(offsets: TMovingOffsets): void;
  abstract rotate(angle: number): void;
  abstract getRotationAngle(): number;
}