// Nạp matcher của jest-dom (toBeInTheDocument...) và dọn màn sau mỗi test unit.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());
