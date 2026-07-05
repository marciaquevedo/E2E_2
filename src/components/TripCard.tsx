import { useNavigate } from 'react-router-dom';
import styles from './TripCard.module.css';
import { RouteLine } from './RouteLine';
import { StatusBadge } from './StatusBadge';
import type { Trip } from '../api/types';

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TripCard({
  trip,
  perspective,
}: {
  trip: Trip;
  /** Whose card this is being shown to — decides which counterparty name is displayed. */
  perspective: 'PASSENGER' | 'DRIVER';
}) {
  const navigate = useNavigate();
  const counterparty = perspective === 'PASSENGER' ? trip.driver : trip.passenger;
  const counterpartyLabel = perspective === 'PASSENGER' ? 'Conductor' : 'Pasajero';

  return (
    <button className={styles.card} onClick={() => navigate(`/trips/${trip.id}`)}>
      <div className={styles.header}>
        <span className={styles.tripId}>VIAJE #{trip.id}</span>
        <StatusBadge status={trip.status} />
      </div>

      <RouteLine pickup={trip.pickupAddress} dropoff={trip.dropoffAddress} />

      <div className={styles.footer}>
        <span className={styles.person}>
          {counterpartyLabel}:{' '}
          <span className={styles.personName}>
            {counterparty ? `${counterparty.firstName} ${counterparty.lastName}` : 'Por asignar'}
          </span>
        </span>
        <span className={styles.time}>{formatTime(trip.requestedAt)}</span>
      </div>
    </button>
  );
}
