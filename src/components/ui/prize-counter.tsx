import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PrizeCounterProps {
  amount: number;
  className?: string;
  showCurrency?: boolean;
  animateOnMount?: boolean;
}

export function PrizeCounter({ 
  amount, 
  className, 
  showCurrency = true, 
  animateOnMount = true 
}: PrizeCounterProps) {
  const [displayAmount, setDisplayAmount] = useState(animateOnMount ? 0 : amount);

  useEffect(() => {
    if (!animateOnMount) return;
    
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = amount / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= amount) {
        setDisplayAmount(amount);
        clearInterval(timer);
      } else {
        setDisplayAmount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [amount, animateOnMount]);

  const formatAmount = (value: number) => {
    if (showCurrency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value.toLocaleString();
  };

  return (
    <span 
      className={cn(
        "font-bold text-transparent bg-gradient-prize bg-clip-text animate-counter",
        className
      )}
    >
      {formatAmount(displayAmount)}
    </span>
  );
}