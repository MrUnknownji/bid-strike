'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
    images: string[];
    autoScrollInterval?: number;
    className?: string;
}

export default function ImageCarousel({
    images,
    autoScrollInterval = 2500,
    className,
}: ImageCarouselProps) {
    const validImages = images?.filter((img) => img && typeof img === 'string' && img.trim() !== '') || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const stopAutoScroll = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const startAutoScroll = useCallback(() => {
        if (validImages.length <= 1) return;
        stopAutoScroll();
        intervalRef.current = setInterval(() => {
            setIsTransitioning(true);
            setCurrentIndex((prev) => (prev + 1) % validImages.length);
            setTimeout(() => setIsTransitioning(false), 300);
        }, autoScrollInterval);
    }, [validImages.length, autoScrollInterval, stopAutoScroll]);

    useEffect(() => {
        if (isHovering && validImages.length > 1) {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
        return stopAutoScroll;
    }, [isHovering, validImages.length, startAutoScroll, stopAutoScroll]);

    const goToPrevious = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            stopAutoScroll();
            setIsTransitioning(true);
            setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
            setTimeout(() => {
                setIsTransitioning(false);
                if (isHovering) startAutoScroll();
            }, 300);
        },
        [validImages.length, isHovering, startAutoScroll, stopAutoScroll]
    );

    const goToNext = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            stopAutoScroll();
            setIsTransitioning(true);
            setCurrentIndex((prev) => (prev + 1) % validImages.length);
            setTimeout(() => {
                setIsTransitioning(false);
                if (isHovering) startAutoScroll();
            }, 300);
        },
        [validImages.length, isHovering, startAutoScroll, stopAutoScroll]
    );

    const goToIndex = useCallback(
        (index: number, e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (index !== currentIndex) {
                stopAutoScroll();
                setIsTransitioning(true);
                setCurrentIndex(index);
                setTimeout(() => {
                    setIsTransitioning(false);
                    if (isHovering) startAutoScroll();
                }, 300);
            }
        },
        [currentIndex, isHovering, startAutoScroll, stopAutoScroll]
    );

    if (validImages.length === 0) {
        return (
            <div className={cn('aspect-video bg-muted flex items-center justify-center', className)}>
                <div className="flex flex-col items-center text-muted-foreground">
                    <ImageOff className="w-8 h-8 mb-2" />
                    <span className="text-sm">No Image</span>
                </div>
            </div>
        );
    }

    if (validImages.length === 1) {
        return (
            <div className={cn('aspect-video bg-muted relative overflow-hidden', className)}>
                {failedImages.has(0) ? (
                    <div className="flex items-center justify-center h-full">
                        <ImageOff className="w-8 h-8 text-muted-foreground" />
                    </div>
                ) : (
                    <img
                        src={validImages[0]}
                        alt="Product"
                        className="w-full h-full object-cover"
                        onError={() => setFailedImages(new Set([0]))}
                    />
                )}
            </div>
        );
    }

    return (
        <div
            className={cn('aspect-video bg-muted relative overflow-hidden group', className)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {validImages.map((image, index) => (
                    <div key={index} className="w-full h-full flex-shrink-0">
                        {failedImages.has(index) ? (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                                <ImageOff className="w-8 h-8 text-muted-foreground" />
                            </div>
                        ) : (
                            <img
                                src={image}
                                alt={`Product ${index + 1}`}
                                className={cn(
                                    'w-full h-full object-cover transition-transform duration-300',
                                    isHovering && 'scale-105'
                                )}
                                onError={() => setFailedImages((prev) => new Set([...prev, index]))}
                            />
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={goToPrevious}
                className={cn(
                    'absolute left-2 top-1/2 -translate-y-1/2 z-10',
                    'w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100 transition-all duration-200',
                    'hover:bg-black/80 hover:scale-110',
                    'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
                aria-label="Previous image"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <button
                onClick={goToNext}
                className={cn(
                    'absolute right-2 top-1/2 -translate-y-1/2 z-10',
                    'w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100 transition-all duration-200',
                    'hover:bg-black/80 hover:scale-110',
                    'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
                aria-label="Next image"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            <div
                className={cn(
                    'absolute bottom-3 left-1/2 -translate-x-1/2 z-10',
                    'flex items-center gap-1.5',
                    'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                )}
            >
                {validImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={(e) => goToIndex(index, e)}
                        className={cn(
                            'w-2 h-2 rounded-full transition-all duration-200',
                            index === currentIndex
                                ? 'bg-white w-4'
                                : 'bg-white/50 hover:bg-white/75'
                        )}
                        aria-label={`Go to image ${index + 1}`}
                    />
                ))}
            </div>

            <div
                className={cn(
                    'absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-xs font-medium',
                    'bg-black/60 text-white',
                    'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
                )}
            >
                {currentIndex + 1}/{validImages.length}
            </div>
        </div>
    );
}
