import { CateringList } from '../components/catering/CateringList';
import { ToastContainer, useToast } from '../components/ui/Toast';

export function CateringPage() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Catering Management</h1>
        <p className="mt-1 text-sm text-gray-400">
          Kelola pesanan catering/partai besar. Status hanya bisa maju:
          Pending → Confirmed → Done.
        </p>
      </div>

      <CateringList />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
