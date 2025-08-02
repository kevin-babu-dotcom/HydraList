import React, { useState } from 'react';

const pastelColors = {
  todo: 'bg-yellow-200',
  completed: 'bg-yellow-100',
};

const checkboxColors = {
  todo: 'border-gray-400',
  completed: 'border-green-500 bg-green-400',
};

const TaskBlock = ({ task, onComplete }) => {
  const [expanded, setExpanded] = useState(false);

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    // Call the parent's completion handler with task data
    onComplete(task.id, task.text, task.description);
  };

  return (
    <div
      className={`
        inline-block align-top border
        rounded-xl shadow-md transition-all duration-200 cursor-pointer
        ${pastelColors[task.status]}
        ${expanded ? 'scale-105 z-10' : 'hover:scale-105'}
        p-3 mb-2 mr-2
        max-w-xs min-w-[120px] break-words
        ${expanded ? 'w-full' : ''}
      `}
      style={{
        minHeight: '48px',
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
            bg-white
          `}
          onClick={handleCheckboxClick}
        >
          {task.status === 'completed' && (
            <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className={`font-bold text-base text-black ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
          {task.text}
        </span>
      </div>
      {expanded && (
        <div className="mt-2 text-base text-gray-700 break-words">
          <div className="font-semibold mb-1">{task.text}</div>
          <div>{task.description}</div>
        </div>
      )}
    </div>
  );
};

export default TaskBlock;