import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import ui from '../components/ui.module.css';
import cardStyles from '../components/TripCard.module.css';
import { TripCard } from '../components/TripCard';
import { RouteLine } from '../components/RouteLine';
import { InlineRating } from '../components/RatingStars';
import { useAuth } from '../auth/AuthContext';
import { apiClient, extractErrorMessage } from '../api/client';
import type { Trip } from '../api/types';

export function DriverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState<Trip[] | null>(null);
  const [mine, setMine] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  const load = useCallback(() => {
    Promise.all([apiClient.get<Trip[]>('/trips/pending'), apiClient.get<Trip[]>('/trips/my')])
      .then(([pendingRes, mineRes]) => {
        setPending(pendingRes.data);
        setMine(mineRes.data);
      })
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeTrip = mine?.find((t) => t.status === 'IN_PROGRESS');

  async function handleAccept(tripId: number) {
    setAcceptingId(tripId);
    setError(null);
    try {
      await apiClient.patch(`/trips/${tripId}/accept`);
      navigate(`/trips/${tripId}`);
    } catch (err) {
      setError(extractErrorMessage(err));
      setAcceptingId(null);
    }
  }

  return (
    <div>
      <h1 className={ui.pageTitle}>Hola, {user?.firstName} 👋</h1>
      <p className={ui.pageSubtitle}>
        Tu rating actual: <InlineRating value={user?.rating ?? 0} />
        {' · '}
        {user?.available ? 'Disponible para viajes' : 'En un viaje activo'}
      </p>

      {error && <div className={ui.errorBanner}>{error}</div>}

      {activeTrip && (
        <div
          className={ui.card}
          style={{ marginBottom: 24, borderColor: 'var(--accent-blue)' }}
        >
          <h2 className={ui.sectionTitle}>Viaje activo</h2>
          <RouteLine pickup={activeTrip.pickupAddress} dropoff={activeTrip.dropoffAddress} />
          <button
            className={`${ui.btn} ${ui.btnBlue} ${ui.btnFull}`}
            style={{ marginTop: 18 }}
            onClick={() => navigate(`/trips/${activeTrip.id}`)}
          >
            Ir al viaje · Completar
          </button>
        </div>
      )}

      <div className={ui.card}>
        <h2 className={ui.sectionTitle}>
          Viajes disponibles {pending ? `(${pending.length})` : ''}
        </h2>

        {pending === null && !error && <div className={ui.emptyState}>Cargando…</div>}

        {pending !== null && pending.length === 0 && (
          <div className={ui.emptyState}>
            <Inbox size={26} className={ui.emptyIcon} />
            <div className={ui.emptyText}>No hay viajes pendientes por ahora.</div>
          </div>
        )}

        {pending !== null && pending.length > 0 && (
          <div className={cardStyles.list}>
            {pending.map((trip) => (
              <div key={trip.id} className={ui.card} style={{ padding: '14px 16px' }}>
                <RouteLine pickup={trip.pickupAddress} dropoff={trip.dropoffAddress} />
                <button
                  className={`${ui.btn} ${ui.btnPrimary} ${ui.btnFull}`}
                  style={{ marginTop: 14 }}
                  disabled={acceptingId === trip.id || !user?.available}
                  onClick={() => handleAccept(trip.id)}
                >
                  {acceptingId === trip.id ? <span className={ui.spinner} /> : 'Aceptar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {mine && mine.filter((t) => t.status === 'COMPLETED').length > 0 && (
        <div className={ui.card} style={{ marginTop: 20 }}>
          <h2 className={ui.sectionTitle}>Completados recientes</h2>
          <div className={cardStyles.list}>
            {mine
              .filter((t) => t.status === 'COMPLETED')
              .slice(0, 3)
              .map((trip) => (
                <TripCard key={trip.id} trip={trip} perspective="DRIVER" />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
