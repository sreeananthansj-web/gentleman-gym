import { Btn } from './ui'
import Modal from './Modal'

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      title={title}
      size="sm"
      busy={busy}
      onClose={onCancel}
      footer={
        <>
          <Btn variant="outline" onClick={onCancel} disabled={busy} data-autofocus>
            Cancel
          </Btn>
          <Btn variant="danger" onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Btn>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-mist">{message}</p>
    </Modal>
  )
}
