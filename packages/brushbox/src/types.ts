export const WhiteboardTools = {
  rectangle: "rectangle",
  ellipse: "ellipse",
  line: "line",
  draw: "draw",
  text: "text",
  selection: "selection"
} as const;

export const WhiteboardActions = {
  drawing: "drawing",
  moving: "moving",
  resizing: "resizing",
  rotating: "rotating",
  none: "none"
} as const;

export type Coordinate = {
  x: number,
  y: number
}

export const CursorStyle = {
  default: "default",
  pointer: "pointer",
  crosshair: "crosshair",
  text: "text",
  move: "move",
  grab: "grab",
  grabbing: "grabbing",
  ewResize: "ew-resize",
  nsResize: "ns-resize",
  neswResize: "nesw-resize",
  nwseResize: "nwse-resize"
} as const

export const ResizePosition = {
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
  topLeft: "topLeft",
  topRight: "topRight",
  bottomLeft: "bottomLeft",
  bottomRight: "bottomRight"
} as const;