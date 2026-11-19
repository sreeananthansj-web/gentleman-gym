import { cx } from '../../lib/cx'

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  titleClassName,
  descriptionClassName,
  as: Heading = 'h2',
}) {
  return (
    <div
      className={cx(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading
        className={cx(
          'display section-title mt-5 text-bone',
          titleClassName,
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cx(
            'mt-6 max-w-2xl text-[15px] leading-relaxed text-mist',
            align === 'center' && 'mx-auto',
            descriptionClassName,
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
