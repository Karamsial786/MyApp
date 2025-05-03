
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Home, Bell, Gift } from 'lucide-react';
import { useEffect, useState } from 'react';

// Create a NotificationContext to share the notification state
import React from 'react';

// Get notifications from a global state
export const useNotifications = () => {
  // This is mock data - in a real application, this would fetch from an API
  const [notificationCount, setNotificationCount] = useState(2);
  
  return {
    notificationCount,
    setNotificationCount
  };
};

export function BottomNavigation() {
  const [location] = useLocation();
  const { notificationCount } = useNotifications();
  const showNotificationBell = location !== '/' && notificationCount > 0;

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 z-50">
      <div className="grid grid-cols-2 max-w-md mx-auto">
        <Link href="/">
          <div className="relative">
            {showNotificationBell && (
              <div className="absolute top-0.5 left-1.5 z-10">
                <div className="relative inline-flex items-center">
                  <div className="bg-white/90 p-0.5 rounded-full shadow-sm">
                    <Bell className="h-3 w-3 text-indigo-600" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] rounded-full h-2.5 w-2.5 flex items-center justify-center font-semibold shadow-sm animate-pulse-slow">
                      {notificationCount}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className={cn(
              "flex flex-col items-center justify-center py-2 cursor-pointer",
              location === '/' ? 'text-primary border-t-2 border-primary' : 'text-slate-400 hover:text-slate-700'
            )}>
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium mt-1">Home</span>
            </div>
          </div>
        </Link>
        <Link href="/referrals">
          <div className={cn(
            "flex flex-col items-center justify-center py-2 cursor-pointer",
            location === '/referrals' ? 'text-primary border-t-2 border-primary' : 'text-slate-400 hover:text-slate-700'
          )}>
            <Gift className="h-5 w-5" />
            <span className="text-xs font-medium mt-1">Refers & Rewards</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default BottomNavigation;
