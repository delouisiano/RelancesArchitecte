import { getSystemHealth, type HealthStatus } from "@/modules/system/health";

export const dynamic = "force-dynamic";

const labels: Record<HealthStatus, string> = {
  ok: "OK",
  warning: "Attention",
  error: "Erreur",
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function HealthPage() {
  const health = await getSystemHealth();

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Exploitation</p>
          <h2>Sante de l&apos;application</h2>
          <p>Controle rapide de la base, de la configuration et des notifications.</p>
        </div>
        <span className={`badge status-${health.summary}`}>{labels[health.summary]}</span>
      </div>

      <article className="panel">
        <h3>Dernier controle</h3>
        <p className="muted">{formatDateTime(health.checkedAt)}</p>
      </article>

      <ul className="health-list">
        {health.checks.map((check) => (
          <li className="panel health-item" key={check.label}>
            <div>
              <strong>{check.label}</strong>
              <p>{check.message}</p>
            </div>
            <span className={`badge status-${check.status}`}>{labels[check.status]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
