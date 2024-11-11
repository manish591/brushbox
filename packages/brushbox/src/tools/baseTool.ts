import { Scene } from "../core/scene";

export abstract class BaseTool {
  scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  abstract handleMouseDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void;
}