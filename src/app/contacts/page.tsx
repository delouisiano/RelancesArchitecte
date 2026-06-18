import { CreateDialog } from "@/components/create-dialog";
import { archiveContact, createContact } from "@/modules/contacts/actions";
import { listActiveContacts } from "@/modules/contacts/queries";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await listActiveContacts();

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Contacts</p>
          <h2>Artisans et entreprises</h2>
          <p>
            Les contacts artisans peuvent etre reutilises dans plusieurs relances et
            archives sans suppression destructive.
          </p>
        </div>
      </div>

      <div className="center-list">
        <article className="panel list-panel">
          <div className="section-title">
            <h3>Contacts actifs</h3>
            <span className="muted">{contacts.length} contact(s)</span>
          </div>
          {contacts.length === 0 ? (
            <p className="muted">Aucun contact actif pour le moment.</p>
          ) : (
            <ul className="record-list">
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <div>
                    <strong>{contact.name}</strong>
                    {contact.company ? <p>{contact.company}</p> : null}
                    <span className="muted">
                      {[contact.email, contact.phone].filter(Boolean).join(" · ") ||
                        "Aucune coordonnee"}
                    </span>
                    <span className="muted">
                      {contact._count.reminders} relance(s)
                    </span>
                  </div>
                  <form action={archiveContact}>
                    <input type="hidden" name="id" value={contact.id} />
                    <button className="button" type="submit">
                      Archiver
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <CreateDialog buttonLabel="Ajouter un contact" title="Nouveau contact">
        <form action={createContact} className="panel form-panel">
          <label>
            Nom
            <input name="name" required placeholder="Jean Martin" />
          </label>
          <label>
            Entreprise
            <input name="company" placeholder="Martin Couverture" />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="contact@example.fr" />
          </label>
          <label>
            Telephone
            <input name="phone" placeholder="06 00 00 00 00" />
          </label>
          <label>
            Notes
            <textarea name="notes" placeholder="Specialite, disponibilites, contexte" rows={4} />
          </label>
          <button className="button primary" type="submit">
            Creer le contact
          </button>
        </form>
      </CreateDialog>
    </section>
  );
}
