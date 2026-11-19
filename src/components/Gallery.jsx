import { ArrowUpRight } from 'lucide-react'
import { gallery } from '../data/site'
import useRemoteContent from '../hooks/useRemoteContent'
import { listPublicGallery } from '../services/galleryService'
import Reveal from './ui/Reveal'
import SectionHeading from './ui/SectionHeading'

export default function Gallery() {
  const { items, status } = useRemoteContent('gallery', listPublicGallery, gallery)

  return (
    <section id="gallery" className="section-pad relative overflow-hidden bg-ink">
      <div className="shell">
        <Reveal>
          <SectionHeading
            eyebrow="Inside Gentleman Gym"
            title={<>OUR SPACE. <span className="text-gold">OUR JOURNEY.</span></>}
            description="A look inside our gym, plus real moments from bodybuilding competitions and achievements."
          />
        </Reveal>

        {status === 'loading' && (
          <div role="status" aria-label="Loading gallery" className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((n) => <div key={n} className="aspect-[4/5] animate-pulse border border-white/10 bg-coal" />)}
          </div>
        )}

        {status !== 'loading' && items.length === 0 && (
          <p className="mt-10 border border-white/10 bg-coal/60 p-8 text-center text-sm leading-relaxed text-mist sm:mt-14">
            New photos are on the way. Visit the gym or message us on WhatsApp to see the floor for yourself.
          </p>
        )}

        {items.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5 lg:grid-cols-3">
            {items.map((item, index) => (
              <Reveal key={item.id ?? item.image} delay={(index % 6) * 70}>
                <article className="group relative isolate aspect-[4/5] overflow-hidden border border-white/10 bg-coal">
                  <img src={item.image} alt={item.alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" aria-hidden="true" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                    {item.category && <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">{item.category}</p>}
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <h3 className="display text-lg leading-tight text-bone sm:text-2xl">{item.title}</h3>
                      <ArrowUpRight className="mb-1 size-4 shrink-0 text-gold" aria-hidden="true" />
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
