'use client';

import { useState, useCallback, useEffect, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import ImageUploader from '@/components/common/ImageUploader';
import ImagePreview, { PreviewImage } from '@/components/common/ImagePreview';
import SuggestionDialog from '@/components/common/SuggestionDialog';
import { uploadMultipleToCloudinary } from '@/lib/utils/cloudinary';
import { ImageIcon, AlertCircle, Calendar, Clock, DollarSign, Tag, Loader2 } from 'lucide-react';

const CONDITIONS = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

// eslint-disable-next-line react/display-name
const MemoizedImageUploader = memo(({ onImagesSelect }: { onImagesSelect: (files: File[]) => void }) => (
    <ImageUploader onImagesSelect={onImagesSelect} maxFiles={10} />
));

// eslint-disable-next-line react/display-name
const MemoizedImagePreview = memo(({ images, thumbnailId, onThumbnailChange, onRemove }: any) => (
    <ImagePreview
        images={images}
        thumbnailId={thumbnailId}
        onThumbnailChange={onThumbnailChange}
        onRemove={onRemove}
    />
));

// eslint-disable-next-line react/display-name
const DateTimeRow = memo(({
    label,
    prefix,
    values,
    onDateChange,
    years
}: {
    label: string;
    prefix: 'start' | 'end';
    values: any;
    onDateChange: (field: string, value: string) => void;
    years: string[];
}) => (
    <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium w-14 shrink-0">{label}</span>
        <Select value={values[`${prefix}Month`]} onValueChange={(v) => onDateChange(`${prefix}Month`, v)}>
            <SelectTrigger className="w-[85px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={(i + 1).toString()}>{m}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Select value={values[`${prefix}Day`]} onValueChange={(v) => onDateChange(`${prefix}Day`, v)}>
            <SelectTrigger className="w-[70px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Select value={values[`${prefix}Year`]} onValueChange={(v) => onDateChange(`${prefix}Year`, v)}>
            <SelectTrigger className="w-[100px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <span className="text-muted-foreground w-4 text-center">at</span>
        <Select value={values[`${prefix}Hour`]} onValueChange={(v) => onDateChange(`${prefix}Hour`, v)}>
            <SelectTrigger className="w-[70px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {HOURS.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        <span className="text-muted-foreground">:</span>
        <Select value={values[`${prefix}Minute`]} onValueChange={(v) => onDateChange(`${prefix}Minute`, v)}>
            <SelectTrigger className="w-[70px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {MINUTES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
));

// eslint-disable-next-line react/display-name
const CategorySelects = memo(({ categories, selectedCategory, selectedSubcategory, onCategoryChange, onSubcategoryChange }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
            <Label className="text-sm">Category</Label>
            <Select
                value={selectedCategory}
                onValueChange={onCategoryChange}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                    {categories.length > 0 ? (
                        categories.map((cat: any) => (
                            <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                        ))
                    ) : (
                        <SelectItem value="empty_categories">No categories found</SelectItem>
                    )}
                </SelectContent>
            </Select>
        </div>
        {selectedCategory && selectedCategory !== 'empty_categories' && categories.find((c: any) => c._id === selectedCategory)?.subcategories.length ? (
            <div className="space-y-1">
                <Label className="text-sm">Subcategory</Label>
                <Select
                    value={selectedSubcategory}
                    onValueChange={onSubcategoryChange}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                        {categories.find((c: any) => c._id === selectedCategory)?.subcategories.map((sub: any) => (
                            <SelectItem key={sub._id} value={sub._id}>{sub.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        ) : null}
        <div className="col-span-1 md:col-span-2">
            <SuggestionDialog />
        </div>
    </div>
));

interface Category {
    _id: string;
    name: string;
    subcategories: Category[];
}

export default function CreateAuctionPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [error, setError] = useState('');
    const [images, setImages] = useState<PreviewImage[]>([]);
    const [thumbnailId, setThumbnailId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

    const now = new Date();
    const currentYear = now.getFullYear();
    const years = useMemo(() => Array.from({ length: 6 }, (_, i) => (currentYear + i).toString()), [currentYear]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [condition, setCondition] = useState('new');
    const [startingPrice, setStartingPrice] = useState('');
    const [bidIncrement, setBidIncrement] = useState('1');

    const [schedule, setSchedule] = useState({
        startMonth: (now.getMonth() + 1).toString(),
        startDay: now.getDate().toString(),
        startYear: now.getFullYear().toString(),
        startHour: now.getHours().toString().padStart(2, '0'),
        startMinute: '00',
        endMonth: (now.getMonth() + 1).toString(),
        endDay: (now.getDate() + 7).toString(),
        endYear: now.getFullYear().toString(),
        endHour: now.getHours().toString().padStart(2, '0'),
        endMinute: '00',
    });

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if (data.categories && Array.isArray(data.categories)) {
                    setCategories(data.categories);
                } else if (Array.isArray(data)) {
                    setCategories(data);
                }
            })
            .catch(() => { });
    }, []);

    const handleImagesSelect = useCallback((files: File[]) => {
        const newImages: PreviewImage[] = files.map((file) => ({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            url: URL.createObjectURL(file),
        }));

        setImages((prev) => {
            const updated = [...prev, ...newImages];
            if (!thumbnailId && updated.length > 0) {
                setThumbnailId(updated[0].id);
            }
            return updated;
        });
    }, [thumbnailId]);

    const handleRemoveImage = useCallback((id: string) => {
        setImages((prev) => {
            const updated = prev.filter((img) => img.id !== id);
            if (thumbnailId === id && updated.length > 0) {
                setThumbnailId(updated[0].id);
            } else if (updated.length === 0) {
                setThumbnailId(null);
            }
            return updated;
        });
    }, [thumbnailId]);

    const buildDateTime = (year: string, month: string, day: string, hour: string, minute: string) => {
        const m = month.padStart(2, '0');
        const d = day.padStart(2, '0');
        const h = hour.padStart(2, '0');
        const min = minute.padStart(2, '0');
        return `${year}-${m}-${d}T${h}:${min}:00`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (images.length === 0) {
            setError('Please upload at least one image');
            return;
        }

        if (!selectedCategory || selectedCategory === 'empty_categories') {
            setError('Please select a category');
            return;
        }

        const selectedCatObj = categories.find(c => c._id === selectedCategory);
        if (selectedCatObj && selectedCatObj.subcategories.length > 0 && !selectedSubcategory) {
            setError('Please select a subcategory');
            return;
        }

        const startTime = new Date(
            parseInt(schedule.startYear),
            parseInt(schedule.startMonth) - 1,
            parseInt(schedule.startDay),
            parseInt(schedule.startHour),
            parseInt(schedule.startMinute)
        );

        const endTime = new Date(
            parseInt(schedule.endYear),
            parseInt(schedule.endMonth) - 1,
            parseInt(schedule.endDay),
            parseInt(schedule.endHour),
            parseInt(schedule.endMinute)
        );

        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        setIsLoading(true);
        setUploadProgress('Uploading images...');

        try {
            const filesToUpload = images.filter(img => img.file).map(img => img.file as File);
            let imageUrls: string[] = [];

            if (filesToUpload.length > 0) {
                const uploadResults = await uploadMultipleToCloudinary(
                    filesToUpload,
                    (completed, total) => setUploadProgress(`Uploading ${completed}/${total} images...`)
                );
                imageUrls = uploadResults.map(r => r.url);
            }

            setUploadProgress('Creating auction...');
            const thumbnailIndex = images.findIndex((img) => img.id === thumbnailId);

            const res = await fetch('/api/auctions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    condition,
                    category: selectedSubcategory || selectedCategory || undefined,
                    startingPrice: parseFloat(startingPrice),
                    bidIncrement: parseFloat(bidIncrement),
                    startTime,
                    endTime,
                    images: imageUrls,
                    thumbnailIndex: thumbnailIndex >= 0 ? thumbnailIndex : 0,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create auction');
                return;
            }

            router.push(`/auctions/${data.auction._id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsLoading(false);
            setUploadProgress('');
        }
    };

    const handleCategoryChange = useCallback((v: string) => {
        if (v === 'empty_categories') return;
        setSelectedCategory(v);
        setSelectedSubcategory('');
    }, []);

    const handleSubcategoryChange = useCallback((v: string) => {
        setSelectedSubcategory(v);
    }, []);

    const handleDateChange = useCallback((field: string, value: string) => {
        setSchedule(prev => ({ ...prev, [field]: value }));
    }, []);

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">Create New Auction</h1>
                <p className="text-muted-foreground text-sm">List your item and reach thousands of buyers</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ImageIcon className="w-4 h-4 text-primary" />
                            Images
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-col gap-4">
                        <MemoizedImageUploader onImagesSelect={handleImagesSelect} />
                        <MemoizedImagePreview
                            images={images}
                            thumbnailId={thumbnailId}
                            onThumbnailChange={setThumbnailId}
                            onRemove={handleRemoveImage}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Tag className="w-4 h-4 text-primary" />
                            Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3 space-y-1">
                                <Label htmlFor="title" className="text-sm">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Vintage Camera"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm">Condition</Label>
                                <Select
                                    value={condition}
                                    onValueChange={setCondition}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CONDITIONS.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <CategorySelects
                            categories={categories}
                            selectedCategory={selectedCategory}
                            selectedSubcategory={selectedSubcategory}
                            onCategoryChange={handleCategoryChange}
                            onSubcategoryChange={handleSubcategoryChange}
                        />
                        <div className="space-y-1">
                            <Label htmlFor="description" className="text-sm">Description</Label>
                            <textarea
                                id="description"
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe your item..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing & Schedule in one row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <DollarSign className="w-4 h-4 text-primary" />
                                Pricing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-sm">Starting Price</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={startingPrice}
                                            onChange={(e) => setStartingPrice(e.target.value)}
                                            className="pl-6"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm">Min Increment</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="1.00"
                                            value={bidIncrement}
                                            onChange={(e) => setBidIncrement(e.target.value)}
                                            className="pl-6"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock className="w-4 h-4 text-primary" />
                                Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                            <DateTimeRow
                                label="Starts"
                                prefix="start"
                                values={schedule}
                                onDateChange={handleDateChange}
                                years={years}
                            />
                            <DateTimeRow
                                label="Ends"
                                prefix="end"
                                values={schedule}
                                onDateChange={handleDateChange}
                                years={years}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {uploadProgress || 'Creating...'}
                            </>
                        ) : 'Create Auction'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
