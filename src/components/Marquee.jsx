const words = ['Strength', 'Discipline', 'Consistency', 'Confidence', 'Community', 'Respect']

function Group() {
  return (
    <div className="flex shrink-0 items-center">
      {words.map((word) => (
        <span key={word} className="flex items-center">
          <span className="display px-6 py-3.5 text-[19px] uppercase tracking-[0.08em] sm:px-8 sm:text-[22px]">
            {word}
          </span>
          <span className="text-[11px] opacity-60" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  return (
    <div
      className="marquee overflow-hidden border-y border-gold/25 bg-gold text-ink"
      aria-hidden="true"
    >
      <div className="marquee-track">
        <Group />
        <Group />
      </div>
    </div>
  )
}
