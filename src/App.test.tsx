import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routing', () => {
  it('renders the home page at /', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: /Run your entire school in one place/i })).toBeInTheDocument();
  });

  it('renders the pricing page at /pricing', () => {
    renderAt('/pricing');
    expect(screen.getByRole('heading', { name: /Simple, transparent pricing/i })).toBeInTheDocument();
  });

  it('renders the request-account (signup) page at /request-account', () => {
    renderAt('/request-account');
    expect(screen.getByRole('heading', { name: /Request an account/i })).toBeInTheDocument();
  });

  it('renders the start-trial page at /start-trial', () => {
    renderAt('/start-trial');
    expect(screen.getByRole('heading', { name: /Start your free trial/i })).toBeInTheDocument();
  });

  it('renders the 404 page for an unknown route', () => {
    renderAt('/this-route-does-not-exist');
    expect(screen.getByRole('heading', { name: /Page not found/i })).toBeInTheDocument();
  });

  it('always renders the shared layout header and footer', () => {
    renderAt('/pricing');
    expect(screen.getByText('School Management')).toBeInTheDocument();
    expect(screen.getByText(/Built for schools that want everything in one place/i)).toBeInTheDocument();
  });
});
