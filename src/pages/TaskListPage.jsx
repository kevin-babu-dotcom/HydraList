// src/pages/TaskListPage.jsx
import { useState, useEffect } from 'react';
import TaskBlock from '../components/TaskBlock';
import Button from '../components/Button';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function TaskListPage() {
    // Helper function to get tasks from localStorage
    const getStoredTasks = () => {
        try {
            const storedTasks = localStorage.getItem('hydraListTasks');
            if (storedTasks) {
                const parsed = JSON.parse(storedTasks);
                // Only return if it's a valid array with actual tasks
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
        }
        
        // Return empty array instead of default tasks
        return [];
    };

    const [tasks, setTasks] = useState(getStoredTasks());

    // Save to localStorage whenever tasks change
    useEffect(() => {
        try {
            localStorage.setItem('hydraListTasks', JSON.stringify(tasks));
            console.log('Tasks saved to localStorage:', tasks.length, 'tasks');
        } catch (error) {
            console.error('Error saving tasks to localStorage:', error);
        }
    }, [tasks]);

    const handleCompleteTask = async (taskId, taskText, taskDescription) => {
        // Mark the task as completed immediately for a responsive UI
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, status: 'completed' } : task
            )
        );

        // --- Start of New Simplified Gemini API Call ---
        const fullTaskContext = taskDescription ? `${taskText}: ${taskDescription}` : taskText;

        // 1. Check if the API key exists
        if (!GEMINI_API_KEY) {
            console.error("VITE_GEMINI_API_KEY is not set in your .env file.");
            // Add fallback tasks so the app doesn't break
            const fallbackTasks = [
                { text: `(No API Key) Overthink "${taskText}"`, description: 'The VITE_GEMINI_API_KEY is missing from the .env file.' },
                { text: `(No API Key) Plan to fix env file`, description: 'Restart the dev server after fixing it.' }
            ];
            const newTasks = fallbackTasks.map((taskData, index) => ({ id: Date.now() + index, ...taskData, status: 'todo' }));
            setTasks(prevTasks => [...prevTasks, ...newTasks]);
            return;
        }

        // 2. Construct the prompt for Gemini
        const prompt = `You just completed this task: "${fullTaskContext}"
        Now generate exactly 2 new follow-up tasks that would naturally result from completing this task.
        Return the tasks in this exact format, and nothing else:
        TASK 1:
        TITLE: [brief task title]
        DESCRIPTION: [detailed description of what needs to be done]

        TASK 2:
        TITLE: [brief task title]
        DESCRIPTION: [detailed description of what needs to be done]`;

        try {
            // 3. Call the Gemini API directly from the browser
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
              }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Gemini API Error:", errorData);
                throw new Error("Gemini API request failed.");
            }

            const aiResult = await response.json();
            const generatedText = aiResult.candidates[0].content.parts[0].text;

            // 4. Parse the response (same logic as before)
            const parseAITasks = (text) => {
                const tasks = [];
                const lines = text.split('\n').filter(line => line.trim());
                let currentTask = {};
                for (const line of lines) {
                    if (line.match(/^TASK \d+:/)) {
                        if (currentTask.text && currentTask.description) tasks.push(currentTask);
                        currentTask = {};
                    } else if (line.startsWith('TITLE:')) {
                        currentTask.text = line.replace('TITLE:', '').trim();
                    } else if (line.startsWith('DESCRIPTION:')) {
                        currentTask.description = line.replace('DESCRIPTION:', '').trim();
                    }
                }
                if (currentTask.text && currentTask.description) tasks.push(currentTask);
                return tasks.slice(0, 2).map(task => ({ text: task.text, description: task.description }));
            };

            const aiGeneratedTasks = parseAITasks(generatedText);
            if (aiGeneratedTasks.length < 2) throw new Error("AI did not return two parsable tasks.");

            const newTasks = aiGeneratedTasks.map((taskData, index) => ({
                id: Date.now() + index,
                ...taskData,
                status: 'todo'
            }));
            setTasks(prevTasks => [...prevTasks, ...newTasks]);

        } catch (error) {
            console.error('Error during AI task generation:', error);
            // Fallback if API fails for any reason
            const fallbackTasks = [
                { text: `(API Failed) Overthink "${taskText}"`, description: 'The AI is taking a break. Or it broke. Check the console.' },
                { text: `(API Failed) Debug the AI`, description: 'Look at the browser console (F12) to see the error from the Gemini API.' }
            ];
            const newTasks = fallbackTasks.map((taskData, index) => ({ id: Date.now() + index, ...taskData, status: 'todo' }));
            setTasks(prevTasks => [...prevTasks, ...newTasks]);
        }
    };

    const handleAddTask = (taskData) => {
        // Handle both old format (separate params) and new format (object)
        let taskText, taskDescription;
        
        if (typeof taskData === 'object' && taskData.title) {
            // New format from Button component
            taskText = taskData.title;
            taskDescription = taskData.details;
        } else {
            // Old format (in case called directly with separate params)
            taskText = taskData;
            taskDescription = arguments[1];
        }

        const newTask = {
            id: Date.now(),
            text: taskText || 'A mysteriously vague task that will haunt you',
            description: taskDescription || 'No description provided, which somehow makes it more ominous',
            status: 'todo'
        };
        
        setTasks(prevTasks => [...prevTasks, newTask]);
    };

    // Optional: Add a function to clear all tasks (for debugging/testing)
    const clearAllTasks = () => {
        localStorage.removeItem('hydraListTasks');
        setTasks([]); // Set to empty array
        console.log('All tasks cleared from localStorage');
    };

    return (
        <main 
            className="min-h-screen p-8 bg-cover bg-center bg-no-repeat bg-fixed"
            style={{ 
                fontFamily: 'Gilroy, sans-serif',
                backgroundImage: 'url("./src/assets/bg.jpg")',
                backgroundAttachment: 'fixed',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Optional overlay for better text readability */}
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                style={{ zIndex: -1 }}
            ></div>
            
            <div className="relative z-10">
                {/* Optional: Add a debug button to clear localStorage */}
                <div className="fixed top-4 right-4 z-20">
                    <button
                        onClick={clearAllTasks}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
                        style={{ fontFamily: 'Gilroy, sans-serif' }}
                    >
                        Clear All Tasks
                    </button>
                </div>

                <div
                    className="flex flex-wrap gap-4 items-start"
                    style={{ minHeight: '80vh' }}
                >
                    {/* Only render TaskBlocks if there are tasks */}
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <div
                                key={task.id}
                                className="rounded-2xl flex"
                                style={{ minHeight: 100 }}
                            >
                                <TaskBlock
                                    task={task}
                                    onComplete={handleCompleteTask}
                                />
                            </div>
                        ))
                    ) : (
                        // Optional: Show a message when no tasks exist
                        <div className="w-full flex items-center justify-center">
                            <p 
                                className="text-white/70 text-lg"
                                style={{ fontFamily: 'Gilroy, sans-serif' }}
                            >
                                No tasks yet. Click the + button to add your first task!
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* The Button is positioned fixed in the corner */}
            <div className="fixed bottom-8 right-8 z-20">
                <Button onAddTask={handleAddTask} />
            </div>
        </main>
    );
}

export default TaskListPage;