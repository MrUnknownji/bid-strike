'use client';

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ArrowLeft, Loader2, ImageIcon, Tag, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/components/common/ImageUploader';
import ImagePreview from '@/components/common/ImagePreview';
import SuggestionDialog from '@/components/common/SuggestionDialog';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';

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

const MemoizedImageUploader = memo(({ onImagesSelect }: { onImagesSelect: (files: File[]) => void }) => (
    <ImageUploader onImagesSelect={onImagesSelect} maxFiles={10} />
));

const MemoizedImagePreview = memo(({ images, thumbnailId, onThumbnailChange, onRemove }: any) => (
    <ImagePreview
        images={images}
        thumbnailId={thumbnailId}
        onThumbnailChange={onThumbnailChange}
        onRemove={onRemove}
    />
));

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

interface PreviewImage {
    id: string;
    file?: File;
    url: string;
    isExisting?: boolean;
}

export default function EditAuctionPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<string>('');
    const [error, setError] = useState('');
    const [canEdit, setCanEdit] = useState(false);
    const [editReason, setEditReason] = useState('');

    const [images, setImages] = useState<PreviewImage[]>([]);
    const [thumbnailId, setThumbnailId] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [condition, setCondition] = useState('good');
    const [startingPrice, setStartingPrice] = useState('');
    const [bidIncrement, setBidIncrement] = useState('');

    const now = new Date();
    const currentYear = now.getFullYear();
    const years = useMemo(() => Array.from({ length: 6 }, (_, i) => (currentYear + i).toString()), [currentYear]);

    const [schedule, setSchedule] = useState({
        startMonth: '',
        startDay: '',
        startYear: '',
        startHour: '12',
        startMinute: '00',
        endMonth: '',
        endDay: '',
        endYear: '',
        endHour: '12',
        endMinute: '00',
    });

    const checkEditability = useCallback((auc: any) => {
        const now = new Date();
        const startTime = new Date(auc.startTime);
        const minutesUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60);

        if (auc.status === 'ended') {
            setCanEdit(false);
            setEditReason('Cannot edit ended auctions');
            return;
        }

        if (auc.status === 'active') {
            if (auc.totalBids > 0) {
                setCanEdit(false);
                setEditReason('Cannot edit auction with active bids');
                return;
            }
            setCanEdit(false);
            setEditReason('Cannot edit live auction');
            return;
        }

        if (auc.status === 'scheduled' && minutesUntilStart < 30) {
            setCanEdit(false);
            setEditReason('Cannot edit within 30 minutes of start time');
            return;
        }

        setCanEdit(true);
        setEditReason('');
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const [aucRes, catRes] = await Promise.all([
                    fetch(`/api/auctions/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch('/api/categories')
                ]);

                const catData = await catRes.json();
                if (catData.categories && Array.isArray(catData.categories)) {
                    setCategories(catData.categories);
                } else if (Array.isArray(catData)) {
                    setCategories(catData);
                }

                if (!aucRes.ok) {
                    router.push('/dashboard/my-auctions');
                    return;
                }

                const data = await aucRes.json();
                const auc = data.auction;
                checkEditability(auc);

                setTitle(auc.title);
                setDescription(auc.description);
                setCondition(auc.condition || 'good');
                setStartingPrice(auc.startingPrice.toString());
                setBidIncrement(auc.bidIncrement.toString());

                if (auc.images && Array.isArray(auc.images)) {
                    setImages(auc.images.map((url: string) => ({
                        id: url,
                        url,
                        isExisting: true
                    })));
                    if (auc.images.length > 0) {
                        setThumbnailId(auc.images[auc.thumbnailIndex || 0] || auc.images[0]);
                    }
                }

                if (auc.category) {
                    if (auc.category.parent) {
                        setSelectedCategory(auc.category.parent);
                        setSelectedSubcategory(auc.category._id);
                    } else {
                        setSelectedCategory(auc.category._id);
                    }
                }

                const start = new Date(auc.startTime);
                const end = new Date(auc.endTime);

                setSchedule({
                    startMonth: (start.getMonth() + 1).toString(),
                    startDay: start.getDate().toString(),
                    startYear: start.getFullYear().toString(),
                    startHour: start.getHours().toString().padStart(2, '0'),
                    startMinute: (Math.floor(start.getMinutes() / 15) * 15).toString().padStart(2, '0'),
                    endMonth: (end.getMonth() + 1).toString(),
                    endDay: end.getDate().toString(),
                    endYear: end.getFullYear().toString(),
                    endHour: end.getHours().toString().padStart(2, '0'),
                    endMinute: (Math.floor(end.getMinutes() / 15) * 15).toString().padStart(2, '0'),
                });

            } catch {
                router.push('/dashboard/my-auctions');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, router, checkEditability]);

    const handleImagesSelect = useCallback((files: File[]) => {
        const newImages: PreviewImage[] = files.map((file) => ({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            url: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
        if (!thumbnailId && newImages.length > 0) {
            setThumbnailId(newImages[0].id);
        }
    }, [thumbnailId]);

    const handleRemoveImage = useCallback((idToRemove: string) => {
        setImages((prev) => {
            const newImages = prev.filter((img) => img.id !== idToRemove);
            if (thumbnailId === idToRemove && newImages.length > 0) {
                setThumbnailId(newImages[0].id);
            } else if (newImages.length === 0) {
                setThumbnailId(null);
            }
            return newImages;
        });
    }, [thumbnailId]);

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

    const uploadImages = async (): Promise<string[]> => {
        const results: string[] = [];
        const total = images.length;
        let completed = 0;

        for (const img of images) {
            if (img.isExisting) {
                results.push(img.url);
            } else if (img.file) {
                setUploadProgress(`Uploading ${completed + 1}/${total} images...`);
                const result = await uploadToCloudinary(img.file);
                results.push(result.url);
            }
            completed++;
        }
        return results;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!canEdit) {
            setError(editReason);
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

        const token = localStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
            return;
        }

        setIsSaving(true);
        setUploadProgress('Preparing...');

        try {
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

            const imageUrls = await uploadImages();
            const thumbnailIndex = images.findIndex((img) => img.id === thumbnailId);

            const res = await fetch(`/api/auctions/${id}`, {
                method: 'PUT',
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
                setError(data.error || 'Failed to update auction');
                return;
            }

            router.push(`/auctions/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsSaving(false);
            setUploadProgress('');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/my-auctions">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Edit Auction</h1>
                    <p className="text-muted-foreground text-sm">Update your listing details</p>
                </div>
            </div>

            {!canEdit && (
                <div className="flex items-center gap-2 p-3 mb-4 text-sm text-amber-600 bg-amber-500/10 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {editReason}
                </div>
            )}

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
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={!canEdit}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-sm">Condition</Label>
                                <Select
                                    value={condition}
                                    onValueChange={setCondition}
                                    disabled={!canEdit}
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
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
                                disabled={!canEdit}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="py-4">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Tag className="w-4 h-4 text-primary" />
                                Pricing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="price" className="text-sm">Starting Price</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={startingPrice}
                                            onChange={(e) => setStartingPrice(e.target.value)}
                                            className="pl-6"
                                            disabled={!canEdit}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="increment" className="text-sm">Min Increment</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                        <Input
                                            id="increment"
                                            type="number"
                                            min="1"
                                            value={bidIncrement}
                                            onChange={(e) => setBidIncrement(e.target.value)}
                                            className="pl-6"
                                            disabled={!canEdit}
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

                <div className="flex justify-end gap-3">
                    <Link href="/dashboard/my-auctions">
                        <Button type="button" variant="outline">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isSaving || !canEdit} className="min-w-[120px]">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {uploadProgress || 'Saving...'}
                            </>
                        ) : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
