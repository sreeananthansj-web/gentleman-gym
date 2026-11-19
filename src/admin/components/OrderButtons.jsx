import { ArrowDown, ArrowUp } from 'lucide-react'
import { IconBtn } from './ui'

/** Up / down arrows for changing display order within a list. */
export default function OrderButtons({ index, total, onMove, disabled }) {
  return (
    <div className="flex">
      <IconBtn label="Move up" icon={ArrowUp} disabled={disabled || index === 0} onClick={() => onMove(index, -1)} />
      <IconBtn label="Move down" icon={ArrowDown} disabled={disabled || index === total - 1} onClick={() => onMove(index, 1)} />
    </div>
  )
}
