'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
                variant={theme === 'light' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setTheme('light')}
                title="Light"
            >
                <Sun className="h-4 w-4" />
            </Button>
            <Button
                variant={theme === 'dark' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setTheme('dark')}
                title="Dark"
            >
                <Moon className="h-4 w-4" />
            </Button>
            <Button
                variant={theme === 'system' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setTheme('system')}
                title="System"
            >
                <Monitor className="h-4 w-4" />
            </Button>
        </div>
    );
}
