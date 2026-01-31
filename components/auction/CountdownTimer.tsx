'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  endTime: string;
  onEnd?: () => void;
}

const TimeBox = ({ value, label, isUrgent }: { value: number | string; label: string; isUrgent: boolean }) => (
  <div className={`relative overflow-hidden px-3 py-2 rounded-lg text-center min-w-[52px] transition-all duration-300 ${isUrgent
      ? 'bg-destructive/10 border border-destructive/30'
      : 'bg-muted/60 border border-border/50'
    }`}>
    <span className={`text-xl font-bold font-mono tabular-nums transition-colors ${isUrgent ? 'text-destructive' : 'text-foreground'
      }`}>
      {typeof value === 'number' ? String(value).padStart(2, '0') : value}
    </span>
    <span className="text-[10px] block text-muted-foreground uppercase tracking-wider mt-0.5 font-medium">
      {label}
    </span>
  </div>
);

export default function CountdownTimer({ endTime, onEnd }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEnded, setIsEnded] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

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

      setIsUrgent(diff < 3600000);

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
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive">
        <div className="w-2 h-2 rounded-full bg-destructive" />
        <span className="font-semibold text-sm tracking-wide">Ended</span>
      </div>
    );
  }

  return (
    <div className="flex gap-1.5">
      {timeLeft.days > 0 && <TimeBox value={timeLeft.days} label="days" isUrgent={isUrgent} />}
      <TimeBox value={timeLeft.hours} label="hrs" isUrgent={isUrgent} />
      <TimeBox value={timeLeft.minutes} label="min" isUrgent={isUrgent} />
      <TimeBox value={timeLeft.seconds} label="sec" isUrgent={isUrgent} />
    </div>
  );
}
