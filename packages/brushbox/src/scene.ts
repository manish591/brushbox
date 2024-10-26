import { type Element } from "./element";
import {
  drawEllipse,
  drawRectangle,
  drawSelectionBorder,
  drawSelectionPath
} from "./draw";
import {
  distanceBetweenTwoPoints,
  getAbsoluteX1,
  getAbsoluteX2,
  getAbsoluteY1,
  getAbsoluteY2,
  getResizeHandlers,
  isPointLiesInsideRectangle
} from "./math";
import type { Coordinate } from "./types";

export class Scene {
  private elements: Element[];
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.elements = [];
    this.canvas = canvas;
  }

  getAllElement() {
    console.log("the elements", this.elements);
  }

  addElement(element: Element) {
    this.elements.push(element);
  }

  isElementsSelected() {
    return this.elements.some(el => el.isSelected);
  }

  getSelectedElement() {
    return this.elements.filter(el => el.isSelected);
  }

  updateElement(element: Element) {
    this.elements = this.elements.map(item => {
      if (item.id === element.id) {
        return element;
      }
      return item;
    })
  }

  setSelection(targetElement: Element) {
    const x1 = getAbsoluteX1(targetElement);
    const x2 = getAbsoluteX2(targetElement);
    const y1 = getAbsoluteY1(targetElement);
    const y2 = getAbsoluteY2(targetElement);

    this.elements.forEach(element => {
      const elementX1 = getAbsoluteX1(element);
      const elementX2 = getAbsoluteX2(element);
      const elementY1 = getAbsoluteY1(element);
      const elementY2 = getAbsoluteY2(element);

      if (
        elementX1 >= x1 &&
        elementX1 <= x2 &&
        elementX2 >= x1 &&
        elementX2 <= x2 &&
        elementY1 >= y1 &&
        elementY1 <= y2 &&
        elementY2 >= y1 &&
        elementY2 <= y2
      ) {
        element.isSelected = true;
      } else {
        element.isSelected = false;
      }
    });
  }

  clearSelection() {
    this.elements.forEach(element => {
      element.isSelected = false;
    });
  }

  getHitElement(element: Element, coords: Coordinate): boolean {
    const { type, x, y, width, height, angle } = element;
    let isElementFound = false;

    if (type === "line") {
      const ac = distanceBetweenTwoPoints({ x, y }, { x: x + width, y: y + height });
      const ab = distanceBetweenTwoPoints({ x, y }, { x: coords.x, y: coords.y });
      const bc = distanceBetweenTwoPoints({ x: coords.x, y: coords.y }, { x: x + width, y: y + height });

      isElementFound = Math.abs((ab + bc) - ac) < 1;
    } else {
      isElementFound = isPointLiesInsideRectangle(x, y, x + width, y + height, angle, coords);
    }

    return isElementFound;
  };

  findHitElement(x: number, y: number): Element | undefined {
    return this.elements.find(element => this.getHitElement(element, { x, y }));
  }

  deleteLastElement() {
    this.elements.pop();
  }

  redraw(canvas: HTMLCanvasElement) {
    this.elements.forEach(element => {
      const { x, y, width, height, type, angle } = element;

      if (type === "rectangle") {
        drawRectangle(canvas, x, y, width, height, angle);
      } else if (type === "ellipse") {
        drawEllipse(canvas, x, y, width, height, angle);
      } else if (type === "selection") {
        drawSelectionPath(canvas, x, y, width, height)
      }
    });

    const selectedElement = this.getSelectedElement();

    if (selectedElement.length === 1) {
      drawSelectionBorder(this.canvas, selectedElement[0]);
    } else {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = 0;
      let maxY = 0;

      selectedElement.forEach(element => {
        minX = Math.min(minX, element.x);
        minY = Math.min(minY, element.y);
        maxX = Math.max(maxX, element.width + element.x);
        maxY = Math.max(maxY, element.height + element.y);
      });

      const cornerSize = 8;
      const resizeHandlers = getResizeHandlers(minX, maxX, minY, maxY);

      const context = canvas.getContext("2d")!;
      if (!context) return;

      context.save();
      context.beginPath();
      context.setLineDash([5, 5]);
      context.strokeStyle = "blue";
      context.rect(minX - 5, minY - 5, (maxX - minX) + 10, (maxY - minY) + 10);
      context.stroke();
      context.restore();

      resizeHandlers.forEach(h => {
        if (h.handle === "rotate") {
          context.save();
          context.beginPath();
          context.strokeStyle = "blue";
          context.fillStyle = "white";
          context.arc(h.x, h.y, 4, 0, Math.PI * 2);
          context.fill();
          context.stroke();
          context.restore();
        } else {
          context.save();
          context.beginPath();
          context.strokeStyle = "blue";
          context.fillStyle = "white";
          context.rect(h.x, h.y, cornerSize, cornerSize);
          context.fill();
          context.stroke();
          context.restore();
        }
      });
    }
  }
}