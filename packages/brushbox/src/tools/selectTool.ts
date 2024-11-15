import { HANDLER_SIZE, SHAPE_HANDLERS } from "../constants/shape-handlers";
import {
  SELECTION_BORDER_COLOR,
  SELECTION_BORDER_FILL_COLOR,
  SELECTION_RECTANGLE_BACKGROUND,
  SELECTION_RECTANGLE_COLOR
} from "../constants/shapes";
import { Scene } from "../core/scene";
import { TShapeBounds, TShapeHandler } from "../shapes/baseShape";
import { Ellipse } from "../shapes/ellipse";
import { Freedraw, FreeHandPoint } from "../shapes/freedraw";
import { Line } from "../shapes/line";
import { Rectangle } from "../shapes/rectangle";
import { rotate } from "../utils/math";
import { BaseTool } from "./baseTool";

export type TMovingOffsets = {
  offsetX: number,
  offsetY: number
  lineStartOffsetX?: number,
  lineStartOffsetY?: number,
  lineEndOffsetX?: number,
  lineEndOffsetY?: number,
  pointsOffsets?: FreeHandPoint[]
}

export class SelectTool extends BaseTool {
  private readonly movingOffsets: Map<string, TMovingOffsets>;
  private isMovingShapes: boolean;
  private isResizingShapes: boolean;
  private resizeHandler: keyof typeof SHAPE_HANDLERS | null;

  constructor(scene: Scene) {
    super(scene);
    this.isMovingShapes = false;
    this.movingOffsets = new Map();
    this.isResizingShapes = false;
    this.resizeHandler = null;
  }

  getSelectionBounds(): TShapeBounds | null {
    const selectedShapes = this.scene.getSelectedShapes();
    if (!selectedShapes.length) return null;
    if (selectedShapes.length === 1) return selectedShapes[0].getBounds();

    let startX = Infinity;
    let endX = -Infinity;
    let startY = Infinity;
    let endY = -Infinity;

    selectedShapes.forEach(shape => {
      const shapeBounds = shape.getBounds();
      const rotatingCoordinates = [
        [shapeBounds.startX, shapeBounds.startY],
        [shapeBounds.endX, shapeBounds.endY],
        [shapeBounds.startX, shapeBounds.endY],
        [shapeBounds.endX, shapeBounds.startY]
      ];

      let minRotatedX = Infinity;
      let minRotatedY = Infinity;
      let maxRotatedX = -Infinity;
      let maxRotatedY = -Infinity;

      const cx = (shapeBounds.startX + shapeBounds.endX) / 2;
      const cy = (shapeBounds.startY + shapeBounds.endY) / 2;

      rotatingCoordinates.forEach(([x, y]) => {
        const [rotatedX, rotatedY] = rotate(
          x,
          y,
          cx,
          cy,
          shape.getRotationAngle()
        );

        minRotatedX = Math.min(minRotatedX, rotatedX);
        minRotatedY = Math.min(minRotatedY, rotatedY);
        maxRotatedX = Math.max(maxRotatedX, rotatedX);
        maxRotatedY = Math.max(maxRotatedY, rotatedY);
      });

      startX = Math.min(startX, minRotatedX);
      endX = Math.max(endX, maxRotatedX);
      startY = Math.min(startY, minRotatedY);
      endY = Math.max(endY, maxRotatedY);
    });

    return {
      startX,
      startY,
      endX,
      endY,
    }
  }

