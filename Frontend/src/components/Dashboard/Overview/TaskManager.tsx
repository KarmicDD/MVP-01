import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiCheck, FiX, FiCalendar, FiClock, FiCheckCircle,
  FiAlertCircle, FiLoader, FiRefreshCw, FiInfo
} from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import { Task } from '../../../types/Dashboard.types';
import api from '../../../services/api';

interface TaskManagerProps {
  role: string;
  tasks?: Task[];
  onTasksUpdated?: () => void;
}

interface NewTaskForm {
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  category: 'profile' | 'document' | 'financial' | 'match' | 'other';
}

interface VerificationResult {
  taskId: string;
  result: {
    message: string;
    nextSteps?: string[];
    completed?: boolean;
  };
  success: boolean;
}

const TaskManager: React.FC<TaskManagerProps> = ({ role, tasks: propTasks, onTasksUpdated }) => {
  // State for task completion
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium',
    category: 'other'
  });
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingAITasks, setGeneratingAITasks] = useState(false);
  const [aiTaskError, setAiTaskError] = useState<string | null>(null);

  // Use provided tasks or fallback to empty array
  const tasks = propTasks || [];

  // Set colors based on role
  const primaryColor = role === 'startup' ? colours.startup.primary : colours.investor.primary;
  const primaryGradient = role === 'startup' ? colours.startup.gradient : colours.investor.gradient;
  const borderColor = role === 'startup' ? colours.startup.border : colours.investor.border;

  // Function to toggle task completion
  const toggleTaskCompletion = async (taskId: string) => {
    if (verifying === taskId) return;

    setVerifying(taskId);
    setLoading(true);

    try {
      // Call the AI verification endpoint
      const response = await api.post(`/tasks/${taskId}/verify`);

      if (response.data.verification.completed) {
        // Update local state
        setCompletedTasks({
          ...completedTasks,
          [taskId]: true
        });

        // Show verification result
        setVerificationResult({
          taskId,
          result: response.data.verification,
          success: true
        });

        // If all tasks are completed, show a special message
        if (response.data.verification.allTasksCompleted) {
          // Add a message to the verification result
          setVerificationResult(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              result: {
                ...prev.result,
                message: `${prev.result.message} All tasks completed! You can now generate new AI tasks.`
              }
            };
          });
        }

        // Notify parent component
        if (onTasksUpdated) {
          onTasksUpdated();
        }
      } else {
        // Show verification result with next steps
        setVerificationResult({
          taskId,
          result: response.data.verification,
          success: false
        });
      }
    } catch (error) {
      console.error('Error verifying task:', error);
      setVerificationResult({
        taskId,
        result: {
          message: 'Error verifying task. Please try again.',
          nextSteps: ['Refresh the page', 'Try again later']
        },
        success: false
      });
    } finally {
      setLoading(false);
      // Only remove the verification spinner, but keep the result visible
      setTimeout(() => {
        setVerifying(null);
      }, 1000);
    }
  };

  // Function to delete a task
  const deleteTask = async (taskId: string) => {
    if (loading) return;

    setLoading(true);

    try {
      await api.delete(`/tasks/${taskId}`);

      // Notify parent component to refresh tasks
      if (onTasksUpdated) {
        onTasksUpdated();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new task
  const addNewTask = async () => {
    if (!newTask.title.trim()) {
      return; // Don't submit if title is empty
    }

    setLoading(true);

    try {
      const response = await api.post('/tasks', {
        ...newTask,
        dueDate: new Date(newTask.dueDate).toISOString()
      });

      // Reset form
      setNewTask({
        title: '',
        description: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'medium',
        category: 'other'
      });

      // Hide form
      setShowAddForm(false);

      // Notify parent component
      if (onTasksUpdated) {
        onTasksUpdated();
      }
    } catch (error) {
      console.error('Error adding task:', error);
      // Show error message
      alert('Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to generate AI tasks
  const generateAITasks = async () => {
    if (generatingAITasks) return; // Prevent multiple simultaneous calls

    setGeneratingAITasks(true);
    setAiTaskError(null);
    setLoading(true);

    try {
      await api.post('/tasks/generate');

      // Notify parent component
      if (onTasksUpdated) {
        onTasksUpdated();
      }
    } catch (error: any) {
      console.error('Error generating tasks:', error);

      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorData = error.response.data;

        if (errorData.incompleteTasks) {
          // Handle case where there are incomplete AI-generated tasks
          setAiTaskError(
            `Please complete your existing ${errorData.incompleteTasks} AI-generated task(s) before generating new ones.`
          );
        } else if (errorData.lastGenerated) {
          // Handle case where tasks were recently generated
          const lastGenerated = new Date(errorData.lastGenerated);
          const nextAvailable = new Date(errorData.nextAvailable);
          const daysRemaining = Math.ceil((nextAvailable.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          setAiTaskError(
            `Tasks were recently generated. You can generate new tasks in ${daysRemaining} day(s).`
          );
        } else {
          // Generic error message
          setAiTaskError(errorData.message || 'Failed to generate AI tasks. Please try again later.');
        }
      } else {
        // Generic error message for other status codes
        setAiTaskError(
          error.response?.data?.message ||
          'Failed to generate AI tasks. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
      setGeneratingAITasks(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md border overflow-hidden"
      style={{
        borderColor: 'rgba(0,0,0,0.06)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.02)'
      }}
    >
      <div className="p-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>Task Manager</h2>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md text-sm"
              style={{
                background: primaryGradient,
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)'
              }}
              onClick={() => setShowAddForm(true)}
              disabled={loading}
            >
              <FiPlus className="inline mr-1" /> Add Task
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              className="px-3 py-1.5 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md text-sm flex items-center"
              style={{
                background: primaryGradient,
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)'
              }}
              onClick={generateAITasks}
              disabled={loading || generatingAITasks}
            >
              {generatingAITasks ? (
                <>
                  <FiLoader className="inline mr-1 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FiRefreshCw className="inline mr-1" /> Generate AI Tasks
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="p-5">
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-4 border rounded-lg"
              style={{ borderColor }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Add New Task</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Task title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Task description"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={newTask.dueDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      value={newTask.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={newTask.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="profile">Profile</option>
                      <option value="document">Document</option>
                      <option value="financial">Financial</option>
                      <option value="match">Match</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md text-sm"
                    style={{ background: primaryGradient }}
                    onClick={addNewTask}
                    disabled={loading || !newTask.title}
                  >
                    {loading ? 'Adding...' : 'Add Task'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show AI task error if present */}
        {aiTaskError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start"
          >
            <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Error generating AI tasks</p>
              <p>{aiTaskError}</p>
            </div>
            <button
              onClick={() => setAiTaskError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <FiX />
            </button>
          </motion.div>
        )}

        {/* Loading state for AI task generation */}
        {generatingAITasks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg"
          >
            <div className="flex items-center">
              <div className="mr-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
              <div>
                <p className="font-medium text-blue-700">Generating AI Tasks</p>
                <p className="text-sm text-blue-600">Please wait while we analyze your profile and create personalized tasks...</p>
              </div>
            </div>
          </motion.div>
        )}

        {tasks.length === 0 && !generatingAITasks ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-2">No tasks available</p>
            <p className="text-sm text-gray-400 mb-4">Generate AI tasks based on your profile or add tasks manually</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md text-sm flex items-center mx-auto"
              style={{ background: primaryGradient }}
              onClick={generateAITasks}
              disabled={loading || generatingAITasks}
            >
              {generatingAITasks ? (
                <>
                  <FiLoader className="inline mr-1 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <FiRefreshCw className="inline mr-1" /> Generate AI Tasks
                </>
              )}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => {
              // Check if task is completed in state or from props
              const isCompleted = completedTasks[task.id] !== undefined
                ? completedTasks[task.id]
                : task.completed;

              // Check if this task is being verified
              const isVerifying = verifying === task.id;

              // Check if task is AI verified
              const isAiVerified = task.aiVerified;

              // Check if we have verification results for this task
              const hasVerificationResult = verificationResult && verificationResult.taskId === task.id;

              return (
                <motion.div
                  key={task.id}
                  className={`p-4 rounded-lg border ${isCompleted ? 'border-gray-100 bg-gray-50' : 'border-gray-100'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    x: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)',
                    transition: { duration: 0.2 }
                  }}
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="flex items-start">
                    <div className="mt-0.5">
                      <motion.div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer ${isCompleted
                          ? isAiVerified
                            ? 'border-green-500 bg-green-500' // AI verified and completed
                            : 'border-blue-500 bg-blue-500' // Manually completed (legacy support)
                          : isVerifying
                            ? 'border-yellow-500 bg-yellow-50' // Currently being verified
                            : 'border-gray-300 hover:border-blue-500' // Not completed
                          }`}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
                        onClick={() => toggleTaskCompletion(task.id)}
                        style={{
                          boxShadow: isCompleted
                            ? isAiVerified
                              ? '0 1px 3px rgba(16, 185, 129, 0.2)' // AI verified shadow
                              : '0 1px 3px rgba(59, 130, 246, 0.2)' // Manual verification shadow
                            : 'none',
                          transition: 'all 0.2s ease'
                        }}
                        title={isCompleted
                          ? isAiVerified
                            ? 'AI verified as completed'
                            : 'Marked as completed'
                          : 'Click to verify completion with AI'
                        }
                      >
                        {isCompleted && (
                          isAiVerified
                            ? <FiCheckCircle size={12} className="text-white" /> // AI verified icon
                            : <FiCheck size={12} className="text-white" /> // Manual completion icon
                        )}
                        {isVerifying && <FiLoader size={12} className="text-yellow-500 animate-spin" />}
                      </motion.div>
                    </div>

                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <h3 className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}
                          style={{ fontWeight: 500, letterSpacing: '-0.01em' }}>
                          {task.title}
                        </h3>
                        <div className="flex items-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'high'
                            ? 'bg-red-50 text-red-600'
                            : task.priority === 'medium'
                              ? 'bg-yellow-50 text-yellow-600'
                              : 'bg-green-50 text-green-600'
                            }`}
                            style={{
                              fontWeight: 500,
                              boxShadow: task.priority === 'high'
                                ? '0 1px 2px rgba(239, 68, 68, 0.1)'
                                : task.priority === 'medium'
                                  ? '0 1px 2px rgba(245, 158, 11, 0.1)'
                                  : '0 1px 2px rgba(16, 185, 129, 0.1)'
                            }}>
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      {task.description && (
                        <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}
                          style={{ lineHeight: '1.4' }}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <FiCalendar size={12} className="mr-1" />
                          <span>{task.formattedDueDate}</span>
                        </div>

                        {!isCompleted && (
                          <motion.button
                            whileHover={{ scale: 1.1, color: '#EF4444' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Delete task"
                          >
                            <FiX size={14} />
                          </motion.button>
                        )}
                      </div>

                      {/* Verification Result - Show either the live verification result or the stored verification message */}
                      <AnimatePresence>
                        {(hasVerificationResult || (task.verificationMessage && !isCompleted)) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mt-2 p-2 rounded text-sm ${hasVerificationResult
                              ? verificationResult.success
                                ? 'bg-green-50 text-green-700'
                                : 'bg-yellow-50 text-yellow-700'
                              : !isCompleted && task.verificationMessage
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-gray-50 text-gray-700'
                              }`}
                          >
                            <div className="flex items-start">
                              {hasVerificationResult ? (
                                verificationResult.success ? (
                                  <FiCheckCircle className="mr-1 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <FiAlertCircle className="mr-1 mt-0.5 flex-shrink-0" />
                                )
                              ) : (
                                <FiInfo className="mr-1 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                {/* Show either live verification result or stored message */}
                                <p>
                                  {hasVerificationResult
                                    ? verificationResult.result.message
                                    : task.verificationMessage || 'Task needs verification'}
                                </p>

                                {/* Show next steps if available */}
                                {hasVerificationResult && !verificationResult.success && verificationResult.result.nextSteps && (
                                  <ul className="mt-1 list-disc list-inside">
                                    {verificationResult.result.nextSteps.map((step: string, i: number) => (
                                      <li key={i}>{step}</li>
                                    ))}
                                  </ul>
                                )}

                                {/* Show verification timestamp if available */}
                                {task.lastVerifiedAt && !hasVerificationResult && (
                                  <p className="text-xs mt-1 text-gray-500">
                                    Last verified: {new Date(task.lastVerifiedAt).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  if (hasVerificationResult) {
                                    setVerificationResult(null);
                                  } else {
                                    // Toggle visibility of stored verification message
                                    // This would require additional state to track which messages are visible
                                    // For simplicity, we'll just trigger a re-verification
                                    toggleTaskCompletion(task.id);
                                  }
                                }}
                                className="ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                                aria-label="Close verification result"
                              >
                                {hasVerificationResult ? (
                                  <FiX size={16} />
                                ) : (
                                  <FiRefreshCw size={16} title="Re-verify task" />
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
