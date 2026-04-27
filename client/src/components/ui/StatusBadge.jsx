import { STATUS_CONFIG } from '../../lib/constants';

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={`status-badge ${config.cls}`}>{config.label}</span>;
}
