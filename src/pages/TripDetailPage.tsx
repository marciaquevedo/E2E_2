import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import ui from '../components/ui.module.css';
import styles from './TripDetailPage.module.css';
import { RouteLine } from '../components/RouteLine';
import { StatusBadge } from '../components/StatusBadge';
import { RatingStars, InlineRating } from '../components/RatingStars';
import { useAuth } from '../auth/AuthContext';
import { apiClient, extractErrorMessage } from '../api/client';
import type { Trip } from '../api/types';

const POLL_INTERVAL_MS = 4000;

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [ratingValue, setRatingValue] = useState(5);
  const [comment, setComment] = useState('');

  const fetchTrip = useCallback(async () => {
    try {
      const { data } = await apiClient.get<Trip>(`/trips/${id}`);
      setTrip(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, [id]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  const tripRef = useRef(trip);
  tripRef.current = trip;

  useEffect(() => {
    const shouldPoll = () => {
      const status = tripRef.current?.status;
      return status === 'PENDING' || status === 'IN_PROGRESS';
    };
    const interval = setInterval(() => {
      if (shouldPoll()) fetchTrip();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchTrip]);

  if (error) {
    return (
      <div>
        <BackLink navigate={navigate} />
        <div className={ui.errorBanner}>{error}</div>
      </div>
    );
  }

  if (!trip || !user) {
    return (
      <div>
        <BackLink navigate={navigate} />
        <div className={ui.emptyState}>Cargando viaje…</div>
      </div>
    );
  }

  const isPassenger = user.role === 'PASSENGER';
  const counterparty = isPassenger ? trip.driver : trip.passenger;
  const counterpartyLabel = isPassenger ? 'Conductor' : 'Pasajero';

  async function handleAccept() {
    setActionError(null);
    setActionLoading(true);
    try {
      const { data } = await apiClient.patch<Trip>(`/trips/${trip!.id}/accept`);
      setTrip(data);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleComplete() {
    setActionError(null);
    setActionLoading(true);
    try {
      const { data } = await apiClient.patch<Trip>(`/trips/${trip!.id}/complete`);
      setTrip(data);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRate() {
    setActionError(null);
    setActionLoading(true);
    try {
      const { data } = await apiClient.post<Trip>(`/trips/${trip!.id}/rate`, {
        rating: ratingValue,
        comment: comment || undefined,
      });
      setTrip(data);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <BackLink navigate={navigate} />

      <div className={styles.header}>
        <div>
          <h1 className={ui.pageTitle}>Viaje #{trip.id}</h1>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      <div className={ui.card} style={{ marginBottom: 16 }}>
        <h2 className={ui.sectionTitle}>Ruta</h2>
        <RouteLine pickup={trip.pickupAddress} dropoff={trip.dropoffAddress} />

        {(trip.status === 'PENDING' || trip.status === 'IN_PROGRESS') && (
          <div className={styles.pollNote}>
            <span className={styles.pollDot} />
            Actualizando automáticamente cada pocos segundos…
          </div>
        )}
      </div>

      <div className={ui.card} style={{ marginBottom: 16 }}>
        <h2 className={ui.sectionTitle}>{counterpartyLabel}</h2>

        {counterparty ? (
          <div className={styles.personRow}>
            <div className={styles.avatar}>
              {counterparty.firstName[0]}
              {counterparty.lastName[0]}
            </div>
            <div>
              <div className={styles.personName}>
                {counterparty.firstName} {counterparty.lastName}
              </div>
              {isPassenger && <InlineRating value={counterparty.rating} />}
            </div>
          </div>
        ) : (
          <div className={styles.waiting}>
            <Clock size={16} />
            Buscando conductor…
          </div>
        )}
      </div>

      <div className={ui.card} style={{ marginBottom: 16 }}>
        <h2 className={ui.sectionTitle}>Cronología</h2>
        <div className={styles.timeline}>
          <div className={styles.timelineRow}>
            <span>Solicitado</span>
            <span>{formatTime(trip.requestedAt)}</span>
          </div>
          <div className={styles.timelineRow}>
            <span>Aceptado</span>
            <span>{formatTime(trip.acceptedAt)}</span>
          </div>
          <div className={styles.timelineRow}>
            <span>Completado</span>
            <span>{formatTime(trip.completedAt)}</span>
          </div>
        </div>
      </div>

      {actionError && <div className={ui.errorBanner}>{actionError}</div>}

      {/* Driver: accept a pending trip */}
      {!isPassenger && trip.status === 'PENDING' && (
        <button
          className={`${ui.btn} ${ui.btnBlue} ${ui.btnFull}`}
          disabled={actionLoading}
          onClick={handleAccept}
        >
          {actionLoading ? <span className={ui.spinner} /> : 'Aceptar viaje'}
        </button>
      )}

      {/* Driver: complete an in-progress trip */}
      {!isPassenger && trip.status === 'IN_PROGRESS' && (
        <button
          className={`${ui.btn} ${ui.btnTeal} ${ui.btnFull}`}
          disabled={actionLoading}
          onClick={handleComplete}
        >
          {actionLoading ? <span className={ui.spinner} /> : 'Completar viaje'}
        </button>
      )}

      {/* Driver: summary after completion */}
      {!isPassenger && trip.status === 'COMPLETED' && (
        <div className={ui.card}>
          <div className={styles.ratingDone}>
            <CheckCircle2 size={18} color="var(--accent-teal)" />
            <span>
              Viaje completado
              {trip.passengerRating != null ? ` · calificado con ${trip.passengerRating}★` : ' · aún sin calificar'}
            </span>
          </div>
        </div>
      )}

      {/* Passenger: rating form once completed and unrated */}
      {isPassenger && trip.status === 'COMPLETED' && trip.passengerRating == null && (
        <div className={ui.card}>
          <h2 className={ui.sectionTitle}>Califica tu viaje</h2>
          <div style={{ marginBottom: 16 }}>
            <RatingStars value={ratingValue} onChange={setRatingValue} />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Comentario (opcional)</label>
            <input
              className={ui.input}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Cómo estuvo el viaje?"
            />
          </div>
          <button
            className={`${ui.btn} ${ui.btnPrimary} ${ui.btnFull}`}
            disabled={actionLoading}
            onClick={handleRate}
          >
            {actionLoading ? <span className={ui.spinner} /> : 'Enviar calificación'}
          </button>
        </div>
      )}

      {/* Passenger: already rated */}
      {isPassenger && trip.status === 'COMPLETED' && trip.passengerRating != null && (
        <div className={ui.card}>
          <h2 className={ui.sectionTitle}>Tu calificación</h2>
          <div className={styles.ratingDone}>
            <RatingStars value={trip.passengerRating} readOnly />
          </div>
          {trip.ratingComment && <div className={styles.ratingComment}>"{trip.ratingComment}"</div>}
        </div>
      )}
    </div>
  );
}

function BackLink({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <button className={styles.backLink} onClick={() => navigate(-1)}>
      <ArrowLeft size={15} /> Volver
    </button>
  );
}
