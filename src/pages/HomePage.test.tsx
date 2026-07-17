import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('renders the hero heading', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: /Run your entire school in one place/i })).toBeInTheDocument();
  });

  it('links the primary CTA to the free trial page', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /Start free trial/i })).toHaveAttribute('href', '/start-trial');
  });

  it('links the secondary CTA to the pricing page', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /See pricing/i })).toHaveAttribute('href', '/pricing');
  });

  it('links "Request an account" to the reviewed-signup form', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /^Request an account$/i })).toHaveAttribute('href', '/request-account');
  });

  it('renders a feature card for each highlighted feature', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Attendance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bus tracking' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(8);
  });
});
