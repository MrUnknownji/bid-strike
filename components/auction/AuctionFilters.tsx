'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AuctionFiltersProps {
    onFiltersChange: (filters: Filters) => void;
    activeFilters: Filters;
}

export interface Filters {
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    sort?: string;
}

const CONDITIONS = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
];

const SORT_OPTIONS = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: 'currentPrice', label: 'Price: Low to High' },
    { value: '-currentPrice', label: 'Price: High to Low' },
    { value: '-totalBids', label: 'Most Bids' },
    { value: 'endTime', label: 'Ending Soon' },
];

export default function AuctionFilters({ onFiltersChange, activeFilters }: AuctionFiltersProps) {
    const [open, setOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState<Filters>(activeFilters);

    function handleApply() {
        onFiltersChange(localFilters);
        setOpen(false);
    }

    function handleClear() {
        const cleared = { minPrice: '', maxPrice: '', condition: '', sort: '-createdAt' };
        setLocalFilters(cleared);
        onFiltersChange(cleared);
        setOpen(false);
    }

    const activeCount = [
        activeFilters.minPrice,
        activeFilters.maxPrice,
        activeFilters.condition,
        activeFilters.sort && activeFilters.sort !== '-createdAt',
    ].filter(Boolean).length;

    return (
        <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {activeCount > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {activeCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Sort By</Label>
                            <Select
                                value={localFilters.sort || '-createdAt'}
                                onValueChange={(v) => setLocalFilters({ ...localFilters, sort: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SORT_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Price Range</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={localFilters.minPrice || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
                                    className="w-full"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={localFilters.maxPrice || ''}
                                    onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Condition</Label>
                            <Select
                                value={localFilters.condition || 'all'}
                                onValueChange={(v) => setLocalFilters({ ...localFilters, condition: v === 'all' ? '' : v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Any condition" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any Condition</SelectItem>
                                    {CONDITIONS.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-between pt-2">
                            <Button variant="ghost" size="sm" onClick={handleClear}>
                                <X className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                            <Button size="sm" onClick={handleApply}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {activeCount > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                    {activeFilters.minPrice && (
                        <Badge variant="outline" className="text-xs">Min: ${activeFilters.minPrice}</Badge>
                    )}
                    {activeFilters.maxPrice && (
                        <Badge variant="outline" className="text-xs">Max: ${activeFilters.maxPrice}</Badge>
                    )}
                    {activeFilters.condition && (
                        <Badge variant="outline" className="text-xs capitalize">{activeFilters.condition}</Badge>
                    )}
                </div>
            )}
        </div>
    );
}
