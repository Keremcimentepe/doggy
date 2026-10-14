import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the brand and reports a healthy API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true } as Response));

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Doggy' })).toBeInTheDocument();
    expect(await screen.findByText('API online')).toBeInTheDocument();
  });

  it('reports an unreachable API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')));

    render(<App />);

    expect(await screen.findByText('API offline')).toBeInTheDocument();
  });
});
