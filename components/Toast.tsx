import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from './Icons';

interface ToastProps {
  id: number;
  message: string;
  onDismiss: (id: number) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
      // Wait for exit animation to complete before removing from DOM
      const removeTimer = setTimeout(() => {
        onDismiss(id);
      }, 500);
      return () => clearTimeout(removeTimer);
    }, 3000); // 3 seconds visible

    return () => clearTimeout(dismissTimer);
  }, [id, onDismiss]);

  return (
    <div
      className={`flex items-center bg-green-600 text-white text-sm font-semibold px-4 py-3 rounded-md shadow-lg transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      style={{ transformOrigin: 'right center' }}
    >
      <CheckCircleIcon className="w-5 h-5 mr-3" />
      <p>{message}</p>
    </div>
  );
};