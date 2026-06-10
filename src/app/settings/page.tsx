export default function SettingsPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Parametres</p>
          <h2>Configuration</h2>
          <p>
            Les parametres fonctionnels seront stockes en base. Les secrets resteront
            dans l&apos;environnement du VPS, car une fuite SMTP est rarement un hobby.
          </p>
        </div>
      </div>
    </section>
  );
}
