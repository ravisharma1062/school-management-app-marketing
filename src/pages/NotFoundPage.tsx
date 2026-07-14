import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <span aria-hidden="true" className="text-4xl">
        🧭
      </span>
      <h1 className="text-xl font-bold text-slate-800">Page not found</h1>
      <Link to="/">
        <Button variant="secondary">Back home</Button>
      </Link>
    </div>
  );
}
