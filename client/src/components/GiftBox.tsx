import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Gift, Unlock, Lock } from 'lucide-react';
import CincCoin from '@/components/CincCoin';
import { useToast } from '@/hooks/use-toast';
import gsap from 'gsap';

type GiftBoxProps = {
  onOpen: (reward: number) => void;
  isOpened: boolean;
  giftBoxReward: number | null;
  disabled?: boolean;
  nextAvailableTime?: Date;
  isVisible?: boolean; // Added to control visibility
  isFloating?: boolean; // Added to control floating behavior
};

const GiftBox: React.FC<GiftBoxProps> = ({
  onOpen,
  isOpened,
  giftBoxReward,
  disabled = false,
  nextAvailableTime = undefined,
  isVisible = true,
  isFloating = false
}) => {
  const [isShaking, setIsShaking] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const { toast } = useToast();
  
  // Refs for animation elements
  const boxRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const boxBodyRef = useRef<HTMLDivElement>(null);
  const coinsContainerRef = useRef<HTMLDivElement>(null);
  const floatingCoinsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Animation timeline
  const timeline = useRef<gsap.core.Timeline>();
  
  // Number of coins to animate
  const COIN_COUNT = 20; // Increased for more visual impact
  
  // Audio elements for sound effects
  const shakeSound = useRef<HTMLAudioElement | null>(null);
  const openSound = useRef<HTMLAudioElement | null>(null);
  const coinSound = useRef<HTMLAudioElement | null>(null);
  
  // Particle effects refs
  const sparkleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Initialize GSAP animation timeline and audio elements
  useEffect(() => {
    // Create a new timeline
    timeline.current = gsap.timeline({ paused: true });
    
    // Create audio elements (optional)
    try {
      shakeSound.current = new Audio('/sounds/box-shake.mp3');
      openSound.current = new Audio('/sounds/box-open.mp3');
      coinSound.current = new Audio('/sounds/coins.mp3');
    } catch (e) {
      console.log('Audio not supported or files not found');
    }
    
    // Initialize sparkle refs array
    if (sparkleRefs.current.length === 0) {
      sparkleRefs.current = Array(15).fill(null);
    }
    
    // Setup animations when refs are ready
    return () => {
      // Cleanup
      if (timeline.current) {
        timeline.current.kill();
      }
    };
  }, []);
  
  // Setup animation sequence when elements are available
  useEffect(() => {
    if (!boxRef.current || !lidRef.current || !coinsContainerRef.current) return;
    
    const tl = timeline.current;
    if (!tl) return;
    
    // Reset timeline
    tl.clear();
    
    // Stage 1: Initial slight glow
    tl.to(boxRef.current, {
      boxShadow: "0 0 15px rgba(138, 43, 226, 0.4)",
      duration: 0.5,
      ease: "power1.out"
    });
    
    // Stage 2: Box shake animation with increasing intensity
    tl.to(boxRef.current, { 
      x: 2, 
      rotation: 1,
      duration: 0.08, 
      repeat: 4, 
      yoyo: true,
      ease: "power2.inOut",
      onStart: () => {
        // Play shake sound if available
        if (shakeSound.current) {
          shakeSound.current.volume = 0.4;
          shakeSound.current.play().catch(() => {});
        }
      }
    });
    
    tl.to(boxRef.current, { 
      x: 4, 
      rotation: 2,
      duration: 0.07, 
      repeat: 5, 
      yoyo: true,
      ease: "power2.inOut"
    }, "+=0.1");
    
    tl.to(boxRef.current, { 
      x: 7, 
      rotation: 3,
      duration: 0.06, 
      repeat: 6, 
      yoyo: true,
      ease: "power2.inOut"
    }, "+=0.1");
    
    // Stage 3: Pre-open anticipation (box slightly rises)
    tl.to(boxRef.current, {
      y: -5,
      duration: 0.3,
      ease: "power2.out"
    }, "+=0.2");
    
    // Stage 4: Lid opening animation with 3D effect
    tl.to(lidRef.current, {
      y: -60,
      rotationX: -80,
      rotationY: 15,
      duration: 1,
      ease: "back.out(1.7)",
      onStart: () => {
        // Play open sound if available
        if (openSound.current) {
          openSound.current.volume = 0.5;
          openSound.current.play().catch(() => {});
        }
      }
    }, "+=0.1");
    
    // Stage 5: Enhanced glow effect radiating from box
    tl.to(boxRef.current, {
      boxShadow: "0 0 40px rgba(138, 43, 226, 0.8), 0 0 20px rgba(255, 223, 0, 0.5)",
      duration: 0.7
    }, "-=0.8");
    
    // Stage 6: Box body slight expansion for emphasis
    tl.to(boxBodyRef.current, {
      scale: 1.05,
      duration: 0.4,
      ease: "elastic.out(1, 0.5)"
    }, "-=0.7");
    
    // Stage 7: Prepare for coins appearance with anticipation
    tl.set(coinsContainerRef.current, {
      opacity: 0,
      scale: 0.3,
      y: 15,
      rotationX: 30
    });
    
    // Stage 8: Reveal coins container with magical 3D effect
    tl.to(coinsContainerRef.current, {
      opacity: 1,
      y: -20,
      rotationX: 0,
      scale: 1.1,
      duration: 0.9,
      ease: "back.out(1.7)",
      onStart: () => {
        // Play coin sound if available
        if (coinSound.current) {
          coinSound.current.volume = 0.6;
          coinSound.current.play().catch(() => {});
        }
      }
    }, "-=0.1");
    
    // Stage 9: Coins container settling
    tl.to(coinsContainerRef.current, {
      scale: 1,
      y: -15,
      duration: 0.4,
      ease: "power2.out"
    });
    
    // Stage 10: Animate sparkles around the gift (if available)
    sparkleRefs.current.forEach((sparkle, index) => {
      if (!sparkle) return;
      
      // Random initial position around gift
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 30;
      const delay = 0.8 + (index * 0.08);
      
      tl.set(sparkle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: 0,
        opacity: 0
      }, "-=0.1");
      
      tl.to(sparkle, {
        scale: 0.5 + Math.random() * 0.5,
        opacity: 0.7,
        duration: 0.4,
        delay: delay,
        ease: "power1.out"
      }, "-=0.3");
      
      tl.to(sparkle, {
        opacity: 0,
        scale: 0,
        duration: 0.7,
        delay: 0.3 + Math.random() * 0.6,
        ease: "power2.in"
      }, `-=${1 - index * 0.05}`);
    });
    
  }, [boxRef.current, lidRef.current, boxBodyRef.current, coinsContainerRef.current]);
  
  // Animate individual floating coins
  const animateCoins = () => {
    // Reset animation refs array if needed
    if (floatingCoinsRef.current.length < COIN_COUNT) {
      floatingCoinsRef.current = Array(COIN_COUNT).fill(null);
    }
    
    // Animate each coin with a staggered effect
    floatingCoinsRef.current.forEach((coin, index) => {
      if (!coin) return;
      
      // Calculate random paths for more natural movement
      const xOffset = (Math.random() * 300) - 150; // -150 to 150px
      const yOffset = -100 - (Math.random() * 200); // -100 to -300px
      const delay = 0.1 + (index * 0.08); // Stagger coins
      const duration = 1.2 + (Math.random() * 0.8); // Random duration
      
      // Initial position and appearance
      gsap.set(coin, {
        y: 0,
        x: 0,
        scale: 0.5,
        opacity: 0,
        rotation: Math.random() * 180 - 90
      });
      
      // First animation: Coin appears and floats upward
      gsap.to(coin, {
        opacity: 1,
        scale: 1.2,
        duration: 0.4,
        delay: delay,
        ease: "power1.out",
        onComplete: () => {
          // Second animation: Coin floats in a curve
          gsap.to(coin, {
            y: yOffset,
            x: xOffset,
            rotation: Math.random() * 360 - 180,
            duration: duration,
            ease: "power1.out",
            onComplete: () => {
              // Final animation: Coin flies to the CINC balance
              gsap.to(coin, {
                y: -window.innerHeight / 4,
                x: window.innerWidth / 4,
                scale: 0.1,
                opacity: 0,
                duration: 1.2,
                ease: "power2.in",
                onComplete: () => {
                  // Pulse effect on balance counter
                  const balanceEl = document.querySelector('.cinc-balance');
                  if (balanceEl) {
                    gsap.to(balanceEl, {
                      scale: 1.2,
                      duration: 0.3,
                      repeat: 1,
                      yoyo: true,
                      ease: "power2.inOut"
                    });
                  }
                }
              });
            }
          });
        }
      });
    });
  };

  // Handle countdown timer if nextAvailableTime is provided
  useEffect(() => {
    if (!nextAvailableTime) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const timeDiff = nextAvailableTime.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setTimeRemaining('');
        return;
      }
      
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [nextAvailableTime]);

  // Function to handle opening the gift box with enhanced animations
  const handleOpen = () => {
    if (disabled || isOpened || isOpening) return;
    
    // Start the opening sequence
    setIsOpening(true);
    
    // Play the GSAP animation timeline
    if (timeline.current) {
      timeline.current.play();
    }
    
    // After timeline animation starts, show coins and calculate reward
    setTimeout(() => {
      setShowCoins(true);
      
      // Use server-provided reward if available, otherwise use a placeholder value of 5
      // The actual reward value will come from the server response via onOpen callback
      const rewardAmount = 5; // Placeholder only, server value will be used
      
      // Notify parent component to claim the reward from server
      onOpen(rewardAmount);
      
      // Show initial toast notification (reward amount will be updated by parent component)
      toast({
        title: "Daily Bonus Unlocked!",
        description: "Retrieving your daily CINC bonus...",
      });
      
      // Start coin animations after a short delay
      setTimeout(() => {
        animateCoins();
      }, 300);
      
      // Auto-close after 3 seconds
      if (isFloating) {
        setTimeout(() => {
          // If we're in a floating mode, we'll notify the parent to close the box
          if (boxRef.current) {
            gsap.to(boxRef.current.parentElement?.parentElement?.parentElement as HTMLElement, {
              opacity: 0,
              y: 20,
              duration: 0.5,
              ease: "power2.in",
              onComplete: () => {
                // The parent component should handle any cleanup or state reset
                document.dispatchEvent(new Event('giftBoxAutoClose'));
              }
            });
          }
        }, 3000);
      }
    }, 1800); // Wait for box opening animation to complete
  };

  // State to control the shake animation
  const [isShakeTriggered, setIsShakeTriggered] = useState(false);
  
  // Ref for the container element (for fade out animation)
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Function to trigger shake animation
  const triggerShake = () => {
    if (isFloating && boxRef.current) {
      setIsShakeTriggered(true);
      
      // Shake animation with GSAP
      gsap.to(boxRef.current, {
        x: 10, 
        rotation: 5,
        duration: 0.1, 
        repeat: 5, 
        yoyo: true,
        ease: "power2.inOut",
        onComplete: () => {
          setIsShakeTriggered(false);
          // Resume floating animation after shake
          startFloatingAnimation();
        }
      });
    }
  };
  
  // Function to handle close with fade out animation
  const handleClose = () => {
    if (containerRef.current) {
      // Fade out animation
      gsap.to(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          // Trigger the custom event for parent component to handle
          document.dispatchEvent(new Event('giftBoxAutoClose'));
        }
      });
    }
  };
  
  // Function to start the floating animation
  const startFloatingAnimation = () => {
    if (isFloating && boxRef.current && !isShakeTriggered) {
      // Kill any existing animations on this element
      gsap.killTweensOf(boxRef.current);
      
      // Create a floating animation that loops infinitely
      gsap.to(boxRef.current, {
        y: "-=15", // Float upward
        duration: 1.5,
        ease: "power1.inOut",
        repeat: -1, // Infinite loop
        yoyo: true, // Reverse animation
      });
      
      // Add subtle rotation for more visual interest
      gsap.to(boxRef.current, {
        rotation: 3,
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.5
      });
    }
  };
  
  // Set up animations and auto-close timer when component mounts
  useEffect(() => {
    // Start floating animation
    startFloatingAnimation();
    
    // Setup auto-close timer
    let autoCloseTimer: NodeJS.Timeout | null = null;
    
    if (isFloating) {
      // Auto-close after 5 seconds with fade-out effect
      autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 5000);
      
      // Set up event listener for shake trigger from parent component
      const shakeEventListener = () => {
        triggerShake();
      };
      
      document.addEventListener('giftBoxShake', shakeEventListener);
      
      return () => {
        // Clean up animations when component unmounts or changes
        if (boxRef.current) {
          gsap.killTweensOf(boxRef.current);
        }
        
        // Clear auto-close timer
        if (autoCloseTimer) {
          clearTimeout(autoCloseTimer);
        }
        
        // Remove event listener
        document.removeEventListener('giftBoxShake', shakeEventListener);
      };
    }
    
    return () => {
      // Clean up animations when component unmounts or changes
      if (boxRef.current) {
        gsap.killTweensOf(boxRef.current);
      }
      
      // Clear auto-close timer
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [isFloating, isShakeTriggered]);

  return (
    <div className={`w-full flex flex-col items-center ${!isVisible ? 'hidden' : ''}`} ref={containerRef}>
      <div className={`${isFloating ? 'w-auto h-auto' : 'w-full max-w-xs mx-auto'}`}>
        {/* Gift Box Container */}
        <div className={`relative flex flex-col items-center justify-center p-4 ${isFloating ? 'scale-110' : ''}`}>
          {/* Close button for floating box */}
          {isFloating && (
            <button 
              onClick={handleClose}
              className="absolute -top-4 -right-4 bg-gray-800 rounded-full p-1 shadow-lg hover:bg-gray-700 transition-colors z-50"
              aria-label="Close gift box"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {/* Gift box or opened state */}
          <div className="perspective-1000 w-full h-full flex flex-col items-center justify-center">
            {/* 3D Gift Box */}
            <div 
              ref={boxRef}
              className={`w-40 h-40 relative transform-style-3d ${!isOpening && !isFloating ? (isShaking ? 'animate-shake' : 'animate-float') : ''} ${isFloating ? 'cursor-pointer shadow-[0_10px_35px_rgba(138,43,226,0.4)]' : ''}`}
              onClick={isFloating ? handleOpen : undefined}
            >
              <div className="w-full h-full rounded-lg overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.3)] transform-style-3d">
                {/* Gift box lid */}
                <div 
                  ref={lidRef}
                  className="absolute top-0 w-full h-1/3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-t-lg transform-origin-bottom"
                >
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-pink-800"></div>
                  {/* Ribbon */}
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10">
                    <div className="absolute w-full h-2 bg-yellow-400 rounded-full"></div>
                    <div className="absolute w-2 h-full bg-yellow-400 rounded-full"></div>
                  </div>
                </div>
                
                {/* Gift box body */}
                <div 
                  ref={boxBodyRef}
                  className="h-2/3 mt-[33%] bg-gradient-to-r from-purple-500 to-indigo-600 rounded-b-lg relative transform-style-3d"
                >
                  {/* Box interior glow */}
                  <div className={`absolute inset-0 rounded-b-lg bg-gradient-to-b from-transparent to-purple-300 opacity-0 transition-opacity duration-500 ${isOpening ? 'opacity-60' : ''}`}></div>
                  
                  {/* Enhanced 3D interior shadow */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 transition-opacity duration-500 ${isOpening ? 'opacity-20' : ''}`}></div>
                  
                  {/* Vertical ribbon */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-yellow-400 transform -translate-x-1/2"></div>
                </div>
              </div>
              
              {/* Sparkle particles around box - dynamically rendered */}
              {Array.from({ length: 15 }).map((_, index) => (
                <div 
                  key={`sparkle-${index}`}
                  ref={el => sparkleRefs.current[index] = el}
                  className="absolute pointer-events-none z-30"
                  style={{ 
                    opacity: 0, // Will be controlled by GSAP
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {index % 3 === 0 ? (
                    <Sparkles className="text-yellow-400" style={{ width: '14px', height: '14px' }} />
                  ) : index % 3 === 1 ? (
                    <div className="w-2 h-2 rounded-full bg-purple-300 sparkle-glow"></div>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-400 sparkle-glow"></div>
                  )}
                </div>
              ))}
              
              {/* Coins container with enhanced 3D effects */}
              <div 
                ref={coinsContainerRef} 
                className={`absolute top-1/3 left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/3 ${!showCoins ? 'opacity-0' : ''} transform-style-3d`}
              >
                {showCoins && (
                  <div className="relative w-full h-full flex flex-col items-center transform-style-3d">
                    {/* Magical glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-purple-500 opacity-30 blur-2xl transform scale-125 animate-pulse-slow"></div>
                    
                    {/* Enhanced sparkle effect */}
                    <Sparkles className="h-16 w-16 text-yellow-400 animate-pulse-fast mb-4 transform" style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.7))' }} />
                    
                    {/* 3D reward card with depth */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-lg text-white flex items-center justify-center mt-2 shadow-glow transform hover:rotate-y-3d hover:scale-105 transition-transform duration-300">
                      <div className="absolute inset-0 rounded-lg bg-white opacity-10 blur-sm"></div>
                      <CincCoin size="md" className="mr-3 border-2 border-yellow-300 animate-pulse-coin" variant="premium" />
                      <p className="text-2xl font-bold text-shadow-lg">
                        {giftBoxReward !== null ? giftBoxReward : 10} CINC
                      </p>
                    </div>
                    
                    {/* Floating coins with improved effects */}
                    {Array.from({ length: COIN_COUNT }).map((_, index) => (
                      <div 
                        key={index}
                        ref={el => floatingCoinsRef.current[index] = el}
                        className="absolute top-1/2 left-1/2 coin-glow"
                        style={{ 
                          zIndex: 20,
                          opacity: 0, // Initially hidden, will be animated with GSAP
                        }}
                      >
                        <CincCoin 
                          size={index % 3 === 0 ? "xs" : (index % 3 === 1 ? "sm" : "md")} 
                          variant="premium" 
                          className={index % 2 === 0 ? "border-yellow-300" : ""}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Only show button and status messages when not in floating mode */}
        {!isFloating && (
          <>
            {/* Open Button */}
            <Button
              className={`w-full mt-4 ${isOpened || isOpening ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'}`}
              disabled={disabled || isOpened || isOpening || !!timeRemaining}
              onClick={handleOpen}
            >
              <span className="flex items-center">
                {isOpened || isOpening ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    {isOpening ? 'Opening...' : 'Bonus Claimed!'}
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    {timeRemaining ? 'Available in ' + timeRemaining : 'Open Daily Bonus Box'}
                  </>
                )}
              </span>
            </Button>
            
            {/* Status message */}
            {disabled && (
              <p className="text-xs text-center mt-2 text-gray-500 flex items-center justify-center">
                <Lock className="h-3 w-3 mr-1" />
                Earn more referrals to unlock daily bonuses
              </p>
            )}
            
            {!disabled && timeRemaining && (
              <p className="text-xs text-center mt-2 text-indigo-500">
                Your next bonus will be available in {timeRemaining}
              </p>
            )}
            
            {/* Display "Bonus Box Available" text when box is available */}
            {!disabled && !timeRemaining && !isOpened && !isOpening && (
              <p className="text-sm text-center mt-2 font-medium text-indigo-600">
                Bonus Box Available
              </p>
            )}
          </>
        )}
      </div>
      
      {/* CSS Animations and 3D Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* 3D Transform Styles */
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .transform-origin-bottom {
          transform-origin: bottom center;
        }
        
        /* Rotation Helpers */
        .hover-rotate-y-3d {
          transition: transform 0.3s ease;
        }
        
        .hover-rotate-y-3d:hover {
          transform: perspective(1000px) rotateY(10deg);
        }
        
        /* Animation Keyframes */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-2deg); }
          20%, 40%, 60%, 80% { transform: translateX(5px) rotate(2deg); }
        }
        
        .animate-shake {
          animation: shake 0.8s ease-in-out;
        }
        
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes pulse-fast {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.9; filter: brightness(1.3); }
        }
        
        .animate-pulse-fast {
          animation: pulse-fast 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.6s ease-out forwards;
        }
        
        /* Floating animations for coins */
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-15px, -25px) rotate(-5deg); }
          50% { transform: translate(5px, -35px) rotate(5deg); }
          75% { transform: translate(15px, -25px) rotate(10deg); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(15px, -20px) rotate(5deg); }
          50% { transform: translate(5px, -30px) rotate(-5deg); }
          75% { transform: translate(-10px, -20px) rotate(-10deg); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-10px, -15px) rotate(-10deg); }
          50% { transform: translate(-5px, -25px) rotate(0deg); }
          75% { transform: translate(10px, -15px) rotate(5deg); }
        }
        
        .animate-float1 {
          animation: float1 3s ease-in-out infinite;
        }
        
        .animate-float2 {
          animation: float2 3.5s ease-in-out infinite;
        }
        
        .animate-float3 {
          animation: float3 4s ease-in-out infinite;
        }
        
        /* Glow Effects */
        .shadow-glow {
          box-shadow: 0 0 15px 2px rgba(124, 58, 237, 0.5);
        }
        
        .coin-glow {
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
        }
        
        .sparkle-glow {
          filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.9));
        }
        
        /* Text Shadow */
        .text-shadow-lg {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
        }
        
        /* Additional Animation for Coins */
        @keyframes pulse-coin {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.1); filter: brightness(1.2); }
        }
        
        .animate-pulse-coin {
          animation: pulse-coin 2s ease-in-out infinite;
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          .transform-style-3d {
            will-change: transform;
          }
        }
      `}} />
    </div>
  );
};

export default GiftBox;