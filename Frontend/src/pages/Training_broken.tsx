/**
 * Training Page - Learning modules and progress
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { FiPlay, FiCheck, FiClock } from 'react-icons/fi';
import { trainingApi, type Training } from '../utils/api';

export const Training = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    const loadTraining = async () => {
      const data = await trainingApi.getTraining();
      setTrainings(data);
    };
    loadTraining();
  }, []);

  const getStatusIcon = (status: Training['status']) => {
    switch (status) {
      case 'completed': return <FiCheck className="text-green-600" />;
      case 'in-progress': return <FiPlay className="text-blue-600" />;
      default: return <FiClock className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900">Training Modules</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {trainings.map((training, index) => (
          <motion.div
            key={training.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(training.status)}
                    <h3 className="text-lg font-semibold text-slate-900">
                      {training.title}
                    </h3>
                  </div>
                  <p className="text-slate-600 mb-4">{training.description}</p>
                  <div className="space-y-3">
                    <ProgressBar
                      progress={training.progress}
                      variant={training.status === 'completed' ? 'success' : 'primary'}
                    />
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Duration: {training.duration}</span>
                      <span>Due: {new Date(training.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant={training.status === 'completed' ? 'secondary' : 'primary'}
                  disabled={training.status === 'completed'}
                >
                  {training.status === 'completed' ? 'Completed' : 
                   training.status === 'in-progress' ? 'Continue' : 'Start'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};