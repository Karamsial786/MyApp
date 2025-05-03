import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';

// Define currency conversion rates
const CONVERSION_RATES = {
  PKR: 0.5,      // 1 CINC = 0.5 PKR
  USD: 0.001786, // 1 CINC = 0.001786 USD (calculated from PKR/USD rate)
  NGN: 2.846,    // 1 CINC = 2.846 NGN (calculated from USD/NGN rate)
  INR: 0.1536    // 1 CINC = 0.1536 INR (calculated from USD/INR rate)
};

type CurrencyCode = keyof typeof CONVERSION_RATES;

interface CurrencyConverterProps {
  cincAmount: number;
}

export function CurrencyConverter({ cincAmount }: CurrencyConverterProps) {
  // Get preferred currency from localStorage or default to PKR
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    return (savedCurrency as CurrencyCode) || 'PKR';
  });
  
  const [open, setOpen] = useState(false);
  
  // Update localStorage when currency changes
  useEffect(() => {
    localStorage.setItem('preferredCurrency', selectedCurrency);
  }, [selectedCurrency]);
  
  // Calculate converted amount based on selected currency
  // Using Math.floor to remove decimal places
  const convertedAmount = Math.floor(cincAmount * CONVERSION_RATES[selectedCurrency]).toString();
  
  // Format number with commas for better readability
  const formatNumber = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md font-medium hover:bg-blue-200 transition-colors"
            aria-expanded={open}
          >
            = {formatNumber(convertedAmount)} {selectedCurrency} <ChevronDown className="ml-2 h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-48">
          <Command>
            <CommandList>
              <CommandEmpty>No currency found.</CommandEmpty>
              <CommandGroup>
                {Object.keys(CONVERSION_RATES).map((currency) => (
                  <CommandItem
                    key={currency}
                    onSelect={() => {
                      setSelectedCurrency(currency as CurrencyCode);
                      setOpen(false);
                    }}
                    className={`flex justify-between ${currency === selectedCurrency ? 'bg-blue-50' : ''}`}
                  >
                    <span>{currency}</span>
                    {currency === selectedCurrency && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default CurrencyConverter;