import { Bell, User, ShoppingCartIcon, HelpCircle, Settings, KeyRound, LogOut, Link as LinkIcon, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLocation } from 'wouter';
import { useNotifications } from '@/components/BottomNavigation';
import { useSupportNotifications } from '@/hooks/use-support-notifications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const notifications = useNotifications();
  const notificationCount = notifications?.notificationCount || 0;
  const supportNotifications = useSupportNotifications();
  const supportUnreadCount = supportNotifications?.unreadCount || 0;
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();

  // State for dialogs
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {window.location.pathname === '/' ? (
        <header className="bg-white shadow-md fixed top-0 w-full z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="default"
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 text-base font-semibold rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                onClick={() => navigate('/buy-account')}
              >
                <ShoppingCartIcon className="mr-1.5 h-5 w-5" />
                Buy Account
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-primary focus:outline-none">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && window.location.pathname === '/' && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-sm animate-pulse-slow">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="border-b border-slate-200 px-4 py-2">
                  <h3 className="font-medium text-slate-800">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 hover:bg-slate-50 border-l-4 border-amber-500">
                    <p className="text-sm font-medium text-slate-800">IP Expiration Alert</p>
                    <p className="text-xs text-slate-500">Your IP will expire in 48 hours. Consider renewal.</p>
                    <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-slate-50 border-l-4 border-primary">
                    <p className="text-sm font-medium text-slate-800">System Update</p>
                    <p className="text-xs text-slate-500">New features have been added to your dashboard.</p>
                    <p className="text-xs text-slate-400 mt-1">1 day ago</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-200 text-slate-700">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Edit Profile</span>
                </DropdownMenuItem>
                
                
                <DropdownMenuItem onClick={() => setNotificationDialogOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Notification Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/rejected-accounts')} className="relative">
                  <AtSign className="mr-2 h-4 w-4" />
                  <span>Rejected Accounts</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/support')} className="relative">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                  {supportUnreadCount > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse-slow">
                      {supportUnreadCount}
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        </header>
      ) : null}

      {/* Edit Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Username</label>
              <div className="col-span-3 flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                {user?.username || ""}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">First Name</label>
              <input 
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" 
                defaultValue={user?.firstName || ""}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Last Name</label>
              <input 
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" 
                defaultValue={user?.lastName || ""}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Email</label>
              <div className="col-span-3 flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                {user?.email || ""}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Password</label>
              <div className="col-span-3">
                <Button variant="outline" className="w-full" onClick={() => setPasswordDialogOpen(true)}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Referral Code</label>
              <div className="col-span-3 flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                <span className="text-slate-500">No referral - Direct signup</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Current Password</label>
              <input 
                type="password"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">New Password</label>
              <input 
                type="password"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Confirm Password</label>
              <input 
                type="password"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button>Update Password</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Settings Dialog */}
      <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Manage your notification preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="account" className="h-4 w-4 rounded border-gray-300" defaultChecked />
              <label htmlFor="account" className="text-sm font-medium">Account updates</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="ip-expiry" className="h-4 w-4 rounded border-gray-300" defaultChecked />
              <label htmlFor="ip-expiry" className="text-sm font-medium">IP expiration alerts</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="marketing" className="h-4 w-4 rounded border-gray-300" />
              <label htmlFor="marketing" className="text-sm font-medium">Marketing and promotions</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="support" className="h-4 w-4 rounded border-gray-300" defaultChecked />
              <label htmlFor="support" className="text-sm font-medium">Support messages</label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setNotificationDialogOpen(false)}>Cancel</Button>
            <Button>Save Preferences</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Header;