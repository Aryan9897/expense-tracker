type StatCardProps = {
  title: string;
  value: string;
  accent: 'primary' | 'amber' | 'green';
};

export function StatCard({ title, value, accent }: StatCardProps) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <p className="muted small">{title}</p>
      <h3>{value}</h3>
    </div>
  );
}
