// Test unit cho vỏ app (EN1): app dựng được và hiện tên app.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('EN1 · vỏ app', () => {
  it('hiện tên Home247', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Home247' })).toBeInTheDocument();
  });
});
