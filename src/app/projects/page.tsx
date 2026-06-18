import { CreateDialog } from "@/components/create-dialog";
import { archiveProject, createProject } from "@/modules/projects/actions";
import { listActiveProjects } from "@/modules/projects/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await listActiveProjects();

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Projets</p>
          <h2>Dossiers suivis</h2>
          <p>
            Les projets regroupent les relances et donnent le contexte chantier ou
            mission a chaque suivi artisan.
          </p>
        </div>
      </div>

      <div className="center-list">
        <article className="panel list-panel">
          <div className="section-title">
            <h3>Projets actifs</h3>
            <span className="muted">{projects.length} projet(s)</span>
          </div>
          {projects.length === 0 ? (
            <p className="muted">Aucun projet actif pour le moment.</p>
          ) : (
            <ul className="record-list">
              {projects.map((project) => (
                <li key={project.id}>
                  <div>
                    <strong>{project.name}</strong>
                    {project.description ? <p>{project.description}</p> : null}
                    <span className="muted">
                      {project._count.reminders} relance(s)
                    </span>
                  </div>
                  <form action={archiveProject}>
                    <input type="hidden" name="id" value={project.id} />
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

      <CreateDialog buttonLabel="Ajouter un projet" title="Nouveau projet">
        <form action={createProject} className="panel form-panel">
          <label>
            Nom
            <input name="name" required placeholder="Maison Dupont" />
          </label>
          <label>
            Description
            <textarea
              name="description"
              placeholder="Contexte, adresse ou phase du dossier"
              rows={4}
            />
          </label>
          <button className="button primary" type="submit">
            Creer le projet
          </button>
        </form>
      </CreateDialog>
    </section>
  );
}
