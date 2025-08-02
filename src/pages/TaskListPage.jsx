// src/pages/TaskListPage.jsx
import { useState, useEffect } from 'react'; // Add useEffect
import TaskBlock from '../components/TaskBlock';
import Button from '../components/Button';

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

function TaskListPage() {
    // Helper function to get tasks from localStorage
    const getStoredTasks = () => {
        try {
            const storedTasks = localStorage.getItem('hydraListTasks');
            if (storedTasks) {
                return JSON.parse(storedTasks);
            }
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
        }
        
        // Return default tasks if nothing in storage or error
        return [
            { 
                id: 1, 
                text: 'Start my useless project', 
                description: 'Begin the endless cycle of productivity theater by creating something that solves no real problems',
                status: 'todo' 
            },
            { 
                id: 2, 
                text: 'Question my life choices', 
                description: 'Spend at least 30 minutes contemplating whether this project reflects deeper existential issues',
                status: 'todo' 
            },
        ];
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
    }, [tasks]); // Runs every time tasks array changes

    const handleCompleteTask = async (taskId, taskText, taskDescription) => {
        // Mark the task as completed immediately for a responsive UI
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, status: 'completed' } : task
            )
        );

        const fullTaskContext = taskDescription ? `${taskText}: ${taskDescription}` : taskText;

        try {
            // NEW: Call our own backend API endpoint
            const response = await fetch('/api/generateTasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fullTaskContext }), // Send the context to our function
            });

            if (!response.ok) {
                // The error from our function will be in the response body
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const result = await response.json();
            const generatedText = result.generated_text || '';
            console.log('AI Response:', generatedText);

            // Your brilliant parsing logic remains unchanged!
            const parseAITasks = (text) => {
                const tasks = [];
                const lines = text.split('\n').map(line => line.trim()).filter(line => line);
                let currentTask = {};
                for (const line of lines) {
                    if (line.match(/^TASK \d+:$/)) {
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
            console.log('Parsed AI Tasks:', aiGeneratedTasks);

            let tasksToAdd;
            if (aiGeneratedTasks.length >= 2) {
                tasksToAdd = aiGeneratedTasks;
            } else {
                // Fallback if parsing fails
                throw new Error("AI did not return two parsable tasks.");
            }

            const newTasks = tasksToAdd.map((taskData, index) => ({
                id: Date.now() + index,
                ...taskData,
                status: 'todo'
            }));

            setTasks(prevTasks => [...prevTasks, ...newTasks]);

        } catch (error) {
            // This single catch block now handles all errors gracefully!
            console.error('Error generating new tasks:', error);

            // Your excellent fallback task logic
            const fallbackTasks = [
                { text: `Regret completing "${taskText}"`, description: 'Wonder if you could have done it better.' },
                { text: `Wonder why finishing "${taskText}" was a good idea`, description: 'Question everything.' }
            ];

            const newTasks = fallbackTasks.map((taskData, index) => ({
                id: Date.now() + index,
                ...taskData,
                status: 'todo'
            }));

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
        setTasks(getStoredTasks()); // Reset to defaults
        console.log('All tasks cleared from localStorage');
    };

    // The rendering part now includes Tailwind classes directly
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
                {/* Optional: Add a debug button to clear localStorage (remove in production) */}
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
                    {/* Render TaskBlocks */}
                    {tasks.map((task) => (
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
                    ))}
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