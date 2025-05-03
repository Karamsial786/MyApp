import { useState, useEffect } from 'react';
import { Eye, Info, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIpAccounts } from '@/hooks/use-ipAccounts';
import { useLocation } from 'wouter';
import { formatCountdown, formatTimeLeft, formatRenewalCountdown } from '@/lib/utils';
import { IpAccount } from '@shared/schema';
import ViewDetailsDialog from './ViewDetailsDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

export function IPTable() {
  const { ipAccounts, isLoading, isError, renewIpAccount, isRenewing, getTimeLeft, refetch } = useIpAccounts();
  const [selectedIp, setSelectedIp] = useState<IpAccount | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false); // Changed from isModalOpen
  const [, setLocation] = useLocation();
  const [timeLeft, setTimeLeft] = useState<Record<number, ReturnType<typeof formatTimeLeft>>>({});
  const [renewalTimeLeft, setRenewalTimeLeft] = useState<Record<number, ReturnType<typeof formatTimeLeft>>>({});
  const [pendingRenewals, setPendingRenewals] = useState<number[]>(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem('pendingRenewalAccounts');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Force debug log to check accounts
  useEffect(() => {
    console.log('IPTable received accounts:', ipAccounts);
  }, [ipAccounts]);

  // Group accounts by platform - for numbering (e.g., Timewall 1, Timewall 2, etc.)
  const platformCounts: Record<string, number> = {};
  const accountDisplayNames: Record<number, string> = {};

  ipAccounts?.forEach(account => {
    if (!platformCounts[account.platform]) {
      platformCounts[account.platform] = 1;
    } else {
      platformCounts[account.platform]++;
    }

    // If there's only one account of this platform, don't add a number
    if (ipAccounts.filter(a => a.platform === account.platform).length === 1) {
      accountDisplayNames[account.id] = account.platform;
    } else {
      // Find the position of this account among its platform siblings
      const position = ipAccounts
        .filter(a => a.platform === account.platform)
        .sort((a, b) => a.id - b.id)
        .findIndex(a => a.id === account.id) + 1;

      accountDisplayNames[account.id] = `${account.platform} ${position}`;
    }
  });

  // Initialize and update countdown timers
  useEffect(() => {
    if (!ipAccounts || ipAccounts.length === 0) return;

    const timers: Record<number, ReturnType<typeof formatTimeLeft>> = {};
    const renewalTimers: Record<number, ReturnType<typeof formatTimeLeft>> = {};

    // Initial calculation of all timers
    ipAccounts.forEach(account => {
      // Calculate time left until expiry
      const timeLeftValue = formatTimeLeft(
        new Date(account.expiryDate).getTime() - new Date().getTime()
      );
      timers[account.id] = timeLeftValue;

      // If account is expired and has a renewal deadline, calculate time until renewal deadline
      if (account.renewalDeadline && timeLeftValue.expired) {
        renewalTimers[account.id] = formatTimeLeft(
          new Date(account.renewalDeadline).getTime() - new Date().getTime()
        );
      }
    });

    setTimeLeft(timers);
    setRenewalTimeLeft(renewalTimers);

    // Update timers every second
    const interval = setInterval(() => {
      const updatedTimers = {...timers};
      const updatedRenewalTimers = {...renewalTimers};
      const now = new Date().getTime();

      ipAccounts.forEach(account => {
        // Update expiry timer
        const timeLeftValue = formatTimeLeft(
          new Date(account.expiryDate).getTime() - now
        );
        updatedTimers[account.id] = timeLeftValue;

        // Update renewal deadline timer if account is expired
        if (account.renewalDeadline && timeLeftValue.expired) {
          updatedRenewalTimers[account.id] = formatTimeLeft(
            new Date(account.renewalDeadline).getTime() - now
          );
        }
      });

      setTimeLeft(updatedTimers);
      setRenewalTimeLeft(updatedRenewalTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [ipAccounts]);



  // Effect to check for expired accounts and auto-update their status
  useEffect(() => {
    if (!ipAccounts || ipAccounts.length === 0) return;

    // Function to check for accounts that need status updates
    const checkExpiredAccounts = async () => {
      try {
        // Use the admin endpoint to check for expired accounts
        // This is simulating what would normally be done by a background job/cron
        const response = await fetch('/api/admin/check-expired-accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // In a production app, this would require admin authentication
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Expired accounts check completed:', result);
          // If any accounts were updated, refresh the account list
          if (result.expiredAccounts.length > 0 || result.accountsToDelete.length > 0) {
            // Refetch the accounts list
            refetch();
          }
        }
      } catch (error) {
        console.error('Error checking expired accounts:', error);
      }
    };

    // Run the check immediately
    checkExpiredAccounts();

    // Set up interval to check periodically (every 5 minutes)
    // In production, this would be a cron job on the server
    const checkInterval = setInterval(checkExpiredAccounts, 5 * 60 * 1000);

    return () => clearInterval(checkInterval);
  }, [ipAccounts, refetch]);

  // Effect to sync pendingRenewals with localStorage
  useEffect(() => {
    // Save to localStorage whenever pendingRenewals changes
    localStorage.setItem('pendingRenewalAccounts', JSON.stringify(pendingRenewals));
  }, [pendingRenewals]);

  // Show IP details modal
  const showDetails = (ip: IpAccount) => {
    setSelectedIp(ip);
    setIsDetailsOpen(true); // Changed from setIsModalOpen
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading accounts...</div>;
  }

  if (isError) {
    return <div className="py-8 text-center text-red-500">Error loading accounts</div>;
  }

  return (
    <>
      <div>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center">
              Active Accounts
              <span className="ml-2 sm:ml-3 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
                {ipAccounts.length}
              </span>
            </h2>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 px-2 sm:px-4">
          {ipAccounts.length > 0 ? (
            <div>
              <table className="w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-blue-50 to-slate-50">
                  <tr>
                    <th scope="col" className="w-[40%] px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Accounts
                    </th>
                    <th scope="col" className="w-[25%] px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Expiry
                    </th>
                    <th scope="col" className="w-[35%] px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {ipAccounts.map((ip) => (
                    <tr key={ip.id}>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex flex-col">
                          {/* Account Name in oval container with status badge */}
                          <div className="relative inline-flex">
                            {/* Status badge positioned at top-left edge of container */}
                            <div className="absolute -top-1 -left-1 z-10">
                              {!ip.isActive || timeLeft[ip.id]?.expired ? (
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500 border border-white shadow-sm inline-block"></span>
                              ) : (
                                <span className="h-2.5 w-2.5 rounded-full bg-green-500 border border-white shadow-sm inline-block"></span>
                              )}
                            </div>
                            
                            {/* Oval container that adjusts to content width */}
                            <div className="bg-slate-100 text-slate-800 px-4 py-1.5 rounded-full inline-flex items-center justify-center shadow-sm border border-slate-200">
                              <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
                                {accountDisplayNames[ip.id]}
                              </span>
                            </div>
                          </div>

                          {/* Renewal Deadline Timer (if account is expired) */}
                          {timeLeft[ip.id]?.expired && renewalTimeLeft[ip.id] && !renewalTimeLeft[ip.id].expired && (
                            <div className="mt-2">
                              <div className="bg-red-50 text-red-700 rounded-md px-3 py-1 border border-red-100 flex flex-col">
                                {/* Title */}
                                <span className="text-xs font-semibold mb-0.5">Renewal Deadline</span>
                                
                                {/* Countdown with info icon */}
                                <div className="flex items-center">
                                  <span className="text-xs font-mono whitespace-nowrap">
                                    {renewalTimeLeft[ip.id].days}d {renewalTimeLeft[ip.id].hours}h
                                  </span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center ml-1">
                                          <Info className="h-3 w-3 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent 
                                        side="top" 
                                        sideOffset={5}
                                        className="z-50 p-2 max-w-[200px] bg-white dark:bg-slate-900 shadow-lg rounded-md border border-slate-200 dark:border-slate-700"
                                        avoidCollisions={true}
                                      >
                                        <p className="text-xs text-slate-800 dark:text-slate-200">
                                          This account ({ip.platform}) must be renewed within {renewalTimeLeft[ip.id].days} Days, {renewalTimeLeft[ip.id].hours} Hours.
                                          If not renewed, it will be permanently deleted.
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex justify-center sm:justify-start">
                          <div className={`text-xs sm:text-sm font-mono countdown rounded-md px-3 py-1.5 inline-flex items-center justify-center min-w-[100px] whitespace-nowrap shadow-sm
                            ${timeLeft[ip.id]?.expired 
                              ? 'text-red-700 font-medium bg-red-50 border border-red-100' 
                              : 'text-blue-700 font-medium bg-blue-50 border border-blue-100'}`}>
                            {timeLeft[ip.id] 
                              ? (timeLeft[ip.id].expired 
                                  ? 'Expired' 
                                  : formatCountdown(timeLeft[ip.id])) 
                              : 'Loading...'}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                        <div className="flex justify-center sm:justify-start">
                          {(!ip.isActive || timeLeft[ip.id]?.expired) ? (
                            pendingRenewals.includes(ip.id) ? (
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-md shadow-sm w-full sm:w-auto"
                                disabled
                              >
                                <span className="flex items-center justify-center">Pending</span>
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-md shadow-sm w-full sm:w-auto"
                                onClick={() => {
                                  // Redirect to RenewAccount page with the selected account ID
                                  // This will be considered as the Selected Account
                                  setLocation(`/renew-account?account=${ip.id}&platform=${ip.platform}`);
                                }}
                              >
                                <span className="flex items-center justify-center">Renew</span>
                              </Button>
                            )
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-md shadow-sm w-full sm:w-auto"
                              onClick={() => showDetails(ip)}
                            >
                              <span className="flex items-center justify-center">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                                <span className="hidden sm:inline">View</span> Details
                              </span>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {ipAccounts.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 sm:px-6 py-3 sm:py-4 text-center text-sm text-slate-500">
                        No accounts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 px-4 sm:px-8">
              <div className="mb-5 sm:mb-6 bg-blue-50 inline-flex rounded-full p-4 sm:p-5">
                <ShoppingCart className="h-10 w-10 sm:h-14 sm:w-14 text-blue-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3">No Active Accounts</h3>
              <p className="text-sm text-slate-600 mb-5 sm:mb-6 max-w-md mx-auto">You don't have any active accounts yet. Purchase your first account to start using the platform.</p>
              <Button
                variant="default"
                size="default"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold rounded-md shadow-sm transition-all hover:shadow-md"
                onClick={() => setLocation('/buy-account')}
              >
                <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Buy Your First Account
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* IP Details Dialog */}
      {selectedIp && (
        <ViewDetailsDialog
          ipAccount={selectedIp}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          isAdmin={true} // For testing purposes we've set this to true. In production, this would be determined by user role
        />
      )}
    </>
  );
}

export default IPTable;