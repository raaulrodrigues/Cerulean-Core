import React from 'react';

interface HPBarProps {
  percentage: number;
  status: string | null;
}

const HPBar: React.FC<HPBarProps> = ({ percentage, status }) => {
  const getColor = (percent: number) => {
    if (percent > 50) return 'bg-green-500';
    if (percent > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const color = getColor(percentage);

  return (
    <div className="w-full relative">
      {status && (
        <span className="absolute -top-6 right-0 text-xs font-bold px-2 py-0.5 rounded-sm bg-gray-900 text-red-400">
          {status.toUpperCase()}
        </span>
      )}
      <div className="w-full bg-gray-600 rounded-full h-4 border border-gray-500">
        <div 
          className={`${color} h-4 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default HPBar;