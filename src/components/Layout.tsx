import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Layout.module.css';
import { useAuth } from '../auth/AuthContext';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  const dashboardPath = user?.role === 'PASSENGER' ? '/passenger' : '/driver';

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          RUMBO<span className={styles.brandDot}>.</span>
        </div>

        {user && (
          <div className={styles.nav}>
            <NavLink
              to={dashboardPath}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              Panel
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              Historial
            </NavLink>

            <div className={styles.userArea}>
              <div className={styles.userChip}>
                <span className={styles.userName}>
                  {user.firstName} {user.lastName}
                </span>
                <span className={styles.userRole}>
                  {user.role === 'PASSENGER' ? 'PASAJERO' : 'CONDUCTOR'}
                </span>
              </div>
              <button className={styles.logoutBtn} onClick={logout}>
                Salir
              </button>
            </div>
          </div>
        )}
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
