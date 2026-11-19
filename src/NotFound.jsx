import { ArrowLeft } from 'lucide-react'
export default function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-ink px-6 text-center text-bone"><div><p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Gentleman Gym</p><p className="display mt-5 text-8xl">404</p><h1 className="mt-4 text-xl font-semibold">This page isn't on the training floor.</h1><p className="mt-3 text-sm text-mist">The page may have moved, or the address may be incorrect.</p><a href="/" className="mt-8 inline-flex items-center gap-2 border border-gold/50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-gold hover:bg-gold hover:text-ink"><ArrowLeft className="size-4"/> Back to home</a></div></main>
}
