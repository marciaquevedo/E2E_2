import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History } from 'lucide-react';
import ui from '../components/ui.module.css';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../auth/AuthContext';
import { apiClient, extractErrorMessage } from '../api/client';
import type { Trip, TripStatus } from '../api/types';

const FILTERS: Array<{ label: string; value: TripStatus | 'ALL' }> = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendiente', value: 'PENDING' },
  { label: 'En curso', value: 'IN_PROGRESS' },
  { label: 'Completado', value: 'COMPLETED' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TripStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (!user) return;
    const endpoint = user.role === 'PASSENGER' ? '/trips' : '/trips/my';
    apiClient
      .get<Trip[]>(endpoint)
      .then(({ data }) => setTrips(data))
      .catch((err) => setError(extractErrorMessage(err)));
  }, [user]);

  const isPassenger = user?.role === 'PASSENGER';
  const filtered = (trips ?? [])
    .filter((t) => filter === 'ALL' || t.status === filter)
    .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));

  return (
    <div>
      <h1 className={ui.pageTitle}>Historial</h1>
      <p className={ui.pageSubtitle}>Todos tus viajes, en un solo lugar.</p>

      <div className={ui.filterRow}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`${ui.filterChip} ${filter === f.value ? ui.filterChipActive : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className={ui.errorBanner}>{error}</div>}

      <div className={ui.card} style={{ padding: trips && filtered.length > 0 ? 8 : 22 }}>
        {trips === null && !error && <div className={ui.emptyState}>Cargando…</div>}

        {trips !== null && filtered.length === 0 && (
          <div className={ui.emptyState}>
            <History size={26} className={ui.emptyIcon} />
            <div className={ui.emptyText}>No hay viajes con este filtro.</div>
          </div>
        )}

        {filtered.length > 0 && (
          <table className={ui.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Ruta</th>
                <th>{isPassenger ? 'Conductor' : 'Pasajero'}</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trip) => {
                const counterparty = isPassenger ? trip.driver : trip.passenger;
                return (
                  <tr
                    key={trip.id}
                    className={ui.tableRowLink}
                    onClick={() => navigate(`/trips/${trip.id}`)}
                  >
                    <td className={ui.mono}>#{trip.id}</td>
                    <td>
                      {trip.pickupAddress} → {trip.dropoffAddress}
                    </td>
                    <td>{counterparty ? `${counterparty.firstName} ${counterparty.lastName}` : '—'}</td>
                    <td className={ui.mono}>{formatDate(trip.requestedAt)}</td>
                    <td>
                      <StatusBadge status={trip.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
