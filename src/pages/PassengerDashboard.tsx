import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CarFront } from 'lucide-react';
import ui from '../components/ui.module.css';
import styles from '../components/TripCard.module.css';
import { TripCard } from '../components/TripCard';
import { useAuth } from '../auth/AuthContext';
import { apiClient, extractErrorMessage } from '../api/client';
import type { Trip } from '../api/types';

export function PassengerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<Trip[]>('/trips')
      .then(({ data }) => !cancelled && setTrips(data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  const activeTrip = trips?.find((t) => t.status !== 'COMPLETED');

  return (
    <div>
      <h1 className={ui.pageTitle}>Hola, {user?.firstName} 👋</h1>
      <p className={ui.pageSubtitle}>¿A dónde vamos hoy?</p>

      <button
        className={`${ui.btn} ${ui.btnPrimary} ${ui.btnFull}`}
        style={{ marginBottom: 28 }}
        onClick={() => navigate('/request-trip')}
      >
        <Plus size={16} />
        Pedir un viaje
      </button>

      {error && <div className={ui.errorBanner}>{error}</div>}

      <div className={ui.card}>
        <h2 className={ui.sectionTitle}>
          {activeTrip ? 'Viaje en curso' : 'Tus viajes'}
        </h2>

        {trips === null && !error && <div className={ui.emptyState}>Cargando…</div>}

        {trips !== null && trips.length === 0 && (
          <div className={ui.emptyState}>
            <CarFront size={28} className={ui.emptyIcon} />
            <div className={ui.emptyText}>Aún no has pedido ningún viaje.</div>
          </div>
        )}

        {trips !== null && trips.length > 0 && (
          <div className={styles.list}>
            {trips
              .slice()
              .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1))
              .map((trip) => (
                <TripCard key={trip.id} trip={trip} perspective="PASSENGER" />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
