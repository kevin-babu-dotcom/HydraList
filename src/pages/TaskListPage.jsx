    // src/pages/TaskListPage.jsx
    import { useState } from 'react';
    import TaskBlock from '../components/TaskBlock';
    import Button from '../components/Button';

    const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;

    function TaskListPage() {
    const [tasks, setTasks] = useState([
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
    ]);

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

    // The rendering part now includes Tailwind classes directly
    return (
        // Use Tailwind classes for the main page container
        <main className="bg-slate-900 text-slate-100 min-h-screen font-sans p-4 sm:p-8">
        
        {/* Centered content container */}
        <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-8">
            The Sisyphus Task-List
            </h1>
            
            {/* Container for the tasks with flexbox layout for inline blocks */}
            <div className="flex flex-wrap gap-4 justify-start">
            {tasks.map((task) => (
                <TaskBlock
                key={task.id}
                task={task}
                onComplete={handleCompleteTask}
                />
            ))}
            </div>
        </div>
        
        {/* The Button is positioned fixed in the corner */}
        <div className="fixed bottom-8 right-8">
            <Button onAddTask={handleAddTask} />
        </div>

        </main>
    );
    }

    export default TaskListPage;