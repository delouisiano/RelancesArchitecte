import { updateSettings } from "@/modules/settings/actions";
import { getSettings } from "@/modules/settings/queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Parametres</p>
          <h2>Configuration</h2>
          <p>
            Les parametres fonctionnels sont stockes en base. Les secrets restent dans
            l&apos;environnement du VPS.
          </p>
        </div>
      </div>

      <form action={updateSettings} className="panel form-panel narrow">
        <label>
          Nom de l&apos;architecte
          <input name="architectName" defaultValue={settings?.architectName ?? ""} />
        </label>
        <label>
          Nom de l&apos;agence
          <input name="agencyName" defaultValue={settings?.agencyName ?? ""} />
        </label>
        <label>
          Email de notification
          <input
            name="architectEmail"
            type="email"
            required
            defaultValue={settings?.architectEmail ?? ""}
          />
        </label>
        <label>
          Delai de relance par defaut
          <input
            name="defaultReminderDays"
            type="number"
            min="1"
            required
            defaultValue={settings?.defaultReminderDays ?? 7}
          />
        </label>
        <label>
          Delai anti-spam notification, en heures
          <input
            name="notificationCooldown"
            type="number"
            min="1"
            required
            defaultValue={settings?.notificationCooldown ?? 24}
          />
        </label>
        <button className="button primary" type="submit">
          Enregistrer
        </button>
      </form>
    </section>
  );
}
