import { useEffect, useState } from 'react';
import { TTextAreaState } from './whiteboard';

export type TTextarea = {
  isTextVisible: boolean;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  textareaState: TTextAreaState;
  setTextareaState: (value: React.SetStateAction<TTextAreaState>) => void;
  setIsTextVisible: (value: React.SetStateAction<boolean>) => void;
  drawText: (val: string) => void;
};

export function Textarea({
  textAreaRef,
  textareaState,
  setIsTextVisible,
  setTextareaState,
  drawText,
}: Readonly<TTextarea>) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '0px';
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + 'px';

      const span = document.createElement('span');
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.style.whiteSpace = 'pre';
      const styles = window.getComputedStyle(textAreaRef.current);
      span.style.font = styles.font;
      document.body.appendChild(span);
      span.textContent = value || ''; // Use 'x' as minimum width reference
      const newWidth = Math.max(16, span.offsetWidth);
      textAreaRef.current.style.width = newWidth + 'px';

      document.body.removeChild(span);

      setTextareaState({
        ...textareaState,
        height: scrollHeight,
        width: newWidth,
      });
    }
  }, [textAreaRef.current, value]);

  return (
    <textarea
      rows={1}
      ref={textAreaRef}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onBlur={(e) => {
        drawText(e.target.value);
        setIsTextVisible(false);
      }}
      style={{
        minWidth: '16px',
        position: 'fixed',
        top: `${textareaState.y}px`,
        left: `${textareaState.x}px`,
        zIndex: 200,
        outline: 'none',
        resize: 'none',
        padding: '0px',
        lineHeight: 1,
        overflow: 'hidden',
        whiteSpace: 'pre',
        fontFamily: textareaState.fontFamily,
        fontSize: textareaState.fontSize,
        paddingLeft: '5px',
        paddingRight: '5px',
      }}
    ></textarea>
  );
}
