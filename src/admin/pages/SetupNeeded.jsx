import { Settings2 } from 'lucide-react'

export default function SetupNeeded() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5 py-10 text-bone">
      <div className="w-full max-w-xl border border-white/12 bg-coal p-8">
        <span className="grid size-12 place-items-center border border-gold/40 bg-gold/[0.06] text-gold">
          <Settings2 className="size-5" strokeWidth={1.6} aria-hidden="true" />
        </span>
        <h1 className="display mt-5 text-4xl leading-none">Backend not connected</h1>
        <p className="mt-4 text-sm leading-relaxed text-mist">
          The admin panel needs a Supabase project. Create a <code className="text-gold">.env</code> file in the project
          root with these two values, then restart the dev server (or rebuild):
        </p>
        <pre className="mt-5 overflow-x-auto border border-white/10 bg-ink p-4 text-xs leading-6 text-bone">{`VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key`}</pre>
        <p className="mt-4 text-xs leading-relaxed text-white/50">
          Use the public <strong>anon</strong> key only — never the service_role key. Full instructions are in
          SETUP.md.
        </p>
        <a href="/" className="mt-6 inline-flex border border-gold/50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-ink">
          Back to website
        </a>
      </div>
    </main>
  )
}
