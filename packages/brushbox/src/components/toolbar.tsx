import {
  MousePointer,
  Square,
  Circle,
  Minus,
  Pencil,
  ALargeSmall,
} from 'lucide-react';

export type TSelectedTool =
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'selection'
  | 'freedraw'
  | 'text';

export const TOOLS = {
  SELECTION: 'selection',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  LINE: 'line',
  FREEDRAW: 'freedraw',
  TEXT: 'text',
} as const;

const TOOLBAR = [
  { icon: MousePointer, name: TOOLS.SELECTION },
  { icon: Square, name: TOOLS.RECTANGLE },
  { icon: Circle, name: TOOLS.ELLIPSE },
  { icon: Minus, name: TOOLS.LINE },
  { icon: Pencil, name: TOOLS.FREEDRAW },
  { icon: ALargeSmall, name: TOOLS.TEXT },
];

export function Toolbar({
  setSelectedTool,
  selectedTool,
}: Readonly<{
  selectedTool: TSelectedTool;
  setSelectedTool: (value: React.SetStateAction<TSelectedTool>) => void;
}>) {
  return (
    <div className="brushbox-toolbar">
      <div className="brushbox-toolbar__item">
        {TOOLBAR.map((tool) => {
          return (
            <button
              key={tool.name}
              style={{
                background: `${selectedTool === tool.name ? '#a4a3a366' : ''}`,
              }}
              onClick={() => {
                setSelectedTool(tool.name);
              }}
            >
              <tool.icon width={18} height={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
