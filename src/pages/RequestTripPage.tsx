import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserRound } from 'lucide-react';
import ui from '../components/ui.module.css';
import styles from './RequestTripPage.module.css';
import { InlineRating } from '../components/RatingStars';
import { apiClient, extractErrorMessage } from '../api/client';
import type { CreateTripPayload, Trip, User } from '../api/types';

export function RequestTripPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<User[] | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<User[]>('/drivers/available')
      .then(({ data }) => setDrivers(data))
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: CreateTripPayload = { pickupAddress, dropoffAddress };
      const { data } = await apiClient.post<Trip>('/trips', payload);
      navigate(`/trips/${data.id}`);
    } catch (err) {
      setError(extractErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div>
      <a className={styles.backLink} onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> Volver
      </a>

      <h1 className={ui.pageTitle}>Pedir un viaje</h1>
      <p className={ui.pageSubtitle}>Cuéntanos dónde recogerte y a dónde vas.</p>

      <div className={ui.card} style={{ marginBottom: 20 }}>
        <h2 className={ui.sectionTitle}>
          Conductores disponibles {drivers ? `(${drivers.length})` : ''}
        </h2>

        {drivers === null && !error && <div className={ui.emptyState}>Buscando conductores…</div>}

        {drivers !== null && drivers.length === 0 && (
          <div className={ui.emptyState}>
            <UserRound size={26} className={ui.emptyIcon} />
            <div className={ui.emptyText}>No hay conductores disponibles ahora mismo.</div>
          </div>
        )}

        {drivers !== null &&
          drivers.map((d) => (
            <div key={d.id} className={styles.driverRow}>
              <div className={styles.avatar}>
                {d.firstName[0]}
                {d.lastName[0]}
              </div>
              <div className={styles.driverInfo}>
                <div className={styles.driverName}>
                  {d.firstName} {d.lastName}
                </div>
              </div>
              <InlineRating value={d.rating} />
            </div>
          ))}
      </div>

      <div className={ui.card}>
        {error && <div className={ui.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={ui.field}>
            <label className={ui.label}>Recojo</label>
            <input
              className={ui.input}
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Ej. Av. Javier Prado 100"
              required
            />
          </div>
          <div className={ui.field}>
            <label className={ui.label}>Destino</label>
            <input
              className={ui.input}
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              placeholder="Ej. Miraflores, Lima"
              required
            />
          </div>
          <button className={`${ui.btn} ${ui.btnPrimary} ${ui.btnFull}`} disabled={loading}>
            {loading ? <span className={ui.spinner} /> : 'Confirmar viaje'}
          </button>
        </form>
      </div>
    </div>
  );
}
