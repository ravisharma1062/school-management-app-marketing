import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { PLANS } from '@/data/plans';

export function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">Simple, transparent pricing</h1>
        <p className="mt-3 text-slate-600">Pick a plan to start with — you can change it any time; just ask us.</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.code}
            className={`flex flex-col p-6 ${plan.highlighted ? 'ring-2 ring-brand-500' : ''}`}
          >
            {plan.highlighted && (
              <span className="mb-3 inline-block w-fit rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                Most popular
              </span>
            )}
            <h2 className="text-lg font-bold text-slate-900">{plan.name}</h2>
            <p className="mt-2">
              <span className="text-3xl font-extrabold text-slate-900">₹{plan.priceInr.toLocaleString('en-IN')}</span>
              <span className="text-sm text-slate-500"> / month</span>
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{plan.studentLimit}</p>
            <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-600">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-0.5 text-brand-600">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link to={`/request-account?plan=${plan.code}`} className="mt-6">
              <Button variant={plan.highlighted ? 'primary' : 'secondary'} className="w-full">
                Choose {plan.name}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
