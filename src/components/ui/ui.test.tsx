import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Card, Input, Select } from './index';

describe('Button', () => {
  it('renders its children and fires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await user.click(screen.getByRole('button', { name: 'Click me' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and shows a spinner while loading', () => {
    render(<Button loading>Saving</Button>);

    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toBeDisabled();
    expect(button.querySelector('.animate-spin')).not.toBeNull();
  });

  it('is disabled when the disabled prop is set', () => {
    render(<Button disabled>Nope</Button>);
    expect(screen.getByRole('button', { name: 'Nope' })).toBeDisabled();
  });

  it('does not fire onClick while loading', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Busy
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: 'Busy' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('passes through native button attributes like type', () => {
    render(<Button type="submit">Go</Button>);
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('type', 'submit');
  });
});

describe('Card', () => {
  it('renders children and merges custom class names', () => {
    render(
      <Card className="custom-class">
        <p>Inside the card</p>
      </Card>,
    );

    const content = screen.getByText('Inside the card');
    expect(content).toBeInTheDocument();
    expect(content.parentElement).toHaveClass('custom-class');
  });
});

describe('Input', () => {
  it('associates the label with the input', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInstanceOf(HTMLInputElement);
  });

  it('marks required fields with an asterisk', () => {
    render(<Input label="School name" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByLabelText(/School name/)).toBeRequired();
  });

  it('accepts typed input', async () => {
    const user = userEvent.setup();
    render(<Input label="Name" defaultValue="" />);

    const input = screen.getByLabelText('Name');
    await user.type(input, 'Priya');

    expect(input).toHaveValue('Priya');
  });

  it('shows the error text and sets aria-invalid', () => {
    render(<Input label="Email" error="Email is invalid" />);

    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('is not marked invalid without an error', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'false');
  });
});

describe('Select', () => {
  it('associates the label and renders its options', () => {
    render(
      <Select label="Plan" defaultValue="B">
        <option value="A">Plan A</option>
        <option value="B">Plan B</option>
      </Select>,
    );

    const select = screen.getByLabelText('Plan');
    expect(select).toBeInstanceOf(HTMLSelectElement);
    expect(select).toHaveValue('B');
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('changes value on selection', async () => {
    const user = userEvent.setup();
    render(
      <Select label="Plan" defaultValue="A">
        <option value="A">Plan A</option>
        <option value="B">Plan B</option>
      </Select>,
    );

    await user.selectOptions(screen.getByLabelText('Plan'), 'B');

    expect(screen.getByLabelText('Plan')).toHaveValue('B');
  });
});
