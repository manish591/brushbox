import { Scene } from "../core/scene";
import { BaseTool } from "./baseTool";

export class TextTool extends BaseTool {
  constructor(scene: Scene) {
    super(scene);
  }

  handleMouseDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    const handleMouseUp = (event: MouseEvent) => {
      window.removeEventListener("pointerup", handleMouseUp);

      const { clientX, clientY } = event;
      this.scene.updateTextareaState({
        x: clientX,
        y: clientY,
      });
      this.scene.setTextareaVisibility(true);
      this.scene.updateSelectedTool("selection");
    }

    window.addEventListener('pointerup', handleMouseUp);
  }
}