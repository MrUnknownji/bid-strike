'use client';

import { useState } from 'react';
import AuctionGrid from '@/components/auction/AuctionGrid';
import AuctionFilters, { Filters } from '@/components/auction/AuctionFilters';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuctions } from '@/hooks/api/useAuctions';
import { useCategories } from '@/hooks/api/useCategories';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';

interface Category {
    _id: string;
    name: string;
    slug: string;
    subcategories: { _id: string; name: string; slug: string }[];
}

export default function AuctionsPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [filters, setFilters] = useState<Filters>({});

    const debouncedSearch = useDebounce(search, 300);

    const { data: categoriesData } = useCategories();
    const categories: Category[] = categoriesData?.categories || [];

    const { data: auctionsData, isLoading } = useAuctions({
        search: debouncedSearch,
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        condition: filters.condition,
        sort: filters.sort,
    });

    const auctions = auctionsData?.auctions || [];

    const handleCategoryClick = (categoryId: string) => {
        if (selectedCategory === categoryId) {
            setSelectedCategory(null);
            setSelectedSubcategory(null);
        } else {
            setSelectedCategory(categoryId);
            setSelectedSubcategory(null);
        }
    };

    const handleSubcategoryClick = (subcategoryId: string) => {
        if (selectedSubcategory === subcategoryId) {
            setSelectedSubcategory(null);
        } else {
            setSelectedSubcategory(subcategoryId);
        }
    };

    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setSearch('');
        setFilters({});
    };

    const activeCategory = categories.find(c => c._id === selectedCategory);
    const hasFilters = selectedCategory || selectedSubcategory || search || filters.minPrice || filters.maxPrice || filters.condition;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col gap-5 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-up">
                    <h1 className="text-2xl font-bold tracking-tight">Browse Auctions</h1>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search auctions..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-full sm:w-64 h-9"
                            />
                        </div>
                        <AuctionFilters activeFilters={filters} onFiltersChange={setFilters} />
                        {user && (
                            <Link href="/auctions/create">
                                <Button size="sm">New Auction</Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => handleCategoryClick(cat._id)}
                            className={cn(
                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                                selectedCategory === cat._id
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {activeCategory && activeCategory.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {activeCategory.subcategories.map((sub) => (
                            <button
                                key={sub._id}
                                onClick={() => handleSubcategoryClick(sub._id)}
                                className={cn(
                                    'px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                                    selectedSubcategory === sub._id
                                        ? 'bg-primary/80 text-primary-foreground border-primary/80'
                                        : 'bg-transparent border-border/70 text-muted-foreground hover:text-foreground hover:border-foreground/30'
                                )}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}

                {hasFilters && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Active:</span>
                        {selectedCategory && activeCategory && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                                {activeCategory.name}
                                {selectedSubcategory && (
                                    <> / {activeCategory.subcategories.find(s => s._id === selectedSubcategory)?.name}</>
                                )}
                            </Badge>
                        )}
                        {search && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                                "{search}"
                            </Badge>
                        )}
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 gap-1 text-xs px-2">
                            <X className="w-3 h-3" /> Clear All
                        </Button>
                    </div>
                )}
            </div>

            <AuctionGrid auctions={auctions} isLoading={isLoading} />
        </div>
    );
}
