import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, withAuth } from "@/contexts/AuthContext";
import { Splash } from "@/pages/Splash";
import { Login } from "@/pages/Login";
import { Signup } from "@/pages/Signup";
import { Verify } from "@/pages/Verify";
import Home from "@/pages/Home";
import { BuyAccount } from "@/pages/BuyAccount";
import RenewAccount from "@/pages/RenewAccount";
import ProxyRewards from "@/pages/ProxyRewards";
import Referrals from "@/pages/Referrals";
import ClaimDiscount from "@/pages/ClaimDiscount";
import SupportChat from "@/pages/SupportChat"; // Keep for backwards compatibility
import SupportChatDetailed from "@/pages/SupportChatDetailed";
import TicketHistory from "@/pages/TicketHistory";
import NotFound from "@/pages/not-found";
import BottomNavigation from "@/components/BottomNavigation";
import { useEffect } from "react";

function Router() {
  const [location, navigate] = useLocation();
  
  // Redirect from old /support route to the new ticket history
  useEffect(() => {
    if (location === "/support") {
      navigate("/support/tickets");
    }
  }, [location, navigate]);
  
  // Create protected versions of components
  const ProtectedHome = withAuth(Home);
  const ProtectedBuyAccount = withAuth(BuyAccount);
  const ProtectedRenewAccount = withAuth(RenewAccount);
  const ProtectedProxyRewards = withAuth(ProxyRewards);
  const ProtectedReferrals = withAuth(Referrals);
  const ProtectedClaimDiscount = withAuth(ClaimDiscount);
  const ProtectedTicketHistory = withAuth(TicketHistory);
  const ProtectedSupportChatDetailed = withAuth(SupportChatDetailed);
  const ProtectedSupportChat = withAuth(SupportChat);
  
  return (
    <Switch>
      {/* Authentication Routes */}
      <Route path="/splash" component={Splash} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/verify" component={Verify} />
      
      {/* Protected Routes */}
      <Route path="/" component={ProtectedHome}/>
      <Route path="/buy-account" component={ProtectedBuyAccount}/>
      <Route path="/renew-account" component={ProtectedRenewAccount}/>
      <Route path="/proxy-rewards" component={ProtectedProxyRewards}/>
      <Route path="/referrals" component={ProtectedReferrals}/>
      <Route path="/claim-discount" component={ProtectedClaimDiscount}/>
      
      {/* Protected Support Ticketing System */}
      <Route path="/support/tickets" component={ProtectedTicketHistory}/>
      <Route path="/support/:ticketId" component={ProtectedSupportChatDetailed}/>
      
      {/* Legacy route - will redirect */}
      <Route path="/support" component={ProtectedSupportChat}/>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const showBottomNav = !location.startsWith("/login") && 
                        !location.startsWith("/signup") && 
                        !location.startsWith("/verify") && 
                        !location.startsWith("/splash") &&
                        !location.startsWith("/support");
  
  // Initialize test session for OWNERS3 on load and ensure persistent login
  useEffect(() => {
    // Import the ensureDefaultAccounts function here to initialize our protected accounts
    const ensureProtectedAccounts = async () => {
      try {
        // Dynamic import to avoid circular dependencies
        const { ensureDefaultAccounts } = await import('./lib/accountStore');
        // Initialize default accounts for OWNERS3
        const accounts = ensureDefaultAccounts();
        console.log('Protected accounts initialized:', accounts);
      } catch (error) {
        console.error('Failed to initialize protected accounts:', error);
      }
    };

    // Check if a session already exists in localStorage first
    const existingSessionId = localStorage.getItem('sessionId');
    const existingUser = localStorage.getItem('user');
    
    // If we have a valid session already, don't override it
    if (existingSessionId && existingUser) {
      console.log('Existing session found, using it for persistence');
      // Just verify the session is valid, but don't replace it
      const verifySession = async () => {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${existingSessionId}`
            }
          });
          
          if (response.ok) {
            // Update user data but keep the same session
            const userData = await response.json();
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('Session verified and user data refreshed');
            
            // After verifying session, ensure we have protected accounts
            ensureProtectedAccounts();
          }
        } catch (error) {
          console.error('Failed to verify existing session:', error);
        }
      };
      
      verifySession();
      return; // Skip creating a new session
    }
    
    // For new sessions or development: Initialize the test session for OWNERS3
    const initTestSession = async () => {
      try {
        // Use the test session ID provided by the server
        const testSessionId = 'test-session-for-development';
        
        // Store in localStorage for persistence across app restarts
        localStorage.setItem('sessionId', testSessionId);
        
        // Get user data for this session
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${testSessionId}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('Test session initialized with OWNERS3 user:', userData);
          
          // After setting up session, ensure we have protected accounts
          ensureProtectedAccounts();
        }
      } catch (error) {
        console.error('Failed to initialize test session:', error);
      }
    };
    
    initTestSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        {showBottomNav && <BottomNavigation />}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
