import React from 'react';
import './index.css';

export function Button({ children }: Readonly<{ children: React.ReactNode }>) {
  return <button className="mt-2">{children}</button>;
}
