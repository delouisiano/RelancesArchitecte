import { ReminderStatus } from "@/generated/prisma/enums";
import { getReminderStatusLabel } from "@/modules/reminders/status";

const metrics = [
  { label: "Dues aujourd'hui", value: 0 },
  { label: "En retard", value: 0 },
  { label: "A venir", value: 0 },
  { label: "Cloturees", value: 0 },
];

const statuses = [
  ReminderStatus.DUE,
  ReminderStatus.OVERDUE,
  ReminderStatus.UPCOMING,
  ReminderStatus.SENT,
];

export default function DashboardPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Tableau de bord</p>
          <h2>Priorites de relance</h2>
          <p>
            Point d&apos;entree de l&apos;application: les relances dues, en retard et a venir
            seront visibles ici des que les ecrans metier seront connectes a la base.
          </p>
        </div>
        <a className="button" href="/reminders">
          Voir les relances
        </a>
      </div>

      <div className="grid">
        {metrics.map((metric) => (
          <article className="panel metric" key={metric.label}>
            <span className="muted">{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <article className="panel">
        <h3>Statuts cibles</h3>
        <ul className="status-list">
          {statuses.map((status) => (
            <li key={status}>
              <span>{getReminderStatusLabel(status)}</span>
              <span className="muted">{status}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
