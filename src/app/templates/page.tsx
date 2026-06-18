import { CreateDialog } from "@/components/create-dialog";
import { archiveTemplate, createTemplate } from "@/modules/templates/actions";
import { listActiveTemplates } from "@/modules/templates/queries";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await listActiveTemplates();

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Modeles</p>
          <h2>Modeles de relance</h2>
          <p>
            Les modeles fournissent le sujet et le corps des messages, avec variables
            de projet, contact, date et note.
          </p>
        </div>
      </div>

      <div className="center-list">
        <article className="panel list-panel">
          <div className="section-title">
            <h3>Modeles actifs</h3>
            <span className="muted">{templates.length} modele(s)</span>
          </div>
          {templates.length === 0 ? (
            <p className="muted">Aucun modele actif pour le moment.</p>
          ) : (
            <ul className="record-list">
              {templates.map((template) => (
                <li key={template.id}>
                  <div>
                    <strong>{template.name}</strong>
                    <p>{template.subject}</p>
                    <span className="muted">{template.body.slice(0, 140)}</span>
                  </div>
                  <form action={archiveTemplate}>
                    <input type="hidden" name="id" value={template.id} />
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

      <CreateDialog buttonLabel="Ajouter un modele" title="Nouveau modele">
        <form action={createTemplate} className="panel form-panel">
          <label>
            Nom
            <input name="name" required placeholder="Relance devis" />
          </label>
          <label>
            Sujet
            <input name="subject" required placeholder="Relance - {{nomProjet}}" />
          </label>
          <label>
            Corps
            <textarea
              name="body"
              required
              rows={8}
              placeholder="Bonjour {{nomContact}}, ..."
            />
          </label>
          <p className="muted">
            Variables: {"{{nomProjet}}"}, {"{{nomContact}}"}, {"{{entrepriseContact}}"},
            {" {{echeance}}"}, {"{{note}}"}, {"{{nomArchitecte}}"}
          </p>
          <button className="button primary" type="submit">
            Creer le modele
          </button>
        </form>
      </CreateDialog>
    </section>
  );
}
