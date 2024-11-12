import { Scene } from "../core/scene";
import { Ellipse } from "../shapes/ellipse";
import { BaseTool } from "./baseTool";

export class EllipseTool extends BaseTool {
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
        const newRect = new Ellipse({
          x: lastX,
          y: lastY,
          width: clientX - lastX,
          height: clientY - lastY
        });
        this.scene.render(newRect);
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      const { clientX, clientY } = event;

      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);

      if (this.isDrawing && lastX != clientX && lastY != clientY) {
        const minX = Math.min(lastX, clientX);
        const maxX = Math.max(lastX, clientX);
        const minY = Math.min(lastY, clientY);
        const maxY = Math.max(lastY, clientY);
        this.scene.addElement(new Ellipse({
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        }));
      }

      this.isDrawing = false;
    }

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerup', handleMouseUp);
  }
}