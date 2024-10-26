import { MousePointer, Square, Circle } from 'lucide-react';
import type { ElementType } from '../element';

export function Toolbar({
  setCurrentElementType,
}: Readonly<{
  setCurrentElementType: (value: React.SetStateAction<ElementType>) => void;
}>) {
  return (
    <div className="brushbox-toolbar">
      <div className="brushbox-toolbar__item">
        <button
          className="p-3 hover:bg-gray-100 transition rounded-lg"
          onClick={() => {
            setCurrentElementType('selection');
          }}
        >
          <MousePointer size={14} />
        </button>
        <button
          className="p-3 hover:bg-gray-100 transition rounded-lg"
          onClick={() => {
            setCurrentElementType('rectangle');
          }}
        >
          <Square size={14} />
        </button>
        <button
          className="p-3 hover:bg-gray-100 transition rounded-lg'"
          onClick={() => {
            setCurrentElementType('ellipse');
          }}
        >
          <Circle size={14} />
        </button>
      </div>
    </div>
  );
}
