import { useCallback, useState, type FormEvent } from 'react';
import { trialSignupApi } from '@/api/signup';
import { extractErrorMessage, isDuplicateSignupError, isRateLimitError } from '@/api/client';
import { Button, Card, Input } from '@/components/ui';
import { TurnstileWidget } from '@/components/layout/TurnstileWidget';

export function TrialSignupPage() {
  const [schoolName, setSchoolName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [wantsEmail, setWantsEmail] = useState(true);
  const [wantsSms, setWantsSms] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const onCaptchaToken = useCallback((token: string) => setCaptchaToken(token), []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await trialSignupApi.submit({
        schoolName,
        contactName,
        contactEmail,
        contactPhone,
        wantsEmail,
        wantsSms,
        // The widget calls back with a real token only once configured (VITE_TURNSTILE_SITE_KEY
        // set) — otherwise this placeholder is what the backend's equally-unconfigured
        // CaptchaVerifier expects to see (any non-blank token passes through in dev).
        captchaToken: captchaToken || 'dev-no-captcha',
      });
      setAdminEmail(data.adminEmail);
    } catch (err) {
      if (isDuplicateSignupError(err)) {
        setError('An account with this email already exists.');
      } else if (isRateLimitError(err)) {
        setError('Too many requests from this connection. Please try again in a little while.');
      } else {
        setError(extractErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (adminEmail) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <span aria-hidden="true" className="text-5xl">
          🚀
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Your trial is ready</h1>
        <p className="mt-2 text-slate-600">
          We've sent an activation link to <span className="font-semibold text-slate-800">{adminEmail}</span> — set
          your password there to sign in and start exploring. Your 14-day trial starts now, no card required.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-gradient text-3xl font-extrabold tracking-tight">Start your free trial</h1>
        <p className="mt-2 text-sm text-slate-500">
          14 days, no card required. Your school is ready the moment you submit this form.
        </p>
      </div>

      <Card className="p-6 sm:p-7">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <Input
            label="School name"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            required
            maxLength={255}
            placeholder="Sunrise Public School"
          />
          <Input
            label="Your name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
            maxLength={255}
            placeholder="Priya Sharma"
          />
          <Input
            label="Email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            maxLength={255}
            placeholder="principal@sunrise.example"
          />
          <Input
            label="Phone (optional)"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            maxLength={20}
            placeholder="+91 98765 43210"
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Which notification channels do you want enabled?</p>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={wantsEmail}
                onChange={(e) => setWantsEmail(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              Email notifications
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={wantsSms}
                onChange={(e) => setWantsSms(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              SMS notifications
            </label>
          </div>

          <TurnstileWidget onToken={onCaptchaToken} />

          <Button type="submit" className="w-full" loading={submitting}>
            Start free trial
          </Button>
        </form>
      </Card>
    </div>
  );
}
