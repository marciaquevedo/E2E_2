import styles from './StatusBadge.module.css';
import type { TripStatus } from '../api/types';

const LABELS: Record<TripStatus, string> = {
  PENDING: 'Buscando conductor',
  IN_PROGRESS: 'En camino',
  COMPLETED: 'Completado',
};

const CLASS: Record<TripStatus, string> = {
  PENDING: styles.pending,
  IN_PROGRESS: styles.inProgress,
  COMPLETED: styles.completed,
};

export function StatusBadge({ status }: { status: TripStatus }) {
  return (
    <span className={`${styles.badge} ${CLASS[status]}`}>
      <span className={styles.dot} />
      {LABELS[status]}
    </span>
  );
}
