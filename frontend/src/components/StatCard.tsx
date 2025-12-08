import styles from './StatCard.module.css';

type StatCardProps = {
  title: string;
  value: string;
  accent: 'primary' | 'amber' | 'green';
};

const accentClass: Record<StatCardProps['accent'], string> = {
  primary: styles.accentPrimary,
  amber: styles.accentAmber,
  green: styles.accentGreen
};

export function StatCard({ title, value, accent }: StatCardProps) {
  return (
    <div className={`${styles.card} ${accentClass[accent]}`}>
      <p className="muted small">{title}</p>
      <h3>{value}</h3>
    </div>
  );
}
