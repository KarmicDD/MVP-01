import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import { colours } from '../../../utils/colours';

interface UpcomingTasksProps {
  role: string;
}

const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ role }) => {
  // Mock data for upcoming tasks
  const tasks = [
    {
      id: '1',
      title: 'Complete profile information',
      dueDate: 'Today',
      priority: 'high',
      completed: false
    },
    {
      id: '2',
      title: 'Upload financial documents',
      dueDate: 'Tomorrow',
      priority: 'medium',
      completed: false
    },
    {
      id: '3',
      title: 'Review belief system analysis',
      dueDate: 'Oct 15, 2023',
      priority: 'low',
      completed: true
    }
  ];
  
  // Primary color based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';
  
  // Priority colors
  const priorityColors = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981'
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Upcoming Tasks</h2>
          <a 
            href="#view-all" 
            className="text-sm font-medium flex items-center"
            style={{ color: primaryColor }}
          >
            View all
            <FiArrowRight size={14} className="ml-1" />
          </a>
        </div>
      </div>
      
      <div className="p-5">
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <motion.div 
              key={task.id}
              className={`p-3 rounded-lg border ${task.completed ? 'border-gray-100 bg-gray-50' : 'border-gray-200'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-start">
                <div className="mt-0.5">
                  <motion.div 
                    className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${
                      task.completed 
                        ? 'border-green-500 bg-green-500' 
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    {task.completed && <FiCheckCircle size={12} className="text-white" />}
                  </motion.div>
                </div>
                
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {task.title}
                  </h3>
                  
                  <div className="mt-1 flex items-center text-xs">
                    <div className="flex items-center text-gray-500">
                      <FiCalendar size={12} className="mr-1" />
                      <span>{task.dueDate}</span>
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
          ))}
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
        <button 
          className="px-4 py-2 rounded-lg text-white font-medium text-sm shadow-sm transition-all hover:shadow-md"
          style={{ 
            background: role === 'startup' 
              ? colours.primaryGradient
              : 'linear-gradient(135deg, #10B981, #059669)'
          }}
        >
          Add New Task
        </button>
      </div>
    </div>
  );
};

export default UpcomingTasks;
