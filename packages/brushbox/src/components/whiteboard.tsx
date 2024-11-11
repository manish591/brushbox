import { useEffect, useState, useRef } from 'react';
import { Toolbar, TOOLS, TSelectedTool } from './toolbar';
import { Scene } from '../core/scene';
import { SelectTool } from '../tools/selectTool';
import { EllipseTool } from '../tools/ellipseTool';
import { RectangleTool } from '../tools/rectangleTool';
import { LineTool } from '../tools/lineTool';

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
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        scene.current = new Scene(canvasRef.current);
      }

      function resize() {
        if (canvasRef.current) {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
          scene.current?.render();
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
          style={{ width: '100%', height: '100%' }}
          onMouseDown={(e) => {
            if (scene) {
              scene.current?.handleMouseDown(e);
            }
          }}
        ></canvas>
      </div>
      <Toolbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
  );
}
