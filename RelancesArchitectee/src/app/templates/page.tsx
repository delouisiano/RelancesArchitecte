import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/reminders";

export default async function TemplatesPage() {
  const templates = await prisma.mailTemplate.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)] md:px-10 md:py-14">
      <div className="mx-auto grid max-w-6xl gap-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-4">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[var(--muted)]">Templates mail</p>
            <div className="grid gap-3">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
                Préparer des mails de relance réutilisables, histoire d’éviter de réécrire la même chose jusqu’à la fin des temps.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-[var(--soft)]">
                Cette page liste les modèles de mails, permet d’en créer un nouveau, d’en modifier un existant, ou de s’en servir comme base pour une variante.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-black/20">
              Retour aux rappels
            </Link>
            <a href="#create-template" className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-92">
              Nouveau template
            </a>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Templates enregistrés</h2>
              <p className="text-sm leading-6 text-[var(--soft)]">
                Garde tes formulations utiles ici. Au moins un truc dans ce monde peut être réutilisé sans souffrance.
              </p>
            </div>
            <div className="rounded-full bg-[var(--field)] px-4 py-2 text-sm text-[var(--soft)]">
              {templates.length} template{templates.length > 1 ? "s" : ""}
            </div>
          </div>

          {templates.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-[var(--field)] px-6 py-10 text-sm text-[var(--soft)]">
              Aucun template pour le moment. Clique sur le bouton et corrige cette absence de civilisation.
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => {
                const editModalId = `edit-template-${template.id}`;
                const duplicateModalId = `duplicate-template-${template.id}`;

                return (
                  <article key={template.id} className="rounded-[1.5rem] border border-black/8 bg-[var(--field)] p-5 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="grid gap-3 flex-1">
                        <div className="grid gap-1">
                          <h3 className="text-xl font-semibold">{template.title}</h3>
                          <p className="text-sm text-[var(--soft)]">
                            Modifié le {formatDate(template.updatedAt)}
                          </p>
                        </div>
                        <pre className="whitespace-pre-wrap rounded-[1.25rem] border border-black/8 bg-white px-4 py-4 text-sm leading-6 text-[var(--foreground)]">
                          {template.body}
                        </pre>
                      </div>

                      <div className="flex flex-wrap gap-3 md:justify-end">
                        <a href={`#${editModalId}`} className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-black/20">
                          Éditer
                        </a>
                        <a href={`#${duplicateModalId}`} className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-92">
                          Utiliser comme base
                        </a>
                      </div>
                    </div>

                    <div id={editModalId} className="modal-overlay">
                      <div className="modal-card modal-card-wide">
                        <div className="mb-6 flex items-start justify-between gap-4">
                          <div className="text-left">
                            <h3 className="text-xl font-semibold">Éditer le template</h3>
                            <p className="mt-2 text-sm leading-6 text-[var(--soft)]">
                              Tu modifies le titre et le corps du mail, puis tu enregistres. Rien de mystique, juste utile.
                            </p>
                          </div>
                          <a href="#" className="modal-close" aria-label="Fermer la fenêtre">×</a>
                        </div>

                        <form action="/templates/submit" method="post" className="grid gap-4 text-left">
                          <input type="hidden" name="intent" value="update" />
                          <input type="hidden" name="id" value={template.id} />

                          <div className="grid gap-2">
                            <label htmlFor={`${editModalId}-title`} className="text-sm font-medium">Titre</label>
                            <input id={`${editModalId}-title`} name="title" defaultValue={template.title} required className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30" />
                          </div>

                          <div className="grid gap-2">
                            <label htmlFor={`${editModalId}-body`} className="text-sm font-medium">Corps du mail</label>
                            <textarea id={`${editModalId}-body`} name="body" rows={14} defaultValue={template.body} required className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30" />
                          </div>

                          <div className="mt-2 flex justify-end">
                            <button type="submit" className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-92">
                              Enregistrer les modifications
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>

                    <div id={duplicateModalId} className="modal-overlay">
                      <div className="modal-card modal-card-wide">
                        <div className="mb-6 flex items-start justify-between gap-4">
                          <div className="text-left">
                            <h3 className="text-xl font-semibold">Créer une variante</h3>
                            <p className="mt-2 text-sm leading-6 text-[var(--soft)]">
                              On part de ce template comme référence, puis on l’ajuste pour en créer un nouveau fichier. Oui, enfin quelque chose qui évite le copier-coller débile.
                            </p>
                          </div>
                          <a href="#" className="modal-close" aria-label="Fermer la fenêtre">×</a>
                        </div>

                        <form action="/templates/submit" method="post" className="grid gap-4 text-left">
                          <input type="hidden" name="intent" value="duplicate" />
                          <input type="hidden" name="sourceId" value={template.id} />

                          <div className="grid gap-2">
                            <label htmlFor={`${duplicateModalId}-title`} className="text-sm font-medium">Titre du nouveau template</label>
                            <input id={`${duplicateModalId}-title`} name="title" defaultValue={`${template.title} (variante)`} required className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30" />
                          </div>

                          <div className="grid gap-2">
                            <label htmlFor={`${duplicateModalId}-body`} className="text-sm font-medium">Corps du mail</label>
                            <textarea id={`${duplicateModalId}-body`} name="body" rows={14} defaultValue={template.body} required className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30" />
                          </div>

                          <div className="mt-2 flex justify-end">
                            <button type="submit" className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-92">
                              Créer le nouveau template
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div id="create-template" className="modal-overlay">
        <div className="modal-card modal-card-wide">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="text-left">
              <h3 className="text-xl font-semibold">Nouveau template de mail</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--soft)]">
                Donne-lui un titre, écris le corps du mail, et il apparaîtra dans la liste. Tu vois, même les logiciels peuvent parfois faire ce qu’on leur demande.
              </p>
            </div>
            <a href="#" className="modal-close" aria-label="Fermer la fenêtre">×</a>
          </div>

          <form action="/templates/submit" method="post" className="grid gap-4 text-left">
            <input type="hidden" name="intent" value="create" />

            <div className="grid gap-2">
              <label htmlFor="create-template-title" className="text-sm font-medium">Titre</label>
              <input id="create-template-title" name="title" required className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30" />
            </div>

            <div className="grid gap-2">
              <label htmlFor="create-template-body" className="text-sm font-medium">Corps du mail</label>
              <textarea id="create-template-body" name="body" rows={14} required className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30" />
            </div>

            <div className="mt-2 flex justify-end">
              <button type="submit" className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-92">
                Créer le template
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
