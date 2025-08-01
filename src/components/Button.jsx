import React, { useState } from 'react';

const Button = ({ onAddTask }) => {
  const [showWindow, setShowWindow] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

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

  return (
    <>
      {!showWindow && (
        <button
          onClick={handleAddClick}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-blue-600 text-white text-3xl shadow-lg flex items-center justify-center z-50 hover:bg-blue-700 transition"
          aria-label="Add Task"
        >
          +
        </button>
      )}
      {showWindow && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="backdrop-blur-lg bg-white/60 rounded-2xl shadow-2xl p-8 min-w-[340px] border-4 border-black border-dashed outline outline-2 outline-black outline-offset-2 font-comic">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full mb-4 px-4 py-2 rounded-lg border-2 border-black font-bold text-lg bg-white/80 shadow-inner focus:outline-none focus:ring-2 focus:ring-black font-comic"
                required
                autoFocus
              />
              <textarea
                placeholder="Task Details"
                value={details}
                onChange={e => setDetails(e.target.value)}
                className="w-full mb-4 px-4 py-2 rounded-lg border-2 border-black font-bold text-base bg-white/80 shadow-inner focus:outline-none focus:ring-2 focus:ring-black resize-vertical font-comic"
                rows={4}
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-white border-2 border-black text-black font-bold text-lg mt-2 transition hover:bg-gray-100 font-comic"
              >
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Button;