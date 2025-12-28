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
    return <span className="text-destructive font-semibold text-sm tracking-wide">Ended</span>;
  }

  const TimeBox = ({ value, label }: { value: number | string; label: string }) => (
    <div className="bg-muted/50 border border-border/50 px-3 py-2 rounded-md text-center min-w-[52px]">
      <span className="text-xl font-semibold text-foreground font-mono tabular-nums">
        {typeof value === 'number' ? String(value).padStart(2, '0') : value}
      </span>
      <span className="text-[10px] block text-muted-foreground uppercase tracking-wider mt-0.5">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex gap-2">
      {timeLeft.days > 0 && <TimeBox value={timeLeft.days} label="days" />}
      <TimeBox value={timeLeft.hours} label="hrs" />
      <TimeBox value={timeLeft.minutes} label="min" />
      <TimeBox value={timeLeft.seconds} label="sec" />
    </div>
  );
}

