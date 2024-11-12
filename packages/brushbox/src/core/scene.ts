import { BaseShape } from "../shapes/baseShape";
import { SelectTool } from "../tools/selectTool";
import { BaseTool } from "../tools/baseTool";

export class Scene {
  private readonly canvas: HTMLCanvasElement;
  private shapes: BaseShape[];
  private activeTool: BaseTool;
  private scale: number;

  constructor(canvas: HTMLCanvasElement) {
    this.shapes = [];
    this.canvas = canvas;
    this.activeTool = new SelectTool(this);
    this.scale = 1;
  }

  initializeCanvas() {
    this.canvas.width = window.innerWidth * this.scale;
    this.canvas.height = window.innerHeight * this.scale;

    const context = this.canvas.getContext("2d");
    if (!context) return;

    context.scale(this.scale, this.scale);
  }

  setScale(scale: number) {
    this.scale = scale;
  }

  setActiveTool(newTool: BaseTool) {
    this.activeTool = newTool;
  }

  getActiveTool(): BaseTool {
    return this.activeTool;
  }

  getShape(id: string) {
    return this.shapes.find(shape => shape.id === id);
  }

  getAllElement() {
    return this.shapes;
  }

  addElement(newShape: BaseShape) {
    this.shapes.push(newShape);
  }

  updateSelected(id: string) {
    this.shapes.forEach(shape => {
      if (shape.id === id) {
        shape.isSelected = true;
      }
    });
  }

  clearScene() {
    this.shapes = [];
    this.render();
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  clearCanvas() {
    const context = this.canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(shape?: BaseShape) {
    if (shape) {
      shape.draw(this.canvas);
    } else {
      this.shapes.forEach(shape => {
        shape.draw(this.canvas);
      });
    }
  }

  handleMouseDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    this.activeTool.handleMouseDown(event);
  }

  getSelectedShapes() {
    const selectedShapes: BaseShape[] = [];

    this.shapes.forEach(shape => {
      if (shape.isSelected) {
        selectedShapes.push(shape);
      }
    });

    return selectedShapes;
  }

  clearSelection() {
    this.shapes.forEach(element => {
      element.isSelected = false;
    });
  }

  getHitShapes(x: number, y: number) {
    return this.shapes.find(shape => shape.contain(x, y));
  }
}