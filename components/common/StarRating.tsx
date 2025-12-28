'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onChange?: (rating: number) => void;
    className?: string;
}

export default function StarRating({
    rating,
    maxRating = 5,
    size = 'md',
    interactive = false,
    onChange,
    className,
}: StarRatingProps) {
    const sizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    const gapClasses = {
        sm: 'gap-0.5',
        md: 'gap-1',
        lg: 'gap-1.5',
    };

    function handleClick(index: number) {
        if (interactive && onChange) {
            onChange(index + 1);
        }
    }

    return (
        <div className={cn('flex items-center', gapClasses[size], className)}>
            {Array.from({ length: maxRating }).map((_, index) => {
                const isFilled = index < rating;
                const isHalf = !isFilled && index < rating + 0.5 && rating % 1 !== 0;

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={!interactive}
                        onClick={() => handleClick(index)}
                        className={cn(
                            'transition-colors',
                            interactive && 'cursor-pointer hover:scale-110',
                            !interactive && 'cursor-default'
                        )}
                    >
                        <Star
                            className={cn(
                                sizeClasses[size],
                                isFilled
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : isHalf
                                        ? 'text-yellow-500 fill-yellow-500/50'
                                        : 'text-muted-foreground/30'
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
}
