'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
    onImagesSelect: (files: File[]) => void;
    maxFiles?: number;
    maxSizeMB?: number;
    accept?: string;
    className?: string;
}

export default function ImageUploader({
    onImagesSelect,
    maxFiles = 10,
    maxSizeMB = 5,
    accept = 'image/*',
    className,
}: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFiles = useCallback(
        (files: FileList | File[]): File[] => {
            const validFiles: File[] = [];
            const maxSize = maxSizeMB * 1024 * 1024;

            Array.from(files).forEach((file) => {
                if (!file.type.startsWith('image/')) {
                    setError('Only image files are allowed');
                    return;
                }
                if (file.size > maxSize) {
                    setError(`File size must be under ${maxSizeMB}MB`);
                    return;
                }
                if (validFiles.length < maxFiles) {
                    validFiles.push(file);
                }
            });

            return validFiles;
        },
        [maxFiles, maxSizeMB]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            setError(null);

            const files = validateFiles(e.dataTransfer.files);
            if (files.length > 0) {
                onImagesSelect(files);
            }
        },
        [onImagesSelect, validateFiles]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setError(null);
            if (e.target.files) {
                const files = validateFiles(e.target.files);
                if (files.length > 0) {
                    onImagesSelect(files);
                }
            }
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        },
        [onImagesSelect, validateFiles]
    );

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className={cn('space-y-2', className)}>
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    'relative flex flex-col items-center justify-center gap-4 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300',
                    'bg-muted/30 hover:bg-muted/50',
                    isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-muted-foreground/30 hover:border-primary/50',
                    'group'
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div
                    className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
                        'bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110',
                        isDragging && 'bg-primary/20 scale-110'
                    )}
                >
                    {isDragging ? (
                        <ImageIcon className="w-7 h-7 text-primary animate-pulse" />
                    ) : (
                        <Upload className="w-7 h-7 text-primary" />
                    )}
                </div>

                <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                        {isDragging ? 'Drop images here' : 'Drag & drop images'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        or click to browse • Max {maxSizeMB}MB per file
                    </p>
                </div>

                <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
                    <div
                        className={cn(
                            'absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-300',
                            (isDragging || false) && 'opacity-100'
                        )}
                    />
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                    <X className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
}
