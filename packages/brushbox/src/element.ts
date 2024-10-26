export type ElementType = 'rectangle' | 'ellipse' | 'line' | "selection";

export interface Element {
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  backgroundColor: string,
  strokeColor: string,
  angle: number,
  strokeWidth: number,
  isSelected: boolean,
  type: ElementType
}

type NewElementProps = Omit<
  Element,
  "id" |
  "type" |
  "backgroundColor" |
  "strokeWidth" |
  "strokeColor" |
  "angle" |
  "isSelected"
>;

export function createStringId(): string {
  return Date.now().toString(20) + Math.round(Math.random() * 100);
}

export function newElement(type: ElementType, props: NewElementProps): Element {
  return {
    id: createStringId(),
    type,
    backgroundColor: "black",
    strokeWidth: 1,
    strokeColor: "black",
    isSelected: false,
    angle: 0,
    ...props
  }
}