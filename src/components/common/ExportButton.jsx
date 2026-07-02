import { useState } from 'react';
import { Download } from 'lucide-react';
import Button from './Button';
import PermissionGate from './PermissionGate';

export default function ExportButton({ onExport, filename, permission = 'reports.export' }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport(filename);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGate permission={permission}>
      <Button variant="outline" onClick={handleExport} loading={loading} className="gap-2">
        <Download size={16} />
        تصدير CSV
      </Button>
    </PermissionGate>
  );
}
