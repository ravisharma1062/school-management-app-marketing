import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

// SITE_KEY and the script-load promise are captured at module scope, so each test
// stubs the env first and then dynamically imports a fresh copy of the module.
async function importWidget() {
  const mod = await import('./TurnstileWidget');
  return mod.TurnstileWidget;
}

function findTurnstileScript(): HTMLScriptElement | null {
  return document.head.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
  findTurnstileScript()?.remove();
  delete window.turnstile;
});

describe('TurnstileWidget with no site key configured', () => {
  it('renders the dev notice instead of the widget and loads no script', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '');
    const TurnstileWidget = await importWidget();

    render(<TurnstileWidget onToken={vi.fn()} />);

    expect(screen.getByText(/CAPTCHA is not configured/i)).toBeInTheDocument();
    expect(findTurnstileScript()).toBeNull();
  });

  it('never calls onToken on its own (the form falls back to the placeholder token)', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '');
    const TurnstileWidget = await importWidget();
    const onToken = vi.fn();

    render(<TurnstileWidget onToken={onToken} />);

    expect(onToken).not.toHaveBeenCalled();
  });
});

describe('TurnstileWidget with a site key configured', () => {
  it('injects the Cloudflare script and renders the widget into the container', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-site-key');
    const TurnstileWidget = await importWidget();
    const renderMock = vi.fn().mockReturnValue('widget-1');
    window.turnstile = { render: renderMock };

    const { container } = render(<TurnstileWidget onToken={vi.fn()} />);

    expect(screen.queryByText(/CAPTCHA is not configured/i)).not.toBeInTheDocument();

    const script = findTurnstileScript();
    expect(script).not.toBeNull();
    expect(script!.async).toBe(true);

    await act(async () => {
      fireEvent.load(script!);
    });

    await waitFor(() => expect(renderMock).toHaveBeenCalledTimes(1));
    const [containerEl, options] = renderMock.mock.calls[0];
    expect(container.contains(containerEl)).toBe(true);
    expect(options.sitekey).toBe('test-site-key');
  });

  it('forwards the verification token from the turnstile callback to onToken', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-site-key');
    const TurnstileWidget = await importWidget();
    const renderMock = vi.fn().mockReturnValue('widget-1');
    window.turnstile = { render: renderMock };
    const onToken = vi.fn();

    render(<TurnstileWidget onToken={onToken} />);
    const script = findTurnstileScript();
    await act(async () => {
      fireEvent.load(script!);
    });
    await waitFor(() => expect(renderMock).toHaveBeenCalled());

    const [, options] = renderMock.mock.calls[0];
    act(() => {
      options.callback('captcha-token-abc');
    });

    expect(onToken).toHaveBeenCalledWith('captcha-token-abc');
  });

  it('shows a failure message when the script fails to load', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-site-key');
    const TurnstileWidget = await importWidget();

    render(<TurnstileWidget onToken={vi.fn()} />);
    const script = findTurnstileScript();
    await act(async () => {
      fireEvent.error(script!);
    });

    expect(await screen.findByText(/Couldn't load the verification widget/i)).toBeInTheDocument();
  });

  it('shows a failure message when the widget reports an error via error-callback', async () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-site-key');
    const TurnstileWidget = await importWidget();
    const renderMock = vi.fn().mockReturnValue('widget-1');
    window.turnstile = { render: renderMock };

    render(<TurnstileWidget onToken={vi.fn()} />);
    const script = findTurnstileScript();
    await act(async () => {
      fireEvent.load(script!);
    });
    await waitFor(() => expect(renderMock).toHaveBeenCalled());

    const [, options] = renderMock.mock.calls[0];
    act(() => {
      options['error-callback']();
    });

    expect(screen.getByText(/Couldn't load the verification widget/i)).toBeInTheDocument();
  });
});