  getSelectionHandlers(): TShapeHandler[] | null {
    const selectedShapes = this.scene.getSelectedShapes();
    if (!selectedShapes.length) return null;
    if (selectedShapes.length === 1) {
      return selectedShapes[0].getHandlers();
    }

    const { startX, endX, startY, endY } = this.getSelectionBounds()!;

    const selectedShapesHandlers: TShapeHandler[] = [
      // {
      //   type: SHAPE_HANDLERS.BOTTOM,
      //   x: (startX + endX) / 2 - (HANDLER_SIZE / 2),
      //   y: endY,
      // },
      // {
      //   type: SHAPE_HANDLERS.TOP,
      //   x: (startX + endX) / 2 - (HANDLER_SIZE / 2),
      //   y: startY - HANDLER_SIZE,
      // },
      // {
      //   type: SHAPE_HANDLERS.RIGHT,
      //   x: endX,
      //   y: (startY + endY) / 2 - (HANDLER_SIZE / 2),
      // },
      // {
      //   type: SHAPE_HANDLERS.LEFT,
      //   x: startX - HANDLER_SIZE,
      //   y: (startY + endY) / 2 - (HANDLER_SIZE / 2),
      // },
      // {
      //   type: SHAPE_HANDLERS.TOP_LEFT,
      //   x: startX - HANDLER_SIZE,
      //   y: startY - HANDLER_SIZE,
      // },
      // {
      //   type: SHAPE_HANDLERS.TOP_RIGHT,
      //   x: endX,
      //   y: startY - HANDLER_SIZE,
      // },
      // {
      //   type: SHAPE_HANDLERS.BOTTOM_LEFT,
      //   x: startX - HANDLER_SIZE,
      //   y: endY,
      // },
      // {
      //   type: SHAPE_HANDLERS.BOTTOM_RIGHT,
      //   x: endX,
      //   y: endY,
      // },
      // {
      //   type: SHAPE_HANDLERS.ROTATION,
      //   x: (startX + endX) / 2,
      //   y: startY - ROTATION_HANDLER_OFFSET,
      // }
    ]

    return selectedShapesHandlers;
  }

  getRotationAngle() {
    const selectedShapes = this.scene.getSelectedShapes();

    if (selectedShapes.length === 1) {
      return selectedShapes[0].getRotationAngle();
    }

    return 0;
  }

  drawDashedBorderAroundMultipleShapes() {
    const selectedShapes = this.scene.getSelectedShapes();
    const selectionBounds = this.getSelectionBounds();
    const canvas = this.scene.getCanvas();
    const context = canvas.getContext("2d")!;
    const rotationAngle = this.getRotationAngle();

    if (selectionBounds && selectedShapes.length > 1) {
      // neither figured out multi element rotations
      const { startX, startY, endX, endY } = selectionBounds;

      const cx = (startX + endX) / 2;
      const cy = (startY + endY) / 2;
      const width = (endX - startX) + HANDLER_SIZE;
      const height = (endY - startY) + HANDLER_SIZE;

      context.save();
      context.beginPath();
      context.translate(cx, cy);
      context.rotate(rotationAngle);
      context.rect(
        -width / 2,
        -height / 2,
        (endX - startX) + HANDLER_SIZE,
        (endY - startY) + HANDLER_SIZE
      );
      context.setLineDash([5, 3]);
      context.strokeStyle = SELECTION_BORDER_COLOR;
      context.stroke();
      context.restore();
    }
  }

