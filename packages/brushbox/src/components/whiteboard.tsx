import { useEffect, useState, useRef } from 'react';
import { Toolbar, TOOLS, TSelectedTool } from './toolbar';
import { Scene } from '../core/scene';
import { SelectTool } from '../tools/selectTool';
import { EllipseTool } from '../tools/ellipseTool';
import { RectangleTool } from '../tools/rectangleTool';
import { LineTool } from '../tools/lineTool';
import { FreehandTool } from '../tools/freedrawTool';
import { TextTool } from '../tools/textTool';

export function Brushbox() {
  const [isCanvasLoading, setIsCanvasLoading] = useState<boolean>(true);
  const [selectedTool, setSelectedTool] = useState<TSelectedTool>(
    TOOLS.SELECTION,
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scene = useRef<Scene | null>(null);

  useEffect(
    function () {
      if (canvasRef.current) {
        setIsCanvasLoading(false);
        scene.current = new Scene(canvasRef.current);
        scene.current.setScale(window.devicePixelRatio);
        scene.current.initializeCanvas();
      }

      function resize() {
        if (canvasRef.current && scene.current) {
          scene.current.initializeCanvas();
          scene.current.render();
        }
      }

      window.addEventListener('resize', resize);

      return () => {
        window.removeEventListener('resize', resize);
      };
    },
    [isCanvasLoading],
  );

  useEffect(
    function () {
      if (!scene.current) return;

      if (selectedTool === TOOLS.SELECTION) {
        scene.current.setActiveTool(new SelectTool(scene.current));
      } else if (selectedTool === TOOLS.ELLIPSE) {
        scene.current.setActiveTool(new EllipseTool(scene.current));
      } else if (selectedTool === TOOLS.RECTANGLE) {
        scene.current.setActiveTool(new RectangleTool(scene.current));
      } else if (selectedTool === TOOLS.LINE) {
        scene.current.setActiveTool(new LineTool(scene.current));
      } else if (selectedTool === TOOLS.FREEDRAW) {
        scene.current.setActiveTool(new FreehandTool(scene.current));
      } else if (selectedTool === TOOLS.TEXT) {
        scene.current.setActiveTool(new TextTool(scene.current));
      }
    },
    [selectedTool],
  );

  return (
    <div className="brushbox-container">
      {isCanvasLoading && (
        <div className="brushbox-loader">
          <h1 className="">Loading Canvas...</h1>
        </div>
      )}
      <div className="brushbox-wrapper">
        <canvas
          ref={canvasRef}
          className="brushbox-canvas"
          onPointerDown={(e) => {
            if (scene.current) {
              scene.current.handleMouseDown(e);
            }
          }}
        ></canvas>
      </div>
      <Toolbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
  );
}
