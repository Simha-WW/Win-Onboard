/**
 * Notifications Page - Message center and alerts
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FiMail, FiCheck, FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { notificationsApi, type Notification } from '../utils/api';
import { clsx } from 'clsx';

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
    };
    loadNotifications();
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <FiCheckCircle className="text-green-600" />;
      case 'warning': return <FiAlertTriangle className="text-yellow-600" />;
      case 'error': return <FiAlertTriangle className="text-red-600" />;
      default: return <FiInfo className="text-blue-600" />;
    }
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || (filter === 'unread' && !n.read)
  );

  const markAsRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        <div className="flex gap-3">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className={clsx(
              'transition-all duration-200',
              !notification.read && 'border-l-4 border-l-[var(--brand-accent)] bg-blue-50/30'
            )}>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={clsx(
                      'font-medium',
                      notification.read ? 'text-slate-700' : 'text-slate-900'
                    )}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={clsx(
                    'text-sm mb-3',
                    notification.read ? 'text-slate-600' : 'text-slate-700'
                  )}>
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};