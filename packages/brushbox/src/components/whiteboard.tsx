import { useEffect, useState, useRef } from 'react';
import { Toolbar, TOOLS, TSelectedTool } from './toolbar';
import { Scene } from '../core/scene';
import { SelectTool } from '../tools/selectTool';
import { EllipseTool } from '../tools/ellipseTool';
import { RectangleTool } from '../tools/rectangleTool';
import { LineTool } from '../tools/lineTool';
import { FreehandTool } from '../tools/freedrawTool';
import { TextTool } from '../tools/textTool';
import { Textarea } from './textarea';
import { Text } from '../shapes/text';

export type TTextAreaState = {
  text: string;
  x: number;
  y: number;
  rotation: number;
  fontSize: number;
  fontFamily: string;
  isVisible: boolean;
  width: number;
  height: number;
};

export function Brushbox() {
  const [isCanvasLoading, setIsCanvasLoading] = useState<boolean>(true);
  const [selectedTool, setSelectedTool] = useState<TSelectedTool>(
    TOOLS.SELECTION,
  );
  const [isTextVisible, setIsTextVisible] = useState(false);
  const [textareaState, setTextareaState] = useState<TTextAreaState>({
    fontFamily: 'Aerial',
    fontSize: 24,
    width: 150,
    height: 0,
    x: 0,
    y: 0,
    isVisible: false,
    rotation: 0,
    text: '',
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scene = useRef<Scene | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(
    function () {
      if (canvasRef.current) {
        setIsCanvasLoading(false);
        scene.current = new Scene({
          canvas: canvasRef.current,
          selectedTool,
          updateSelectedTool: function (val) {
            setSelectedTool(val);
          },
          setTextareaVisibility: function (val) {
            setIsTextVisible(val);
          },
          updateTextareaState: function (state: Partial<TTextAreaState>) {
            setTextareaState((prevState) => ({
              ...prevState,
              ...state,
            }));
          },
        });
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

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isTextVisible]);

  return (
    <div className="brushbox-container">
      {isCanvasLoading && (
        <div className="brushbox-loader">
          <h1 className="">Loading Canvas...</h1>
        </div>
      )}
      <div className="brushbox-textarea">
        {isTextVisible && (
          <Textarea
            isTextVisible={isTextVisible}
            textAreaRef={textAreaRef}
            textareaState={textareaState}
            setTextareaState={setTextareaState}
            setIsTextVisible={setIsTextVisible}
            drawText={function (val: string) {
              if (!canvasRef.current) return;
              const textShape = new Text({
                text: val,
                x: textareaState.x,
                y: textareaState.y,
                width: textareaState.width,
                height: textareaState.height,
              });

              if (scene.current) {
                scene.current.addElement(textShape);
              }

              textShape.draw(canvasRef.current);
            }}
          />
        )}
      </div>
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