  drawSelectionHandlers() {
    const selectedShapes = this.scene.getSelectedShapes();
    const selectionBounds = this.getSelectionBounds();
    const selectionHandlers = this.getSelectionHandlers();
    const canvas = this.scene.getCanvas();
    const context = canvas.getContext("2d")!;
    const rotationAngle = this.getRotationAngle();

    if (!selectionHandlers) return;

    if (selectedShapes.length === 1) {
      if (selectedShapes[0] instanceof Line) {
        selectionHandlers.forEach(handler => {
          const { type, x, y } = handler;

          if (
            type === SHAPE_HANDLERS.ARROW_START ||
            type === SHAPE_HANDLERS.ARROW_END
          ) {
            context.save();
            context.beginPath();
            context.strokeStyle = SELECTION_BORDER_COLOR;
            context.fillStyle = SELECTION_BORDER_FILL_COLOR;
            context.arc(x, y, 4, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.restore();
          }
        });
      } else {
        const { startX, startY, endX, endY } = selectionBounds!;
        const cx = (startX + endX) / 2;
        const cy = (startY + endY) / 2;
        const width = (endX - startX);
        const height = (endY - startY);

        const RESIZE_HANDLER = [
          [(-width / 2) - HANDLER_SIZE, (-height / 2) - HANDLER_SIZE],
          [(width / 2), (-height / 2) - HANDLER_SIZE],
          [(-width / 2) - HANDLER_SIZE, (height / 2)],
          [(width / 2), (height / 2)],
          [-HANDLER_SIZE / 2, (-height / 2) - HANDLER_SIZE],
          [(width / 2), -HANDLER_SIZE / 2],
          [-HANDLER_SIZE / 2, (height / 2)],
          [(-width / 2) - HANDLER_SIZE, -HANDLER_SIZE / 2]
        ];
        const ROTATION_HANDLER = [0, (-height / 2) - 25];

        // draw handler
        if (!(selectedShapes[0] instanceof Freedraw)) {
          RESIZE_HANDLER.forEach(([a, b]) => {
            context.save();
            context.beginPath();
            context.translate(cx, cy);
            context.rotate(rotationAngle);
            context.strokeStyle = SELECTION_BORDER_COLOR;
            context.fillStyle = SELECTION_BORDER_FILL_COLOR;
            context.rect(a, b, HANDLER_SIZE, HANDLER_SIZE);
            context.stroke();
            context.fill();
            context.restore();
          });
        }

        // draw other handlers
        selectionHandlers.forEach(handler => {
          const { type, x, y } = handler;

          if (type === SHAPE_HANDLERS.ROTATION) {
            context.save();
            context.beginPath();
            context.translate(cx, cy);
            context.rotate(rotationAngle);
            context.strokeStyle = SELECTION_BORDER_COLOR;
            context.fillStyle = SELECTION_BORDER_FILL_COLOR;
            context.arc(ROTATION_HANDLER[0], ROTATION_HANDLER[1], HANDLER_SIZE / 2, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.restore();
          } else if (
            type === SHAPE_HANDLERS.ARROW_START ||
            type === SHAPE_HANDLERS.ARROW_END
          ) {
            context.save();
            context.beginPath();
            context.strokeStyle = SELECTION_BORDER_COLOR;
            context.fillStyle = SELECTION_BORDER_FILL_COLOR;
            context.arc(x, y, 4, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.restore();
          }
        });
      }
    }
  }

  drawSelectionBorder() {
    const selectedShapes = this.scene.getSelectedShapes();
    const selectionBounds = this.getSelectionBounds();
    const canvas = this.scene.getCanvas();
    const context = canvas.getContext("2d")!;

    if (selectedShapes && selectionBounds) {
      selectedShapes.forEach(shape => {
        const { startX, startY, endX, endY } = shape.getBounds();

        if (shape instanceof Line) {
          const { startX, startY, endX, endY } = shape;
          context.save();
          context.beginPath();
          context.moveTo(startX, startY);
          context.lineTo(endX, endY);
          context.strokeStyle = SELECTION_BORDER_COLOR;
          context.stroke();
          context.restore();
        } else {
          const width = (endX - startX) + HANDLER_SIZE;
          const height = (endY - startY) + HANDLER_SIZE;
          const cx = (startX + endX) / 2;
          const cy = (startY + endY) / 2;
          context.save();
          context.beginPath();
          context.translate(cx, cy);
          context.rotate(shape.getRotationAngle());
          context.rect(
            -width / 2,
            -height / 2,
            width,
            height
          );
          context.strokeStyle = SELECTION_BORDER_COLOR;
          context.stroke();
          context.restore();
        }
      });
    }
  }

  setSelection(x1: number, y1: number, x2: number, y2: number) {
    this.scene.getAllElement().forEach(shape => {
      const { startX, startY, endX, endY } = shape.getBounds();
      const rotatingCoordinates = [
        [startX, startY],
        [endX, endY],
        [startX, endY],
        [endX, startY]
      ];

      let minRotatedX = Infinity;
      let minRotatedY = Infinity;
      let maxRotatedX = -Infinity;
      let maxRotatedY = -Infinity;

      rotatingCoordinates.forEach(([x, y]) => {
        const [rotatedX, rotatedY] = rotate(
          x,
          y,
          (startX + endX) / 2,
          (startY + endY) / 2,
          shape.getRotationAngle()
        );

        minRotatedX = Math.min(minRotatedX, rotatedX);
        minRotatedY = Math.min(minRotatedY, rotatedY);
        maxRotatedX = Math.max(maxRotatedX, rotatedX);
        maxRotatedY = Math.max(maxRotatedY, rotatedY);
      });

      if (
        minRotatedX >= x1 &&
        minRotatedX <= x2 &&
        maxRotatedX >= x1 &&
        maxRotatedX <= x2 &&
        minRotatedY >= y1 &&
        minRotatedY <= y2 &&
        maxRotatedY >= y1 &&
        maxRotatedY <= y2
      ) {
        shape.isSelected = true;
      } else {
        shape.isSelected = false;
      }
    });
  }

  isCoordinateWithinSelectionBounds(x: number, y: number) {
    const { startX, startY, endX, endY } = this.getSelectionBounds()!;
    // fix this bug, selecting shape if selectedShapes elements number is greater than 1
    // const [rotatedX, rotatedY] = rotate(x, y, (startX + endX) / 2, (startY + endY) / 2, )
    return x >= startX && x <= endX && y >= startY && y <= endY;
  }

  handleMouseDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    const { clientX, clientY } = event;
    let lastX: number = clientX;
    let lastY: number = clientY;
    const selectedShapes = this.scene.getSelectedShapes();

    if (selectedShapes.length > 0) {
      const selectionBounds = this.getSelectionBounds()!;
      const resizeHandlers = this.getSelectionHandlers()!;
      const rotationAngle = this.getRotationAngle();

      for (let handler of resizeHandlers) {
        const x1 = handler.x;
        const y1 = handler.y;
        const x2 = handler.x + HANDLER_SIZE;
        const y2 = handler.y + HANDLER_SIZE;
        const centerX = (selectionBounds.startX + selectionBounds.endX) / 2;
        const centerY = (selectionBounds.startY + selectionBounds.endY) / 2;

        const [rotatedX, rotatedY] = rotate(
          clientX,
          clientY,
          centerX,
          centerY,
          -rotationAngle,
        );

        if (
          handler.type === SHAPE_HANDLERS.ROTATION ||
          handler.type === SHAPE_HANDLERS.ARROW_END ||
          handler.type === SHAPE_HANDLERS.ARROW_START
        ) {
          if (
            rotatedX >= x1 - HANDLER_SIZE / 2 &&
            rotatedX <= x2 - HANDLER_SIZE / 2 &&
            rotatedY >= y1 - HANDLER_SIZE / 2 &&
            rotatedY <= y2 - HANDLER_SIZE / 2
          ) {
            this.isResizingShapes = true;
            this.resizeHandler = handler.type;
            break;
          }
        } else {
          if (
            rotatedX >= x1 &&
            rotatedX <= x2 &&
            rotatedY >= y1 &&
            rotatedY <= y2
          ) {
            this.isResizingShapes = true;
            this.resizeHandler = handler.type;
            break;
          }
        }
      }

      if (!this.isResizingShapes && !this.isCoordinateWithinSelectionBounds(clientX, clientY)) {
        this.scene.clearSelection();

        const hitShape = this.scene.getHitShapes(clientX, clientY);
        if (hitShape) {
          this.scene.updateSelected(hitShape.id);
        }
      }

    } else {
      const hitShape = this.scene.getHitShapes(clientX, clientY);

      if (hitShape) {
        this.scene.updateSelected(hitShape.id);
      } else {
        this.scene.clearSelection();
      }
    }

    if (!this.isResizingShapes && this.scene.getSelectedShapes().length) {
      this.isMovingShapes = true;
      const selectedShapes = this.scene.getSelectedShapes();
      selectedShapes.forEach(shape => {
        if (shape instanceof Line) {
          this.movingOffsets.set(shape.id, {
            offsetX: lastX - shape.x,
            offsetY: lastY - shape.y,
            lineStartOffsetX: lastX - shape.startX,
            lineStartOffsetY: lastY - shape.startY,
            lineEndOffsetX: lastX - shape.endX,
            lineEndOffsetY: lastY - shape.endY,
          });
        } else if (shape instanceof Freedraw) {
          const pointsOffsets: FreeHandPoint[] = [];

          shape.points.forEach(([a, b]) => {
            const offsetX = lastX - a;
            const offsetY = lastY - b;
            pointsOffsets.push([offsetX, offsetY]);
          });

          this.movingOffsets.set(shape.id, {
            offsetX: lastX - shape.x,
            offsetY: lastY - shape.y,
            pointsOffsets
          });
        } else if (shape instanceof Rectangle || shape instanceof Ellipse) {
          this.movingOffsets.set(shape.id, {
            offsetX: lastX - shape.x,
            offsetY: lastY - shape.y
          });
        }
      });
    }

    const shape = selectedShapes[0]?.getBounds();
    const angle = selectedShapes[0]?.getRotationAngle();

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;

      if (this.isResizingShapes) {
        if (this.resizeHandler === SHAPE_HANDLERS.TOP) {
          let offsetY = clientY - lastY;
          let cx = (shape.startX + shape.endX) / 2;
          let cy = (shape.startY + shape.endY) / 2;

          const rotatedTop = rotate(
            shape.startX,
            shape.startY + offsetY,
            cx,
            cy,
            angle,
          );

          const rotatedBottom = rotate(
            shape.endX,
            shape.endY,
            cx,
            cy,
            angle,
          );

          const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
          const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

          const newA = rotate(
            rotatedTop[0],
            rotatedTop[1],
            newCenterX,
            newCenterY,
            -angle,
          );
          const newC = rotate(
            rotatedBottom[0],
            rotatedBottom[1],
            newCenterX,
            newCenterY,
            -angle,
          );

          selectedShapes.forEach((shape) => {
            if (
              shape instanceof Rectangle ||
              shape instanceof Ellipse
            ) {
              shape.y = newA[1];
              shape.x = newA[0];
              shape.height = newC[1] - newA[1];
            }
          });
        } else if (this.resizeHandler === SHAPE_HANDLERS.RIGHT) {
          let offsetX = clientX - lastX;
          let cx = (shape.startX + shape.endX) / 2;
          let cy = (shape.startY + shape.endY) / 2;

          const rotatedTop = rotate(
            shape.startX,
            shape.startY,
            cx,
            cy,
            angle,
          );

          const rotatedBottom = rotate(
            shape.endX + offsetX,
            shape.endY,
            cx,
            cy,
            angle,
          );

          const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
          const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

          const newA = rotate(
            rotatedTop[0],
            rotatedTop[1],
            newCenterX,
            newCenterY,
            -angle,
          );
          const newC = rotate(
            rotatedBottom[0],
            rotatedBottom[1],
            newCenterX,
            newCenterY,
            -angle,
          );

          selectedShapes.forEach((shape) => {
            if (
              shape instanceof Rectangle ||
              shape instanceof Ellipse
            ) {
              shape.y = newA[1];
              shape.x = newA[0];
              shape.width = newC[0] - newA[0];
            }
          });
        } else if (this.resizeHandler === SHAPE_HANDLERS.BOTTOM) {
          let offsetY = clientY - lastY;
          let cx = (shape.startX + shape.endX) / 2;
          let cy = (shape.startY + shape.endY) / 2;

          const rotatedTop = rotate(
            shape.startX,
            shape.startY,
            cx,
            cy,
            angle,
          );

          const rotatedBottom = rotate(
            shape.endX,
            shape.endY + offsetY,
            cx,
            cy,
            angle,
          );

          const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
          const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

          const newA = rotate(
            rotatedTop[0],
            rotatedTop[1],
            newCenterX,
            newCenterY,
            -angle,
          );
          const newC = rotate(
            rotatedBottom[0],
            rotatedBottom[1],
            newCenterX,
            newCenterY,
            -angle,
          );

          selectedShapes.forEach((shape) => {
            if (
              shape instanceof Rectangle ||
              shape instanceof Ellipse
            ) {
              shape.y = newA[1];
              shape.x = newA[0];
              shape.height = newC[1] - newA[1];
            }
          });
        } else if (this.resizeHandler === SHAPE_HANDLERS.LEFT) {
          let offsetX = clientX - lastX;
          let cx = (shape.startX + shape.endX) / 2;
          let cy = (shape.startY + shape.endY) / 2;

          const rotatedTop = rotate(
            shape.startX + offsetX,
            shape.startY,
            cx,
            cy,
            angle,
          );

          const rotatedBottom = rotate(
            shape.endX,
            shape.endY,
            cx,
            cy,
            angle,
          );

          const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
          const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

          const newA = rotate(
            rotatedTop[0],
            rotatedTop[1],
            newCenterX,
            newCenterY,
            -angle,
          );
          const newC = rotate(
            rotatedBottom[0],
            rotatedBottom[1],
            newCenterX,
            newCenterY,
            -angle,
          );

          selectedShapes.forEach((shape) => {
            if (
              shape instanceof Rectangle ||
              shape instanceof Ellipse
            ) {
              shape.y = newA[1];
              shape.x = newA[0];
              shape.width = newC[0] - newA[0];
            }
          });
        } else if (this.resizeHandler === SHAPE_HANDLERS.TOP_RIGHT) {
          let offsetY = clientY - lastY;
          let offsetX = clientX - lastX;
          let cx = (shape.startX + shape.endX) / 2;
          let cy = (shape.startY + shape.endY) / 2;

          const rotatedTop = rotate(
            shape.startX,
            shape.startY + offsetY,
            cx,
            cy,
            angle,
          );

          const rotatedBottom = rotate(
            shape.endX + offsetX,
            shape.endY,
            cx,
            cy,
            angle,
          );

          const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
          const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

          const newA = rotate(
            rotatedTop[0],
            rotatedTop[1],
            newCenterX,
            newCenterY,
            -angle,
          );
          const newC = rotate(
            rotatedBottom[0],
            rotatedBottom[1],
            newCenterX,
            newCenterY,
            -angle,
          );

          selectedShapes.forEach((shape) => {
            if (
              shape instanceof Rectangle ||
              shape instanceof Ellipse
            ) {
              shape.y = newA[1];
              shape.x = newA[0];
              shape.width = newC[0] - newA[0];
              shape.height = newC[1] - newA[1];
            }
          });
        } else if (this.resizeHandler === SHAPE_HANDLERS.TOP_LEFT) {
          let offsetY = clientY - lastY;
          let offsetX = clientX - lastX;
          let cx = (shape.startX + shape.endX) / 2;
          let cy = (shape.startY + shape.endY) / 2;

          const rotatedTop = rotate(
            shape.startX + offsetX,
            shape.startY + offsetY,
            cx,
            cy,
            angle,
          );

          const rotatedBottom = rotate(
            shape.endX,
            shape.endY,
            cx,
            cy,
            angle,
          );

          const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
          const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

          const newA = rotate(
            rotatedTop[0],
            rotatedTop[1],
            newCenterX,
            newCenterY,
            -angle,
          );
          const newC = rotate(
            rotatedBottom[0],
            rotatedBottom[1],
            newCenterX,
            newCenterY,
            -angle,
          );

          selectedShapes.forEach((shape) => {
            if (
              shape instanceof Rectangle ||
              shape instanceof Ellipse
            ) {
              shape.y = newA[1];
              shape.x = newA[0];
              shape.width = newC[0] - newA[0];
              shape.height = newC[1] - newA[1];
            }
          });
        } else if (this.resizeHandler === SHAPE_HANDLERS.BOTTOM_RIGHT) {
          let offsetY = clientY - lastY;
          let offsetX = clientX - lastX;
          let cx = (shape.startX + shape.endX) / 2;
          let cy = (shape.startY + shape.endY) / 2;

          const rotatedTop = rotate(
            shape.startX,
            shape.startY,
            cx,
            cy,
            angle,
          );

          const rotatedBottom = rotate(
            shape.endX + offsetX,
            shape.endY + offsetY,
            cx,
            cy,
            angle,
          );

          const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
          const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

          const newA = rotate(
            rotatedTop[0],
            rotatedTop[1],
            newCenterX,
            newCenterY,
            -angle,
          );
          const newC = rotate(
            rotatedBottom[0],
            rotatedBottom[1],
            newCenterX,
            newCenterY,
            -angle,
          );

          selectedShapes.forEach((shape) => {
            if (
              shape instanceof Rectangle ||
              shape instanceof Ellipse
            ) {
              shape.y = newA[1];
              shape.x = newA[0];
              shape.width = newC[0] - newA[0];
              shape.height = newC[1] - newA[1];
            }
          });
        } else if (this.resizeHandler === SHAPE_HANDLERS.BOTTOM_LEFT) {
          let offsetY = clientY - lastY;
          let offsetX = clientX - lastX;
          let cx = (shape.startX + shape.endX) / 2;
          let cy = (shape.startY + shape.endY) / 2;

          const rotatedTop = rotate(
            shape.startX + offsetX,
            shape.startY,
            cx,
            cy,
            angle,
          );

          const rotatedBottom = rotate(
            shape.endX,
            shape.endY + offsetY,
            cx,
            cy,
            angle,
          );

          const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
          const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

          const newA = rotate(
            rotatedTop[0],
            rotatedTop[1],
            newCenterX,
            newCenterY,
            -angle,
          );
          const newC = rotate(
            rotatedBottom[0],
            rotatedBottom[1],
            newCenterX,
            newCenterY,
            -angle,
          );

          selectedShapes.forEach((shape) => {
            if (
              shape instanceof Rectangle ||
              shape instanceof Ellipse
            ) {
              shape.y = newA[1];
              shape.x = newA[0];
              shape.width = newC[0] - newA[0];
              shape.height = newC[1] - newA[1];
            }
          });
        } else if (this.resizeHandler === SHAPE_HANDLERS.ROTATION) {
          const { startX, startY, endX, endY } = this.getSelectionBounds()!;
          const centerX = (startX + endX) / 2;
          const centerY = (startY + endY) / 2;
          const angle = Math.atan2(clientY - centerY, clientX - centerX);

          selectedShapes.forEach(shape => {
            if (
              shape instanceof Rectangle ||
              shape instanceof Ellipse ||
              shape instanceof Freedraw
            ) {
              shape.rotate(angle);
            }
          });
        } else if (this.resizeHandler === SHAPE_HANDLERS.ARROW_START) {
          selectedShapes.forEach(shape => {
            if (
              shape instanceof Line
            ) {
              shape.startX = clientX;
              shape.startY = clientY;
              const minX = Math.min(shape.startX, shape.endX);
              const maxX = Math.max(shape.endX, shape.startX);
              const minY = Math.min(shape.startY, shape.endY);
              const maxY = Math.max(shape.endY, shape.startY);
              shape.x = minX;
              shape.y = minY;
              shape.width = maxX - minX;
              shape.height = maxY - minY;
            }
          });
        } else if (this.resizeHandler === SHAPE_HANDLERS.ARROW_END) {
          selectedShapes.forEach(shape => {
            if (
              shape instanceof Line
            ) {
              shape.endX = clientX;
              shape.endY = clientY;
              const minX = Math.min(shape.startX, shape.endX);
              const maxX = Math.max(shape.endX, shape.startX);
              const minY = Math.min(shape.startY, shape.endY);
              const maxY = Math.max(shape.endY, shape.startY);
              shape.x = minX;
              shape.y = minY;
              shape.width = maxX - minX;
              shape.height = maxY - minY;
            }
          });
        }

        this.scene.clearCanvas();
        this.scene.render();
        this.drawSelectionBorder();
        this.drawSelectionHandlers();
        return;
      }

      if (this.isMovingShapes) {
        const selectedShapes = this.scene.getSelectedShapes();

        if (selectedShapes.length === 1) {
          const shape = selectedShapes[0];
          if (shape instanceof Line) {
            const offsets = this.movingOffsets.get(shape.id)!;
            shape.translate({
              offsetX: clientX - offsets.offsetX,
              offsetY: clientY - offsets.offsetY,
              lineStartOffsetX: clientX - offsets.lineStartOffsetX!,
              lineStartOffsetY: clientY - offsets.lineStartOffsetY!,
              lineEndOffsetX: clientX - offsets.lineEndOffsetX!,
              lineEndOffsetY: clientY - offsets.lineEndOffsetY!
            });
          } else if (shape instanceof Freedraw) {
            const offsets = this.movingOffsets.get(shape.id)!;
            const freehandPoints: FreeHandPoint[] = [];

            for (let offset of offsets.pointsOffsets!) {
              const x = clientX - offset[0];
              const y = clientY - offset[1];
              freehandPoints.push([x, y]);
            }

            shape.translate({
              offsetX: clientX - offsets.offsetX,
              offsetY: clientY - offsets.offsetY,
              pointsOffsets: freehandPoints
            });
          } else {
            const offsets = this.movingOffsets.get(shape.id)!;
            shape.translate({ offsetX: clientX - offsets.offsetX, offsetY: clientY - offsets.offsetY });
          }
        } else {
          selectedShapes.forEach(shape => {
            const offsets = this.movingOffsets.get(shape.id)!;

            if (shape instanceof Line) {
              shape.translate({
                offsetX: clientX - offsets.offsetX,
                offsetY: clientY - offsets.offsetY,
                lineStartOffsetX: clientX - offsets.lineStartOffsetX!,
                lineStartOffsetY: clientY - offsets.lineStartOffsetY!,
                lineEndOffsetX: clientX - offsets.lineEndOffsetX!,
                lineEndOffsetY: clientY - offsets.lineEndOffsetY!
              });
            } else if (shape instanceof Freedraw) {
              const freehandPoints: FreeHandPoint[] = [];

              for (let offset of offsets.pointsOffsets!) {
                const x = clientX - offset[0];
                const y = clientY - offset[1];
                freehandPoints.push([x, y]);
              }

              shape.translate({
                offsetX: clientX - offsets.offsetX,
                offsetY: clientY - offsets.offsetY,
                pointsOffsets: freehandPoints
              });
            } else {
              shape.translate({ offsetX: clientX - offsets.offsetX, offsetY: clientY - offsets.offsetY });
            }
          })
        }

        this.scene.clearCanvas();
        this.scene.render();
        this.drawSelectionBorder();
        this.drawDashedBorderAroundMultipleShapes();
        this.drawSelectionHandlers();
        return;
      }

      this.scene.clearCanvas();
      this.scene.render();
      const selectArea = new Rectangle({
        strokeColor: SELECTION_RECTANGLE_COLOR,
        backgroundColor: SELECTION_RECTANGLE_BACKGROUND,
        x: lastX,
        y: lastY,
        width: clientX - lastX,
        height: clientY - lastY
      });

      const minX = Math.min(lastX, clientX);
      const maxX = Math.max(lastX, clientX);
      const minY = Math.min(lastY, clientY);
      const maxY = Math.max(lastY, clientY);
      this.setSelection(minX, minY, maxX, maxY);
      this.scene.clearCanvas();
      this.scene.render(selectArea);
      this.scene.render();
      this.drawSelectionBorder();
      this.drawDashedBorderAroundMultipleShapes();
      this.drawSelectionHandlers();
    }

    const handleMouseUp = () => {
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);

      this.scene.clearCanvas();
      this.scene.render();
      this.drawSelectionBorder();
      this.drawDashedBorderAroundMultipleShapes();
      this.drawSelectionHandlers();
      this.isMovingShapes = false;
      this.isResizingShapes = false;
    }

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerup', handleMouseUp);
  }
}