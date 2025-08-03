import React, { useState, useEffect, useRef } from 'react';

const Button = ({ onAddTask }) => {
  const [showWindow, setShowWindow] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const formRef = useRef(null);

  const handleAddClick = () => setShowWindow(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask({ title, details });
      setTitle('');
      setDetails('');
      setShowWindow(false);
    }
  };

  // Handle click outside to close window (Mac-like behavior)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowWindow(false);
      }
    };

    if (showWindow) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showWindow]);

  // Handle escape key to close window
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowWindow(false);
      }
    };

    if (showWindow) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showWindow]);

  return (
    <>
      {/* Plus Button */}
      <button
        onClick={handleAddClick}
        className={`fixed bottom-8 right-8 w-16 h-16 rounded-full bg-white text-black shadow-lg border flex items-center justify-center z-50 hover:bg-red-700 transition-all duration-300 ${
          showWindow ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Add Task"
        style={{ 
          fontSize: '24px',
          lineHeight: '1'
        }}
      >
        +
      </button>

      {/* Expanded Window - Bottom Right Position */}
      <div
        className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ease-out transform ${
          showWindow 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-0 opacity-0 translate-y-4'
        }`}
        style={{ transformOrigin: 'bottom right' }}
      >
        <div 
          ref={formRef}
          className="backdrop-blur-lg bg-black text-white rounded-2xl shadow-2xl p-6 w-80 border-2 border-gray-300"
        >
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Add New Task</h3>
            <button
              onClick={() => setShowWindow(false)}
              className="w-6 h-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center hover:bg-red-600 transition"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded-lg border-2 border-gray-300 text-black text-base bg-white/90 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
              autoFocus
            />
            <textarea
              placeholder="Task Details"
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded-lg border-2 text-black border-gray-300 text-sm bg-white/90 shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-vertical"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowWindow(false)}
                className="flex-1 py-2 rounded-lg bg-gray-900 border-2 border-gray-900 text-gray-700 text-sm transition hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-red-500 border-2 border-red-600 text-white text-sm transition hover:bg-red-600"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Button;