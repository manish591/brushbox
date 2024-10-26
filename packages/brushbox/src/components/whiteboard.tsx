import { useEffect, useState, useRef } from 'react';
import { Toolbar } from './toolbar';
import { Scene } from '../scene';
import { clearCanvas, draw } from '../draw';
import { newElement, type Element, type ElementType } from '../element';
import {
  getAbsoluteX1,
  getAbsoluteX2,
  getAbsoluteY1,
  getAbsoluteY2,
  getResizeHandlers,
  normalizeShapes,
  rotate,
  type Cursor,
} from '../math';

export function Brushbox() {
  const [isCanvasLoading, setIsCanvasLoading] = useState<boolean>(true);
  const [currentElementType, setCurrentElementType] =
    useState<ElementType>('selection');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  useEffect(
    function () {
      if (canvasRef.current) {
        setIsCanvasLoading(false);
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        sceneRef.current = new Scene(canvasRef.current);
      }
    },
    [isCanvasLoading],
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
          onMouseMove={(e) => {
            // handle mouse cursor change inside this function
          }}
          onMouseDown={(event) => {
            const { clientX, clientY } = event;

            let lastX: number = clientX;
            let lastY: number = clientY;
            let resizeHandle: Cursor | '' = '';
            let draggingElement: Element | null;
            let isMovingElement = false;
            let isResizing = false;

            const element = newElement(currentElementType, {
              x: clientX,
              y: clientY,
              width: 0,
              height: 0,
            });

            draggingElement = element;

            if (currentElementType === 'selection') {
              const selectedElement = sceneRef.current!.getSelectedElement();

              if (selectedElement.length > 0) {
                let minX = Infinity;
                let maxX = 0;
                let minY = Infinity;
                let maxY = 0;

                if (selectedElement.length === 1) {
                  const element = selectedElement[0];

                  minX = getAbsoluteX1(element);
                  maxX = getAbsoluteX2(element);
                  minY = getAbsoluteY1(element);
                  maxY = getAbsoluteY2(element);
                } else {
                  selectedElement.forEach((element) => {
                    minX = Math.min(minX, element.x);
                    minY = Math.min(minY, element.y);
                    maxX = Math.max(maxX, element.width + element.x);
                    maxY = Math.max(maxY, element.height + element.y);
                  });
                }

                const resizeHandlers = getResizeHandlers(
                  minX,
                  maxX,
                  minY,
                  maxY,
                );
                const angle = selectedElement[0].angle;

                for (let item of resizeHandlers) {
                  const x1 = item.x;
                  const y1 = item.y;
                  const x2 = item.x + 8;
                  const y2 = item.y + 8;

                  const centerX = (maxX + minX) / 2;
                  const centerY = (maxY + minY) / 2;

                  const [rotatedX, rotatedY] = rotate(
                    clientX,
                    clientY,
                    centerX,
                    centerY,
                    -angle,
                  );

                  if (item.handle === 'rotate') {
                    if (
                      rotatedX >= x1 - 4 &&
                      rotatedX <= x2 - 4 &&
                      rotatedY >= y1 - 4 &&
                      rotatedY <= y2 - 4
                    ) {
                      isResizing = true;
                      resizeHandle = item.handle;
                      break;
                    }
                  } else {
                    if (
                      rotatedX >= x1 &&
                      rotatedX <= x2 &&
                      rotatedY >= y1 &&
                      rotatedY <= y2
                    ) {
                      isResizing = true;
                      resizeHandle = item.handle;
                      break;
                    }
                  }
                }

                if (!isResizing) {
                  if (selectedElement.length > 1) {
                    let minX = Infinity;
                    let minY = Infinity;
                    let maxX = 0;
                    let maxY = 0;

                    selectedElement.forEach((element) => {
                      minX = Math.min(minX, element.x);
                      minY = Math.min(minY, element.y);
                      maxX = Math.max(maxX, element.width + element.x);
                      maxY = Math.max(maxY, element.height + element.y);
                    });

                    if (
                      !(
                        clientX >= minX &&
                        clientX <= maxX &&
                        clientY >= minY &&
                        clientY <= maxY
                      )
                    ) {
                      sceneRef.current!.clearSelection();
                    }
                  } else {
                    const foundElement = sceneRef.current!.findHitElement(
                      clientX,
                      clientY,
                    );

                    if (foundElement) {
                      if (!foundElement.isSelected) {
                        if (
                          sceneRef.current!.isElementsSelected() &&
                          event.shiftKey
                        ) {
                          sceneRef.current!.updateElement({
                            ...foundElement,
                            isSelected: true,
                          });
                        } else {
                          sceneRef.current!.clearSelection();
                        }

                        sceneRef.current!.updateElement({
                          ...foundElement,
                          isSelected: true,
                        });
                      }
                    } else {
                      sceneRef.current!.clearSelection();
                    }
                  }
                }
              } else {
                const foundElement = sceneRef.current!.findHitElement(
                  clientX,
                  clientY,
                );

                if (foundElement) {
                  if (!foundElement.isSelected) {
                    if (
                      sceneRef.current!.isElementsSelected() &&
                      event.shiftKey
                    ) {
                      sceneRef.current!.updateElement({
                        ...foundElement,
                        isSelected: true,
                      });
                    } else {
                      sceneRef.current!.clearSelection();
                    }

                    sceneRef.current!.updateElement({
                      ...foundElement,
                      isSelected: true,
                    });
                  }
                } else {
                  sceneRef.current!.clearSelection();
                }
              }
            }

            if (!isResizing && sceneRef.current!.isElementsSelected()) {
              isMovingElement = true;
            }

            const selectedElementsData = new Map();
            const selectedElement = sceneRef.current!.getSelectedElement();

            selectedElement.forEach((element) => {
              selectedElementsData.set(element.id, {
                x: element.x,
                y: element.y,
              });
            });

            function onMouseMove(event: MouseEvent) {
              const { clientX, clientY } = event;

              if (isResizing) {
                switch (resizeHandle) {
                  case 'n': {
                    let offsetY = clientY - lastY;

                    let item = selectedElement[0];
                    let cx = item.x + item.width / 2;
                    let cy = item.y + item.height / 2;

                    const rotatedTop = rotate(
                      item.x,
                      item.y + offsetY,
                      cx,
                      cy,
                      item.angle,
                    );

                    const rotatedBottom = rotate(
                      item.x + item.width,
                      item.y + item.height,
                      item.x + item.width / 2,
                      item.y + item.height / 2,
                      item.angle,
                    );

                    const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
                    const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

                    const newA = rotate(
                      rotatedTop[0],
                      rotatedTop[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );
                    const newC = rotate(
                      rotatedBottom[0],
                      rotatedBottom[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );

                    selectedElement.forEach((element) => {
                      sceneRef.current!.updateElement(
                        normalizeShapes({
                          ...element,
                          y: newA[1],
                          x: newA[0],
                          height: newC[1] - newA[1],
                        }),
                      );
                    });
                    break;
                  }
                  case 'e': {
                    let offsetX = clientX - lastX;
                    let item = selectedElement[0];
                    let cx = item.x + item.width / 2;
                    let cy = item.y + item.height / 2;

                    const rotatedTop = rotate(
                      item.x,
                      item.y,
                      cx,
                      cy,
                      item.angle,
                    );

                    const rotatedBottom = rotate(
                      item.x + item.width + offsetX,
                      item.y + item.height,
                      item.x + item.width / 2,
                      item.y + item.height / 2,
                      item.angle,
                    );

                    const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
                    const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

                    const newA = rotate(
                      rotatedTop[0],
                      rotatedTop[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );
                    const newC = rotate(
                      rotatedBottom[0],
                      rotatedBottom[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );

                    selectedElement.forEach((element) => {
                      sceneRef.current!.updateElement(
                        normalizeShapes({
                          ...element,
                          x: newA[0],
                          y: newA[1],
                          width: newC[0] - newA[0],
                        }),
                      );
                    });
                    break;
                  }
                  case 's': {
                    let offsetY = clientY - lastY;

                    let item = selectedElement[0];
                    let cx = item.x + item.width / 2;
                    let cy = item.y + item.height / 2;

                    const rotatedTop = rotate(
                      item.x,
                      item.y,
                      cx,
                      cy,
                      item.angle,
                    );

                    const rotatedBottom = rotate(
                      item.x + item.width,
                      item.y + item.height + offsetY,
                      item.x + item.width / 2,
                      item.y + item.height / 2,
                      item.angle,
                    );

                    const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
                    const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

                    const newA = rotate(
                      rotatedTop[0],
                      rotatedTop[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );
                    const newC = rotate(
                      rotatedBottom[0],
                      rotatedBottom[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );

                    selectedElement.forEach((element) => {
                      sceneRef.current!.updateElement(
                        normalizeShapes({
                          ...element,
                          y: newA[1],
                          x: newA[0],
                          height: newC[1] - newA[1],
                        }),
                      );
                    });
                    break;
                  }
                  case 'w': {
                    let offsetX = clientX - lastX;
                    let item = selectedElement[0];
                    let cx = item.x + item.width / 2;
                    let cy = item.y + item.height / 2;

                    const rotatedTop = rotate(
                      item.x + offsetX,
                      item.y,
                      cx,
                      cy,
                      item.angle,
                    );

                    const rotatedBottom = rotate(
                      item.x + item.width,
                      item.y + item.height,
                      item.x + item.width / 2,
                      item.y + item.height / 2,
                      item.angle,
                    );

                    const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
                    const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

                    const newA = rotate(
                      rotatedTop[0],
                      rotatedTop[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );
                    const newC = rotate(
                      rotatedBottom[0],
                      rotatedBottom[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );

                    selectedElement.forEach((element) => {
                      sceneRef.current!.updateElement(
                        normalizeShapes({
                          ...element,
                          x: newA[0],
                          y: newA[1],
                          width: newC[0] - newA[0],
                        }),
                      );
                    });
                    break;
                  }
                  case 'ne': {
                    let offsetY = clientY - lastY;
                    let offsetX = clientX - lastX;
                    let item = selectedElement[0];
                    let cx = item.x + item.width / 2;
                    let cy = item.y + item.height / 2;

                    const rotatedTop = rotate(
                      item.x,
                      item.y + offsetY,
                      cx,
                      cy,
                      item.angle,
                    );

                    const rotatedBottom = rotate(
                      item.x + item.width + offsetX,
                      item.y + item.height,
                      item.x + item.width / 2,
                      item.y + item.height / 2,
                      item.angle,
                    );

                    const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
                    const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

                    const newA = rotate(
                      rotatedTop[0],
                      rotatedTop[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );
                    const newC = rotate(
                      rotatedBottom[0],
                      rotatedBottom[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );

                    selectedElement.forEach((element) => {
                      sceneRef.current!.updateElement(
                        normalizeShapes({
                          ...element,
                          x: newA[0],
                          y: newA[1],
                          height: newC[1] - newA[1],
                          width: newC[0] - newA[0],
                        }),
                      );
                    });
                    break;
                  }
                  case 'nw': {
                    let offsetY = clientY - lastY;
                    let offsetX = clientX - lastX;
                    let item = selectedElement[0];
                    let cx = item.x + item.width / 2;
                    let cy = item.y + item.height / 2;

                    const rotatedTop = rotate(
                      item.x + offsetX,
                      item.y + offsetY,
                      cx,
                      cy,
                      item.angle,
                    );

                    const rotatedBottom = rotate(
                      item.x + item.width,
                      item.y + item.height,
                      cx,
                      cy,
                      item.angle,
                    );

                    const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
                    const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

                    const newA = rotate(
                      rotatedTop[0],
                      rotatedTop[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );
                    const newC = rotate(
                      rotatedBottom[0],
                      rotatedBottom[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );

                    selectedElement.forEach((element) => {
                      sceneRef.current!.updateElement(
                        normalizeShapes({
                          ...element,
                          x: newA[0],
                          y: newA[1],
                          height: newC[1] - newA[1],
                          width: newC[0] - newA[0],
                        }),
                      );
                    });
                    break;
                  }
                  case 'se': {
                    let offsetY = clientY - lastY;
                    let offsetX = clientX - lastX;
                    let item = selectedElement[0];
                    let cx = item.x + item.width / 2;
                    let cy = item.y + item.height / 2;

                    const rotatedTop = rotate(
                      item.x,
                      item.y,
                      cx,
                      cy,
                      item.angle,
                    );

                    const rotatedBottom = rotate(
                      item.x + item.width + offsetX,
                      item.y + item.height + offsetY,
                      cx,
                      cy,
                      item.angle,
                    );

                    const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
                    const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

                    const newA = rotate(
                      rotatedTop[0],
                      rotatedTop[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );
                    const newC = rotate(
                      rotatedBottom[0],
                      rotatedBottom[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );

                    selectedElement.forEach((element) => {
                      sceneRef.current!.updateElement(
                        normalizeShapes({
                          ...element,
                          x: newA[0],
                          y: newA[1],
                          height: newC[1] - newA[1],
                          width: newC[0] - newA[0],
                        }),
                      );
                    });
                    break;
                  }
                  case 'sw': {
                    let offsetY = clientY - lastY;
                    let offsetX = clientX - lastX;
                    let item = selectedElement[0];
                    let cx = item.x + item.width / 2;
                    let cy = item.y + item.height / 2;

                    const rotatedTop = rotate(
                      item.x + offsetX,
                      item.y,
                      cx,
                      cy,
                      item.angle,
                    );

                    const rotatedBottom = rotate(
                      item.x + item.width,
                      item.y + item.height + offsetY,
                      cx,
                      cy,
                      item.angle,
                    );

                    const newCenterX = (rotatedTop[0] + rotatedBottom[0]) / 2;
                    const newCenterY = (rotatedTop[1] + rotatedBottom[1]) / 2;

                    const newA = rotate(
                      rotatedTop[0],
                      rotatedTop[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );
                    const newC = rotate(
                      rotatedBottom[0],
                      rotatedBottom[1],
                      newCenterX,
                      newCenterY,
                      -item.angle,
                    );

                    selectedElement.forEach((element) => {
                      sceneRef.current!.updateElement(
                        normalizeShapes({
                          ...element,
                          x: newA[0],
                          y: newA[1],
                          height: newC[1] - newA[1],
                          width: newC[0] - newA[0],
                        }),
                      );
                    });
                    break;
                  }
                  case 'rotate': {
                    selectedElement.forEach((element) => {
                      const centerX = element.x + element.width / 2;
                      const centerY = element.y + element.height / 2;
                      const angle = Math.atan2(
                        clientY - centerY,
                        clientX - centerX,
                      );
                      sceneRef.current!.updateElement(
                        normalizeShapes({
                          ...element,
                          angle,
                        }),
                      );
                    });
                    break;
                  }
                  default:
                    console.log('Unknown case');
                }

                clearCanvas(canvasRef.current!);
                sceneRef.current!.redraw(canvasRef.current!);
                return;
              }

              if (isMovingElement) {
                const selectedElement = sceneRef.current!.getSelectedElement();

                selectedElement.forEach((element) => {
                  const xOffset =
                    clientX - (lastX - selectedElementsData.get(element.id).x);
                  const yOffset =
                    clientY - (lastY - selectedElementsData.get(element.id).y);

                  sceneRef.current!.updateElement({
                    ...element,
                    x: xOffset,
                    y: yOffset,
                  });
                });

                clearCanvas(canvasRef.current!);
                sceneRef.current!.redraw(canvasRef.current!);
                return;
              }

              if (draggingElement) {
                clearCanvas(canvasRef.current!);
                sceneRef.current!.redraw(canvasRef.current!);
                draw(canvasRef.current!, draggingElement);

                draggingElement.width = clientX - draggingElement.x;
                draggingElement.height = clientY - draggingElement.y;
              }

              if (currentElementType === 'selection') {
                if (draggingElement) {
                  sceneRef.current!.setSelection(draggingElement);
                }
              }
            }

            function onMouseUp() {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);

              if (draggingElement === null) {
                // this is for text element
                sceneRef.current!.clearSelection();
                clearCanvas(canvasRef.current!);
                sceneRef.current!.redraw(canvasRef.current!);
                return;
              }

              if (currentElementType === 'selection') {
                isMovingElement = false;
                isResizing = false;
              } else {
                sceneRef.current!.addElement(
                  normalizeShapes({ ...draggingElement, isSelected: true }),
                );
              }

              draggingElement = null;
              setCurrentElementType('selection');
              clearCanvas(canvasRef.current!);
              sceneRef.current!.redraw(canvasRef.current!);
            }

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}
        ></canvas>
      </div>
      <Toolbar setCurrentElementType={setCurrentElementType} />
    </div>
  );
}
