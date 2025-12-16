/**
 * Day-1 Hub Page - First day information and orientation
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FiCalendar, FiMapPin, FiClock, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { onboardingApi } from '../utils/api';

export const Day1Hub = () => {
  const [buddy, setBuddy] = useState<any>(null);
  const [orientation, setOrientation] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const [buddyData, orientationData] = await Promise.all([
        onboardingApi.getBuddy(),
        onboardingApi.getOrientation()
      ]);
      setBuddy(buddyData);
      setOrientation(orientationData);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Day-1 Hub</h1>
        <p className="text-slate-600">Everything you need for your first day</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Buddy Information */}
        {buddy && (
          <Card>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Meet Your Buddy 👋
            </h2>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] rounded-full flex items-center justify-center text-white font-bold text-xl">
                {buddy.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{buddy.name}</h3>
                <p className="text-slate-600 text-sm">{buddy.role}</p>
                <p className="text-slate-600 text-sm mb-3">{buddy.department}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FiMail className="w-4 h-4" />
                    {buddy.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FiPhone className="w-4 h-4" />
                    {buddy.phone}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Send Message
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Orientation Schedule */}
        {orientation && (
          <Card>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Orientation Schedule
            </h2>
            <div className="space-y-4">
              {orientation.sessions.map((session: any, index: number) => (
                <div key={index} className="border-l-4 border-l-[var(--brand-accent)] pl-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                    <FiClock className="w-4 h-4" />
                    {session.time} • {session.duration}
                  </div>
                  <h4 className="font-medium text-slate-900">{session.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FiMapPin className="w-4 h-4" />
                    {session.location}
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4">
              Join Orientation
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};