'use client';

import { useState, useCallback } from 'react';
import { X, Star, GripVertical, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface PreviewImage {
    id: string;
    file?: File;
    url: string;
}

interface ImagePreviewProps {
    images: PreviewImage[];
    thumbnailId: string | null;
    onThumbnailChange: (id: string) => void;
    onRemove: (id: string) => void;
    onReorder?: (images: PreviewImage[]) => void;
    className?: string;
}

export default function ImagePreview({
    images,
    thumbnailId,
    onThumbnailChange,
    onRemove,
    className,
}: ImagePreviewProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const handleSetThumbnail = useCallback(
        (e: React.MouseEvent, id: string) => {
            e.stopPropagation();
            onThumbnailChange(id);
        },
        [onThumbnailChange]
    );

    const handleRemove = useCallback(
        (e: React.MouseEvent, id: string) => {
            e.stopPropagation();
            onRemove(id);
        },
        [onRemove]
    );

    if (images.length === 0) {
        return (
            <div className={cn('flex items-center justify-center p-8 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20', className)}>
                <div className="text-center">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No images uploaded yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                    {images.length} image{images.length !== 1 ? 's' : ''} uploaded
                </p>
                <p className="text-xs text-muted-foreground">
                    Click ★ to set as thumbnail
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((image) => {
                    const isThumbnail = thumbnailId === image.id;
                    const isHovered = hoveredId === image.id;

                    return (
                        <div
                            key={image.id}
                            onMouseEnter={() => setHoveredId(image.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={cn(
                                'relative aspect-square rounded-lg overflow-hidden group cursor-pointer transition-all duration-300',
                                isThumbnail
                                    ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                                    : 'ring-1 ring-border hover:ring-primary/50'
                            )}
                        >
                            <img
                                src={image.url}
                                alt="Preview"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            <div
                                className={cn(
                                    'absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-200',
                                    isHovered || isThumbnail ? 'opacity-100' : 'opacity-0'
                                )}
                            />

                            <div className="absolute top-2 left-2 flex items-center gap-1">
                                <GripVertical
                                    className={cn(
                                        'w-4 h-4 text-white/70 transition-opacity duration-200 cursor-grab',
                                        isHovered ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                            </div>

                            <div className="absolute top-2 right-2 flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleRemove(e, image.id)}
                                    className={cn(
                                        'h-7 w-7 rounded-full bg-black/50 hover:bg-destructive text-white transition-all duration-200',
                                        isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                                    )}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleSetThumbnail(e, image.id)}
                                    className={cn(
                                        'h-7 px-2 rounded-full text-xs font-medium transition-all duration-200',
                                        isThumbnail
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : 'bg-black/50 text-white hover:bg-primary/80',
                                        !isHovered && !isThumbnail && 'opacity-0'
                                    )}
                                >
                                    <Star
                                        className={cn(
                                            'w-3.5 h-3.5 mr-1',
                                            isThumbnail && 'fill-current'
                                        )}
                                    />
                                    {isThumbnail ? 'Thumbnail' : 'Set'}
                                </Button>
                            </div>

                            {isThumbnail && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary to-transparent" />
                                    <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-primary via-primary to-transparent" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
