import { Scene } from "../core/scene";
import { Line } from "../shapes/line";
import { BaseTool } from "./baseTool";

export class LineTool extends BaseTool {
  private isDrawing: boolean;

  constructor(scene: Scene) {
    super(scene);
    this.isDrawing = false;
  }

  handleMouseDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    const { clientX, clientY } = event;
    let lastX: number = clientX;
    let lastY: number = clientY;
    this.isDrawing = true;

    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;

      if (this.isDrawing) {
        this.scene.clearCanvas();
        this.scene.render();
        const newRect = new Line({
          startX: lastX,
          startY: lastY,
          endX: clientX,
          endY: clientY
        });
        this.scene.render(newRect);
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      const { clientX, clientY } = event;

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      if (this.isDrawing && lastX != clientX && lastY != clientY) {
        const minX = Math.min(lastX, clientX);
        const maxX = Math.max(lastX, clientX);
        const minY = Math.min(lastY, clientY);
        const maxY = Math.max(lastY, clientY);
        this.scene.addElement(new Line({
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          startX: lastX,
          startY: lastY,
          endX: clientX,
          endY: clientY
        }));
      }

      this.isDrawing = false;
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }
}