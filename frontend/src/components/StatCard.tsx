import { ReactNode } from 'react';
import styles from './StatCard.module.css';

type StatCardProps = {
  title: string;
  value: string;
  accent: 'primary' | 'amber' | 'green';
  icon?: ReactNode;
};

const accentClass: Record<StatCardProps['accent'], string> = {
  primary: styles.accentPrimary,
  amber: styles.accentAmber,
  green: styles.accentGreen
};

export function StatCard({ title, value, accent, icon }: StatCardProps) {
  return (
    <div className={`${styles.card} ${accentClass[accent]}`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <h3 className={styles.value}>{value}</h3>
      </div>
    </div>
  );
}
