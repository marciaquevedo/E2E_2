import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import ui from '../components/ui.module.css';
import { useAuth } from '../auth/AuthContext';
import { extractErrorMessage } from '../api/client';
import type { Role } from '../api/types';

export function LoginPage() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('PASSENGER');

  if (user) {
    return <Navigate to={user.role === 'PASSENGER' ? '/passenger' : '/driver'} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loggedInUser =
        mode === 'login'
          ? await login({ email, password })
          : await register({ firstName, lastName, email, password, role });
      window.location.href = loggedInUser.role === 'PASSENGER' ? '/passenger' : '/driver';
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <div className={styles.logo}>
          RUMBO<span className={styles.logoDot}>.</span>
        </div>
        <p className={styles.tagline}>Viajes a demanda para pasajeros y conductores</p>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => setMode('login')}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
            onClick={() => setMode('register')}
          >
            Crear cuenta
          </button>
        </div>

        {error && <div className={ui.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className={styles.row2}>
                <div className={ui.field}>
                  <label className={ui.label}>Nombre</label>
                  <input
                    className={ui.input}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className={ui.field}>
                  <label className={ui.label}>Apellido</label>
                  <input
                    className={ui.input}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={ui.field}>
                <label className={ui.label}>Quiero usar RUMBO como</label>
                <div className={ui.roleSelect}>
                  <button
                    type="button"
                    className={`${ui.roleOption} ${role === 'PASSENGER' ? ui.roleOptionActive : ''}`}
                    onClick={() => setRole('PASSENGER')}
                  >
                    Pasajero
                  </button>
                  <button
                    type="button"
                    className={`${ui.roleOption} ${role === 'DRIVER' ? ui.roleOptionActive : ''}`}
                    onClick={() => setRole('DRIVER')}
                  >
                    Conductor
                  </button>
                </div>
              </div>
            </>
          )}

          <div className={ui.field}>
            <label className={ui.label}>Correo</label>
            <input
              className={ui.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className={ui.field}>
            <label className={ui.label}>Contraseña</label>
            <input
              className={ui.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <button className={`${ui.btn} ${ui.btnPrimary} ${ui.btnFull}`} disabled={loading}>
            {loading ? (
              <span className={ui.spinner} />
            ) : mode === 'login' ? (
              'Iniciar sesión'
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <p className={styles.hint}>
          Prueba con carlos@uber.com / pass123 (conductor) o ana@uber.com / pass123 (pasajero)
        </p>
      </div>
    </div>
  );
}
