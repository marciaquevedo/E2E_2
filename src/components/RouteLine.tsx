import styles from './RouteLine.module.css';

export function RouteLine({
  pickup,
  dropoff,
}: {
  pickup: string;
  dropoff: string;
}) {
  return (
    <div className={styles.route}>
      <div className={styles.markers}>
        <span className={styles.pin} />
        <span className={styles.thread} />
        <span className={`${styles.pin} ${styles.pinEnd}`} />
      </div>
      <div className={styles.stops}>
        <div>
          <div className={styles.stopLabel}>Origen</div>
          <div className={styles.stopAddress}>{pickup}</div>
        </div>
        <div>
          <div className={styles.stopLabel}>Destino</div>
          <div className={styles.stopAddress}>{dropoff}</div>
        </div>
      </div>
    </div>
  );
}
