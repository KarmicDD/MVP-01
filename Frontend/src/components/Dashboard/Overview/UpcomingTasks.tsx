import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiCalendar, FiClock, FiCheckCircle, FiPlus } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import { Task } from '../../../types/Dashboard.types';

interface UpcomingTasksProps {
  role: string;
  tasks?: Task[];
}

const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ role, tasks: propTasks }) => {
  // State for task completion
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  // Use provided tasks or fallback to mock data
  const tasks = propTasks && propTasks.length > 0 ? propTasks : [
    {
      id: '1',
      title: 'Complete profile information',
      dueDate: new Date().toISOString(),
      formattedDueDate: 'Today',
      priority: 'high',
      completed: false
    },
    {
      id: '2',
      title: 'Upload financial documents',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      formattedDueDate: 'Tomorrow',
      priority: 'medium',
      completed: false
    },
    {
      id: '3',
      title: 'Review belief system analysis',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
      formattedDueDate: 'Oct 15, 2023',
      priority: 'low',
      completed: true
    }
  ];

  // Function to toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Define colors based on role
  const primaryColor = role === 'startup' ? colours.startup.primary : colours.investor.primary;
  const primaryGradient = role === 'startup' ? colours.startup.gradient : colours.investor.gradient;
  const borderColor = role === 'startup' ? colours.startup.border : colours.investor.border;

  // Priority colors
  const priorityColors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981'
  };

  // Function to add a new task (placeholder for now)
  const addNewTask = () => {
    // This would open a modal or form to add a new task
    // For now, just log the action
    console.log('Add new task');
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border overflow-hidden"
      style={{ borderColor }}
    >
      <div className="p-5 border-b" style={{ borderColor }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Upcoming Tasks</h2>
          <motion.button
            whileHover={{ x: 3 }}
            className="text-sm font-medium flex items-center"
            style={{ color: primaryColor }}
          >
            View all
            <FiArrowRight size={14} className="ml-1" />
          </motion.button>
        </div>
      </div>

      <div className="p-5">
        {tasks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">No upcoming tasks</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md text-sm"
              style={{ background: primaryGradient }}
              onClick={addNewTask}
            >
              <FiPlus className="inline mr-1" /> Create Task
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => {
              // Check if task is completed in state or from props
              const isCompleted = completedTasks[task.id] !== undefined
                ? completedTasks[task.id]
                : task.completed;

              return (
                <motion.div
                  key={task.id}
                  className={`p-3 rounded-lg border ${isCompleted ? 'border-gray-100 bg-gray-50' : 'border-gray-200'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start">
                    <div className="mt-0.5">
                      <motion.div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${isCompleted
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300 hover:border-blue-500'
                          }`}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleTaskCompletion(task.id)}
                      >
                        {isCompleted && <FiCheckCircle size={12} className="text-white" />}
                      </motion.div>
                    </div>

                    <div className="ml-3 flex-1">
                      <h3 className={`text-sm font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {task.title}
                      </h3>

                      <div className="mt-1 flex items-center text-xs">
                        <div className="flex items-center text-gray-500">
                          <FiCalendar size={12} className="mr-1" />
                          <span>{task.formattedDueDate}</span>
                        </div>

                        <div className="ml-3 flex items-center">
                          <span
                            className="w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] }}
                          ></span>
                          <span className="capitalize text-gray-500">
                            {task.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t text-center" style={{ borderColor }}>
        <motion.button
          className="px-4 py-2 rounded-lg text-white font-medium text-sm shadow-sm transition-all hover:shadow-md flex items-center justify-center mx-auto"
          style={{ background: primaryGradient }}
          whileHover={{ y: -2, boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)' }}
          whileTap={{ y: 0 }}
          onClick={addNewTask}
        >
          <FiPlus className="mr-1" /> Add New Task
        </motion.button>
      </div>
    </div>
  );
};

export default UpcomingTasks;
