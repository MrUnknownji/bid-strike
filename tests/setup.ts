import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { expect, afterEach, mock } from 'bun:test';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

GlobalRegistrator.register();

expect.extend(matchers);

// Global mock for next/image
mock.module('next/image', () => ({
    default: ({ fill, priority, ...props }: any) => {
        return React.createElement('img', {
            ...props,
            'data-fill': fill ? 'true' : undefined,
            'data-priority': priority ? 'true' : undefined
        });
    },
}));

afterEach(() => {
    cleanup();
});
