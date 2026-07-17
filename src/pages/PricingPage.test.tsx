import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PricingPage } from './PricingPage';
import { PLANS } from '@/data/plans';

function renderPage() {
  return render(
    <MemoryRouter>
      <PricingPage />
    </MemoryRouter>,
  );
}

describe('PricingPage', () => {
  it('renders a heading for every plan in data/plans.ts', () => {
    renderPage();

    for (const plan of PLANS) {
      expect(screen.getByRole('heading', { name: plan.name })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(PLANS.length);
  });

  it('shows the formatted INR price and student limit for each plan', () => {
    renderPage();

    for (const plan of PLANS) {
      expect(screen.getByText(`₹${plan.priceInr.toLocaleString('en-IN')}`)).toBeInTheDocument();
      expect(screen.getByText(plan.studentLimit)).toBeInTheDocument();
    }
  });

  it('lists every feature bullet for each plan', () => {
    renderPage();

    for (const plan of PLANS) {
      for (const feature of plan.features) {
        expect(screen.getByText(feature)).toBeInTheDocument();
      }
    }
  });

  it('marks only the highlighted plan as "Most popular"', () => {
    renderPage();
    expect(screen.getAllByText('Most popular')).toHaveLength(1);
  });

  it('links each "Choose <plan>" button to the signup form preselecting that plan', () => {
    renderPage();

    for (const plan of PLANS) {
      const link = screen.getByRole('link', { name: `Choose ${plan.name}` });
      expect(link).toHaveAttribute('href', `/request-account?plan=${plan.code}`);
    }
  });

  it('links to the free-trial page for undecided visitors', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /Start a free 14-day trial/i })).toHaveAttribute('href', '/start-trial');
  });
});
