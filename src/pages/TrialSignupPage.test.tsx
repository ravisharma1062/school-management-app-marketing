import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrialSignupPage } from './TrialSignupPage';
import { trialSignupApi } from '@/api/signup';
import { axiosErrorWithResponse } from '@/test/helpers';

vi.mock('@/api/signup', () => ({
  signupApi: { submit: vi.fn() },
  trialSignupApi: { submit: vi.fn() },
}));

vi.mock('@/components/layout/TurnstileWidget', () => ({
  TurnstileWidget: ({ onToken }: { onToken: (token: string) => void }) => (
    <button type="button" onClick={() => onToken('mock-captcha-token')}>
      mock-turnstile
    </button>
  ),
}));

const mockedSubmit = vi.mocked(trialSignupApi.submit);

const provisionResult = {
  schoolId: 'school-1',
  schoolSlug: 'sunrise-public-school',
  adminEmail: 'priya@sunrise.example',
};

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/School name/), 'Sunrise Public School');
  await user.type(screen.getByLabelText(/Your name/), 'Priya Sharma');
  await user.type(screen.getByRole('textbox', { name: /^Email/ }), 'priya@sunrise.example');
}

beforeEach(() => {
  mockedSubmit.mockReset();
  mockedSubmit.mockResolvedValue({ data: provisionResult } as never);
});

describe('TrialSignupPage form rendering', () => {
  it('renders the trial form with required fields marked and no plan picker', () => {
    render(<TrialSignupPage />);

    expect(screen.getByRole('heading', { name: /Start your free trial/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/School name/)).toBeRequired();
    expect(screen.getByLabelText(/Your name/)).toBeRequired();
    expect(screen.getByRole('textbox', { name: /^Email/ })).toBeRequired();
    expect(screen.getByLabelText(/Phone \(optional\)/)).not.toBeRequired();
    // MT-6b: trials always start on BASIC — there must be no plan selector.
    expect(screen.queryByLabelText(/Desired plan/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Email notifications/)).toBeChecked();
    expect(screen.getByLabelText(/SMS notifications/)).not.toBeChecked();
  });
});

describe('TrialSignupPage submission', () => {
  it('submits the payload with the placeholder captcha token when the widget never fires', async () => {
    const user = userEvent.setup();
    render(<TrialSignupPage />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Start free trial/i }));

    expect(mockedSubmit).toHaveBeenCalledTimes(1);
    expect(mockedSubmit).toHaveBeenCalledWith({
      schoolName: 'Sunrise Public School',
      contactName: 'Priya Sharma',
      contactEmail: 'priya@sunrise.example',
      contactPhone: '',
      wantsEmail: true,
      wantsSms: false,
      captchaToken: 'dev-no-captcha',
    });
  });

  it('submits the real captcha token once the widget has provided one', async () => {
    const user = userEvent.setup();
    render(<TrialSignupPage />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: 'mock-turnstile' }));
    await user.click(screen.getByRole('button', { name: /Start free trial/i }));

    expect(mockedSubmit).toHaveBeenCalledWith(expect.objectContaining({ captchaToken: 'mock-captcha-token' }));
  });

  it('shows the "trial is ready" state with the admin email after success', async () => {
    const user = userEvent.setup();
    render(<TrialSignupPage />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Start free trial/i }));

    expect(await screen.findByRole('heading', { name: /Your trial is ready/i })).toBeInTheDocument();
    expect(screen.getByText('priya@sunrise.example')).toBeInTheDocument();
    expect(screen.getByText(/14-day trial starts now/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Start free trial/i })).not.toBeInTheDocument();
  });

  it('disables the submit button while provisioning is in flight', async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void = () => {};
    mockedSubmit.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSubmit = () => resolve({ data: provisionResult } as never);
        }),
    );
    render(<TrialSignupPage />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Start free trial/i }));

    expect(screen.getByRole('button', { name: /Start free trial/i })).toBeDisabled();

    resolveSubmit();
    expect(await screen.findByRole('heading', { name: /Your trial is ready/i })).toBeInTheDocument();
  });
});

describe('TrialSignupPage error handling', () => {
  it('shows the existing-account message on a 409 with the DUPLICATE_SIGNUP_EMAIL code', async () => {
    const user = userEvent.setup();
    mockedSubmit.mockRejectedValueOnce(
      axiosErrorWithResponse(409, { message: 'Account already exists', code: 'DUPLICATE_SIGNUP_EMAIL' }),
    );
    render(<TrialSignupPage />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Start free trial/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/An account with this email already exists/i);
    expect(screen.getByRole('button', { name: /Start free trial/i })).toBeEnabled();
    expect(screen.queryByRole('heading', { name: /Your trial is ready/i })).not.toBeInTheDocument();
  });

  it('shows the rate-limit message on a 429', async () => {
    const user = userEvent.setup();
    mockedSubmit.mockRejectedValueOnce(axiosErrorWithResponse(429));
    render(<TrialSignupPage />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Start free trial/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Too many requests from this connection/i);
  });

  it('surfaces the backend message for other API errors', async () => {
    const user = userEvent.setup();
    mockedSubmit.mockRejectedValueOnce(axiosErrorWithResponse(400, { message: 'schoolName must not be blank' }));
    render(<TrialSignupPage />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Start free trial/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('schoolName must not be blank');
  });

  it('recovers after an error: a retry can still succeed', async () => {
    const user = userEvent.setup();
    mockedSubmit.mockRejectedValueOnce(axiosErrorWithResponse(500, { message: 'Provisioning failed' }));
    render(<TrialSignupPage />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole('button', { name: /Start free trial/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Provisioning failed');

    await user.click(screen.getByRole('button', { name: /Start free trial/i }));
    expect(await screen.findByRole('heading', { name: /Your trial is ready/i })).toBeInTheDocument();
  });
});
