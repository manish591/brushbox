import { Scene } from "../core/scene";
import { Freedraw, FreeDrawPoints } from "../shapes/freedraw";
import { BaseTool } from "./baseTool";

export class FreehandTool extends BaseTool {
  private isDrawing: boolean;
  private points: FreeDrawPoints[];

  constructor(scene: Scene) {
    super(scene);
    this.isDrawing = false;
    this.points = [];
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
        this.points.push([clientX, clientY]);
        const newShape = new Freedraw({
          points: this.points
        });
        newShape.draw(this.scene.getCanvas());
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      const { clientX, clientY } = event;

      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);

      if (this.isDrawing && lastX != clientX && lastY != clientY) {
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

        this.scene.addElement(new Freedraw({
          points: this.points,
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        }));
      }

      this.isDrawing = false;
      this.points = [];
    }

    window.addEventListener('pointermove', handleMouseMove);
    window.addEventListener('pointerup', handleMouseUp);
  }
}