import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';

const FEATURES = [
  { icon: '📋', title: 'Attendance', description: 'Mark and track attendance in seconds, with history and trends.' },
  { icon: '🗓️', title: 'Timetable', description: 'Class-wise timetables everyone — teachers, parents — can see instantly.' },
  { icon: '📚', title: 'Homework', description: 'Post homework, collect submissions, and grade them from one place.' },
  { icon: '💰', title: 'Fees & payments', description: 'Track fee status and accept online payments, receipts included.' },
  { icon: '📢', title: 'Notices & events', description: 'One announcement reaches every parent, on every channel.' },
  { icon: '💬', title: 'Messaging', description: 'Direct, private messaging between parents and teachers.' },
  { icon: '📖', title: 'Library', description: 'A searchable catalog and issue/return tracking, built in.' },
  { icon: '🚌', title: 'Bus tracking', description: 'Live bus location for parents, on the Premium plan.' },
];

export function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 h-96 w-96 animate-blob rounded-full bg-brand-300/20 blur-3xl" />
          <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] animate-blob-slow rounded-full bg-accent-300/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl animate-fade-up text-center">
          <span className="inline-flex h-16 w-16 animate-float items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 text-3xl shadow-glow-lg">
            🎓
          </span>
          <h1 className="text-gradient mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Run your entire school in one place
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Attendance, timetables, homework, fees, notices, and messaging — for admins, teachers, and parents,
            on web and Android.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/start-trial">
              <Button size="lg">Start free trial</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="secondary" size="lg">
                See pricing
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            14 days, no card required. Prefer a guided setup?{' '}
            <Link to="/request-account" className="font-semibold text-brand-600 hover:underline">
              Request an account
            </Link>{' '}
            instead.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">Everything included</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-500">
          Exactly which of these your school gets depends on your plan — see the full breakdown on the pricing page.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-5">
              <span aria-hidden="true" className="text-2xl">
                {f.icon}
              </span>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{f.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
