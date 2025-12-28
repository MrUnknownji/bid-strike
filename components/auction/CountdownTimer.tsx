'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  endTime: string;
  onEnd?: () => void;
}

export default function CountdownTimer({ endTime, onEnd }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setIsEnded(true);
        onEnd?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  if (isEnded) {
    return <span className="text-destructive font-bold">Ended</span>;
  }

  return (
    <div className="flex gap-2 text-center">
      {timeLeft.days > 0 && (
        <div className="bg-muted px-3 py-2 rounded">
          <span className="text-xl font-bold text-foreground">{timeLeft.days}</span>
          <span className="text-xs block text-muted-foreground">days</span>
        </div>
      )}
      <div className="bg-muted px-3 py-2 rounded">
        <span className="text-xl font-bold text-foreground">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-xs block text-muted-foreground">hrs</span>
      </div>
      <div className="bg-muted px-3 py-2 rounded">
        <span className="text-xl font-bold text-foreground">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-xs block text-muted-foreground">min</span>
      </div>
      <div className="bg-muted px-3 py-2 rounded">
        <span className="text-xl font-bold text-foreground">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-xs block text-muted-foreground">sec</span>
      </div>
    </div>
  );
}
