import { useState } from 'react';
import styles from './RatingStars.module.css';

export function RatingStars({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value;

  return (
    <div className={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          className={`${styles.star} ${n <= active ? styles.filled : ''} ${
            readOnly ? styles.readOnly : ''
          }`}
          onMouseEnter={() => !readOnly && setHovered(n)}
          onMouseLeave={() => !readOnly && setHovered(null)}
          onClick={() => onChange?.(n)}
          aria-label={`${n} estrellas`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/** Compact inline rating display, e.g. for a driver's average rating. */
export function InlineRating({ value }: { value: number }) {
  return (
    <span className={styles.inline}>
      <span className={styles.starChar}>★</span>
      {value.toFixed(1)}
    </span>
  );
}
