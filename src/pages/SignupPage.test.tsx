import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SignupPage } from './SignupPage';
import { signupApi } from '@/api/signup';
import { axiosErrorWithResponse } from '@/test/helpers';

vi.mock('@/api/signup', () => ({
  signupApi: { submit: vi.fn() },
  trialSignupApi: { submit: vi.fn() },
}));

// The real widget owns script loading against Cloudflare; here it is stubbed with a button so
// tests can choose between the token path (click it) and the placeholder-token path (don't).
vi.mock('@/components/layout/TurnstileWidget', () => ({
  TurnstileWidget: ({ onToken }: { onToken: (token: string) => void }) => (
    <button type="button" onClick={() => onToken('mock-captcha-token')}>
      mock-turnstile
    </button>
  ),
}));

const mockedSubmit = vi.mocked(signupApi.submit);

function renderPage(initialEntry = '/request-account') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SignupPage />
    </MemoryRouter>,
  );
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/School name/), 'Sunrise Public School');
  await user.type(screen.getByLabelText(/Your name/), 'Priya Sharma');
  await user.type(screen.getByRole('textbox', { name: /^Email/ }), 'priya@sunrise.example');
}

beforeEach(() => {
  mockedSubmit.mockReset();
  mockedSubmit.mockResolvedValue({ data: undefined } as never);
});

describe('SignupPage form rendering', () => {
  it('renders all fields with the required ones marked', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /Request an account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/School name/)).toBeRequired();
    expect(screen.getByLabelText(/Your name/)).toBeRequired();
    expect(screen.getByRole('textbox', { name: /^Email/ })).toBeRequired();
    expect(screen.getByLabelText(/Phone \(optional\)/)).not.toBeRequired();
    expect(screen.getByLabelText(/Desired plan/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email notifications/)).toBeChecked();
    expect(screen.getByLabelText(/SMS notifications/)).not.toBeChecked();
  });

  it('defaults the plan to STANDARD', () => {
    renderPage();
    expect(screen.getByLabelText(/Desired plan/)).toHaveValue('STANDARD');
  });

  it('preselects the plan from the ?plan= query param', () => {
    renderPage('/request-account?plan=PREMIUM');
    expect(screen.getByLabelText(/Desired plan/)).toHaveValue('PREMIUM');
  });

  it('falls back to STANDARD for an unknown ?plan= value', () => {
    renderPage('/request-account?plan=ENTERPRISE');
    expect(screen.getByLabelText(/Desired plan/)).toHaveValue('STANDARD');
  });

  it('lists all three plans in the picker', () => {
    renderPage();
    const options = screen.getAllByRole('option');
    expect(options.map((o) => (o as HTMLOptionElement).value)).toEqual(['BASIC', 'STANDARD', 'PREMIUM']);
  });
});

describe('SignupPage submission', () => {
  it('submits the form payload with the placeholder captcha token when the widget never fires', async () => {
    const user = userEvent.setup();
    renderPage('/request-account?plan=BASIC');

    await fillRequiredFields(user);
    await user.type(screen.getByLabelText(/Phone/), '+91 98765 43210');
    await user.click(screen.getByLabelText(/SMS notifications/));
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    expect(mockedSubmit).toHaveBeenCalledTimes(1);
    expect(mockedSubmit).toHaveBeenCalledWith({
      schoolName: 'Sunrise Public School',
      contactName: 'Priya Sharma',
      contactEmail: 'priya@sunrise.example',
      contactPhone: '+91 98765 43210',
      desiredPlan: 'BASIC',
      wantsEmail: true,
      wantsSms: true,
      captchaToken: 'dev-no-captcha',
    });
  });

  it('submits the real captcha token once the widget has provided one', async () => {
    const user = userEvent.setup();
    renderPage();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: 'mock-turnstile' }));
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    expect(mockedSubmit).toHaveBeenCalledWith(expect.objectContaining({ captchaToken: 'mock-captcha-token' }));
  });

  it('shows the success state after a successful submit', async () => {
    const user = userEvent.setup();
    renderPage();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    expect(await screen.findByRole('heading', { name: /Request received/i })).toBeInTheDocument();
    expect(screen.getByText(/our team will review your request/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Submit request/i })).not.toBeInTheDocument();
  });

  it('disables the submit button while the request is in flight', async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void = () => {};
    mockedSubmit.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSubmit = () => resolve({ data: undefined } as never);
        }),
    );
    renderPage();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    expect(screen.getByRole('button', { name: /Submit request/i })).toBeDisabled();

    resolveSubmit();
    expect(await screen.findByRole('heading', { name: /Request received/i })).toBeInTheDocument();
  });
});

describe('SignupPage error handling', () => {
  it('shows the duplicate-request message on a 409 with the DUPLICATE_SIGNUP_EMAIL code', async () => {
    const user = userEvent.setup();
    mockedSubmit.mockRejectedValueOnce(
      axiosErrorWithResponse(409, { message: 'Signup request already pending', code: 'DUPLICATE_SIGNUP_EMAIL' }),
    );
    renderPage();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/already got a request pending review/i);
    // The form stays up so the user can adjust and retry.
    expect(screen.getByRole('button', { name: /Submit request/i })).toBeEnabled();
    expect(screen.queryByRole('heading', { name: /Request received/i })).not.toBeInTheDocument();
  });

  // A 409 can also mean an unrelated conflict (e.g. a school-name/slug collision) that the
  // backend's generic constraint-violation handler also reports as 409 but without this code —
  // showing the fixed "already pending" copy for that case would be actively misleading, since
  // the user's email isn't a duplicate at all. It should fall through to the backend's real message.
  it('shows the backend\'s actual message for a 409 without the duplicate-email code', async () => {
    const user = userEvent.setup();
    mockedSubmit.mockRejectedValueOnce(
      axiosErrorWithResponse(409, { message: 'A school with a very similar name was just registered. Please try again in a moment.' }),
    );
    renderPage();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('A school with a very similar name was just registered. Please try again in a moment.');
    expect(alert).not.toHaveTextContent(/already got a request pending review/i);
  });

  it('shows the rate-limit message on a 429', async () => {
    const user = userEvent.setup();
    mockedSubmit.mockRejectedValueOnce(axiosErrorWithResponse(429, { message: 'Too many requests' }));
    renderPage();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Too many requests from this connection/i);
  });

  it('surfaces the backend message for other API errors', async () => {
    const user = userEvent.setup();
    mockedSubmit.mockRejectedValueOnce(axiosErrorWithResponse(400, { message: 'contactEmail must be a valid email' }));
    renderPage();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('contactEmail must be a valid email');
  });

  it('shows a generic message for unrecognized failures', async () => {
    const user = userEvent.setup();
    mockedSubmit.mockRejectedValueOnce('weird non-error rejection');
    renderPage();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Submit request/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('clears a previous error on resubmit and can then succeed', async () => {
    const user = userEvent.setup();
    mockedSubmit.mockRejectedValueOnce(axiosErrorWithResponse(429));
    renderPage();

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Submit request/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit request/i }));
    expect(await screen.findByRole('heading', { name: /Request received/i })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
