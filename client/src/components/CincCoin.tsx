import React from 'react';

interface CincCoinProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'premium' | 'animated' | 'floating';
  value?: number | string;
  showValue?: boolean;
}

/**
 * Enhanced CINC Coin icon component
 * Used consistently throughout the app instead of $ symbol
 * Features multiple sizes, variants and can display a value
 */
export function CincCoin({ 
  className = "", 
  size = "md",
  variant = "default",
  value,
  showValue = false 
}: CincCoinProps) {
  // Size mapping for the coin
  const sizeClass = {
    xs: "h-3 w-3 text-[10px]",
    sm: "h-4 w-4 text-xs",
    md: "h-5 w-5 text-sm",
    lg: "h-6 w-6 text-base",
    xl: "h-8 w-8 text-lg",
    "2xl": "h-10 w-10 text-xl"
  }[size];
  
  // Font size for value display
  const valueSizeClass = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl"
  }[size];
  
  // Variant styling
  const variantClass = {
    default: "bg-blue-500 text-white",
    premium: "bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-blue-300 shadow-sm",
    animated: "bg-blue-500 text-white animate-pulse",
    floating: "bg-blue-500 text-white animate-float"
  }[variant];
  
  // We're using the global animation classes now - no need for inline styles
  
  // Format number value with commas if needed
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  
  if (showValue && value !== undefined) {
    return (
      <div className={`flex items-center ${className}`}>
        <span 
          className={`inline-flex items-center justify-center rounded-full font-bold ${sizeClass} ${variantClass} mr-1`}
        >
          C
        </span>
        <span className={`font-medium ${valueSizeClass}`}>{formattedValue}</span>
      </div>
    );
  }
  
  return (
    <span 
      className={`inline-flex items-center justify-center rounded-full font-bold ${sizeClass} ${variantClass} ${className}`}
    >
      C
    </span>
  );
}

/**
 * Animation keyframes are added globally in the app's CSS file
 * We use the following animation classes:
 * - animate-float: Gentle floating motion for coins
 * - animate-pulse: Pulsating glow effect
 * - animate-bounce-in: Entry animation for rewards
 * - animate-spin-slow: Slow spin effect
 * - animate-shake: Shaking effect for bonus boxes
 */

export default CincCoin;