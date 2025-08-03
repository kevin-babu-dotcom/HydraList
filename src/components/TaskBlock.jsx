import React, { useState } from 'react';

const pastelColors = {
  todo: 'bg-white border-red-900', // Changed to yellow
  completed: 'bg-gray-100 border-gray-400',
};

const checkboxColors = {
  todo: 'border-gray-400 bg-white',
  completed: 'border-red-500 bg-red-500',
};

const TaskBlock = ({ task, onComplete }) => {
  const [expanded, setExpanded] = useState(false);

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onComplete(task.id, task.text, task.description);
  };

  return (
    <div
      className={`
        inline-block align-top border-2
        rounded-xl shadow-lg transition-all duration-200 cursor-pointer
        ${pastelColors[task.status]}
        ${expanded ? 'scale-105 z-10 shadow-xl' : 'hover:scale-105 hover:shadow-lg'}
        p-4 mb-2 mr-2
        max-w-xs min-w-[120px] break-words
        ${expanded ? 'w-full' : ''}
      `}
      style={{
        minHeight: '48px',
        fontFamily: 'Gilroy, sans-serif',
        background: task.status === 'completed' 
          ? '#000000'  // Keep gray for completed
          : '#ffffff'  // Light yellow for todo tasks
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center">
        {/* Custom circular checkbox */}
        <span
          className={`
            flex-shrink-0 w-6 h-6 mr-3 rounded-full border-2
            flex items-center justify-center
            transition-colors duration-200
            ${checkboxColors[task.status]}
          `}
          onClick={handleCheckboxClick}
          style={{
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            backgroundColor: task.status === 'completed' ? '#ef4444' : '#ffffff'
          }}
        >
          {task.status === 'completed' && (
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="white" 
              strokeWidth="3" 
              viewBox="0 0 24 24"
              style={{ color: 'white' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span 
          className={`font-bold text-base ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}
          style={{ 
            fontFamily: 'Gilroy, sans-serif'
          }}
        >
          {task.text}
        </span>
      </div>
      {expanded && (
        <div 
          className="mt-3 text-base break-words"
          style={{ 
            fontFamily: 'Gilroy, sans-serif'
          }}
        >
          <div 
            className="font-semibold mb-2 text-gray-800"
          >
            {task.text}
          </div>
          <div 
            className="text-gray-600 leading-relaxed"
          >
            {task.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBlock;