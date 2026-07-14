import { NavLink, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui';

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `text-sm font-semibold transition-colors ${isActive ? 'text-brand-700' : 'text-slate-600 hover:text-brand-700'}`;
}

export function Layout() {
  return (
    <div className="bg-mesh min-h-screen bg-slate-50">
      <header className="glass sticky top-0 z-30 border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-lg shadow-glow">
              🎓
            </span>
            <span className="text-gradient text-lg font-extrabold tracking-tight">School Management</span>
          </NavLink>
          <nav className="hidden items-center gap-6 sm:flex">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/pricing" className={navLinkClass}>
              Pricing
            </NavLink>
          </nav>
          <NavLink to="/request-account">
            <Button size="sm">Request an account</Button>
          </NavLink>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white/60 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-400 sm:px-6">
          © {new Date().getFullYear()} School Management. Built for schools that want everything in one place.
        </div>
      </footer>
    </div>
  );
}
