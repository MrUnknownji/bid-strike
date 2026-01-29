import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { expect, afterEach } from 'bun:test';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

GlobalRegistrator.register();

expect.extend(matchers);

afterEach(() => {
    cleanup();
});
