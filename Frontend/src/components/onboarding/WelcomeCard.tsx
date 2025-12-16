/**
 * Welcome Card component for the home page
 * Displays personalized welcome message with company branding
 */

import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

interface WelcomeCardProps {
  userName: string;
  startDate: string;
  companyName?: string;
}

/**
 * Animated welcome card with company logo and personalized greeting
 */
export const WelcomeCard = ({ 
  userName, 
  startDate,
  companyName = "WinOnboard" 
}: WelcomeCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card 
      className="bg-gradient-to-br from-[var(--brand-primary)] via-[var(--brand-primary-dark)] to-[var(--brand-accent)] text-white border-0 shadow-2xl relative overflow-hidden"
      hover={false}
      padding="xl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
      </div>
      
      <div className="relative flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1"
        >
          {/* Company Logo */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mr-5">
              <img 
                src="/images/logo.jpg" 
                alt="Company Logo" 
                className="h-10 w-10 rounded-xl"
              />
            </div>
            <span className="text-3xl font-bold tracking-tight">{companyName}</span>
          </div>

          {/* Welcome Message */}
          <div className="space-y-4">
            <motion.h1 
              className="text-4xl lg:text-5xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Welcome, {userName}! 🎉
            </motion.h1>
            
            <motion.p 
              className="text-white/90 text-xl font-medium leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              We're excited to have you join our team and can't wait to see the amazing things you'll accomplish
            </motion.p>
            
            <motion.div 
              className="flex items-center gap-2 text-white/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <span className="text-lg">Your start date:</span>
              <span className="font-bold text-xl bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                {formatDate(startDate)}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Decorative Elements */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 0.15, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="w-40 h-40 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/50"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  );
};