'use client';

import { cn } from '@/lib/utils';

export type FilterOption = {
    value: string;
    label: string;
    count?: number;
};

interface AuctionFiltersProps {
    options: FilterOption[];
    selected: string;
    onSelect: (value: string) => void;
    className?: string;
}

export default function AuctionFilters({
    options,
    selected,
    onSelect,
    className,
}: AuctionFiltersProps) {
    return (
        <div className={cn('flex items-center gap-2 flex-wrap', className)}>
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onSelect(option.value)}
                    className={cn(
                        'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                        selected === option.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                >
                    {option.label}
                    {option.count !== undefined && (
                        <span
                            className={cn(
                                'ml-2 px-1.5 py-0.5 text-xs rounded',
                                selected === option.value
                                    ? 'bg-primary-foreground/20'
                                    : 'bg-muted-foreground/20'
                            )}
                        >
                            {option.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
