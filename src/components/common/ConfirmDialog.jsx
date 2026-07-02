import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'تأكيد', message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose}>إلغاء</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>تأكيد</Button>
      </div>
    </Modal>
  );
}
