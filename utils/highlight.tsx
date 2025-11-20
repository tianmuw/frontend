// frontend/utils/highlight.tsx
import React from 'react';

export const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  
  // 使用正则表达式拆分文本，忽略大小写
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <b key={i} className="bg-yellow-100 text-gray-900 font-extrabold">{part}</b>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};