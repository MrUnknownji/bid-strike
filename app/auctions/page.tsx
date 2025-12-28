'use client';

import { useEffect, useState } from 'react';
import AuctionGrid from '@/components/auction/AuctionGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Auction {
    _id: string;
    title: string;
    images: string[];
    currentPrice: number;
    endTime: string;
    totalBids: number;
    status: string;
    seller: { username: string };
    category?: { name: string; slug: string };
}

interface Category {
    _id: string;
    name: string;
    slug: string;
    subcategories: { _id: string; name: string; slug: string }[];
}

export default function AuctionsPage() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('accessToken'));
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(data.categories || []))
            .catch(() => { });
    }, []);

    useEffect(() => {
        const fetchAuctions = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (search) params.append('search', search);
                if (selectedSubcategory) {
                    params.append('subcategory', selectedSubcategory);
                } else if (selectedCategory) {
                    params.append('category', selectedCategory);
                }

                const res = await fetch(`/api/auctions?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    setAuctions(data.auctions);
                }
            } catch (error) {
                console.error('Failed to fetch auctions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(fetchAuctions, 300);
        return () => clearTimeout(debounce);
    }, [search, selectedCategory, selectedSubcategory]);

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
    };

    const activeCategory = categories.find(c => c._id === selectedCategory);
    const hasFilters = selectedCategory || selectedSubcategory || search;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold">Browse Auctions</h1>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search auctions, categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-full sm:w-72"
                            />
                        </div>
                        {isLoggedIn && (
                            <Link href="/auctions/create">
                                <Button className="whitespace-nowrap">New Auction</Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => handleCategoryClick(cat._id)}
                            className={cn(
                                'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                selectedCategory === cat._id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80'
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Subcategories */}
                {activeCategory && activeCategory.subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {activeCategory.subcategories.map((sub) => (
                            <button
                                key={sub._id}
                                onClick={() => handleSubcategoryClick(sub._id)}
                                className={cn(
                                    'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                                    selectedSubcategory === sub._id
                                        ? 'bg-primary/80 text-primary-foreground'
                                        : 'bg-muted/60 hover:bg-muted'
                                )}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Active Filters */}
                {hasFilters && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">Filters:</span>
                        {selectedCategory && activeCategory && (
                            <Badge variant="secondary" className="gap-1">
                                {activeCategory.name}
                                {selectedSubcategory && (
                                    <> / {activeCategory.subcategories.find(s => s._id === selectedSubcategory)?.name}</>
                                )}
                            </Badge>
                        )}
                        {search && (
                            <Badge variant="secondary" className="gap-1">
                                "{search}"
                            </Badge>
                        )}
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 gap-1 text-xs">
                            <X className="w-3 h-3" /> Clear
                        </Button>
                    </div>
                )}
            </div>

            <AuctionGrid auctions={auctions} isLoading={isLoading} />
        </div>
    );
}
