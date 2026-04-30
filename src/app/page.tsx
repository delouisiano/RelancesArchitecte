import { deleteReminder, updateReminder } from "@/app/actions";
import { randomUUID } from "crypto";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { addDays, formatDate, getStatusLabel, getStatusTone, isOverdue } from "@/lib/reminders";
import { ReminderStatus } from "../generated/prisma/enums";
import { redirect } from "next/navigation";

async function createReminder(formData: FormData) {
  "use server";

  const projectName = String(formData.get("projectName") || "").trim();
  const chantierName = String(formData.get("chantierName") || "").trim();
  const artisanContact = String(formData.get("artisanContact") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const templateId = String(formData.get("templateId") || "").trim();
  const followUpDelayDays = Number(formData.get("followUpDelayDays"));

  if (!projectName || !chantierName || !artisanContact || !Number.isFinite(followUpDelayDays)) {
    redirect("/?error=invalid");
  }

  const since = new Date(Date.now() - 2 * 60 * 1000);
  const existing = await prisma.reminder.findFirst({
    where: {
      projectName,
      chantierName,
      artisanContact,
      followUpDelayDays,
      note: note || null,
      templateId: templateId || null,
      createdAt: { gte: since },
    },
  });

  if (!existing) {
    await prisma.reminder.create({
      data: {
        projectName,
        chantierName,
        artisanName: artisanContact,
        artisanContact,
        note: note || null,
        templateId: templateId || null,
        followUpDelayDays,
        dueAt: addDays(new Date(), followUpDelayDays),
      },
    });
  }

  redirect("/");
}

async function createChantier(formData: FormData) {
  "use server";

  const chantierName = String(formData.get("chantierName") || "").trim();

  if (!chantierName) {
    redirect("/?error=invalid-chantier");
  }

  const existing = await prisma.reminder.findFirst({
    where: {
      chantierName,
    },
  });

  if (!existing) {
    await prisma.reminder.create({
      data: {
        id: randomUUID(),
        chantierName,
        projectName: "Relance à définir",
        artisanName: "À définir",
        artisanContact: "À définir",
        followUpDelayDays: 7,
        dueAt: addDays(new Date(), 7),
        note: "Chantier créé depuis le tableau de bord. Pense à remplacer cette relance provisoire.",
      },
    });
  }

  redirect(`/#chantier-${chantierName.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`);
}

const statusOptions = [ReminderStatus.PENDING, ReminderStatus.DONE, ReminderStatus.RESPONDED, ReminderStatus.ABANDONED];

export default async function Home() {
  const [reminders, templates] = await Promise.all([
    prisma.reminder.findMany({ orderBy: [{ dueAt: "asc" }] }),
    prisma.mailTemplate.findMany({ orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }] }),
  ]);

  const chantierOptions = Array.from(new Set(reminders.map((reminder) => (reminder.chantierName || "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

  const sortedReminders = [...reminders].sort((a, b) => ((a.chantierName || "").localeCompare(b.chantierName || "", "fr", { sensitivity: "base" }) || a.dueAt.getTime() - b.dueAt.getTime()));

  const chantierSummaries = Array.from(
    sortedReminders.reduce((map, reminder) => {
      const chantierKey = (reminder.chantierName || "").trim() || "Sans chantier";
      const current = map.get(chantierKey) ?? {
        name: chantierKey,
        reminders: [] as typeof reminders,
      };
      current.reminders.push(reminder);
      map.set(chantierKey, current);
      return map;
    }, new Map<string, { name: string; reminders: typeof reminders }>() ).values(),
  ).map(({ name, reminders: chantierReminders }) => {
    const pendingCount = chantierReminders.filter((reminder) => reminder.status === ReminderStatus.PENDING).length;
    const overdueCount = chantierReminders.filter((reminder) => isOverdue(reminder.dueAt, reminder.status)).length;
    const nextDue = chantierReminders
      .filter((reminder) => reminder.status === ReminderStatus.PENDING)
      .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())[0]?.dueAt ?? chantierReminders[0]?.dueAt;

    return {
      name,
      reminders: chantierReminders,
      count: chantierReminders.length,
      pendingCount,
      overdueCount,
      nextDue,
    };
  });

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)] md:px-10 md:py-14">
      <div className="page-switch-shell">
        <nav className="page-switch" aria-label="Navigation principale">
          <Link href="/" className="page-switch__link page-switch__link--active" aria-current="page">
            Rappels
          </Link>
          <Link href="/templates" className="page-switch__link">
            Templates
          </Link>
        </nav>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8">
        <section className="grid gap-4 text-center">
          <div className="grid gap-4">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[var(--muted)]">Suivi des relances</p>
            <h1 className="mx-auto max-w-4xl text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
              Gestion des rappels artisans
            </h1>
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 grid gap-2">
            <h2 className="text-2xl font-semibold">Nouveau rappel</h2>
          </div>

          <form action={createReminder} method="post" className="grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="chantierName" className="text-sm font-medium text-[var(--foreground)]">
                Chantier
              </label>
              <select
                id="chantierName"
                name="chantierName"
                required
                defaultValue={chantierOptions[0] || ""}
                className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
              >
                {chantierOptions.length === 0 ? (
                  <option value="">Aucun chantier, crée-en un d’abord</option>
                ) : (
                  chantierOptions.map((chantierName) => (
                    <option key={chantierName} value={chantierName}>
                      {chantierName}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="projectName" className="text-sm font-medium text-[var(--foreground)]">
                Nom de la relance
              </label>
              <input
                id="projectName"
                name="projectName"
                type="text"
                required
                placeholder="Ex: Relance devis menuiserie extérieure"
                className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="artisanContact" className="text-sm font-medium text-[var(--foreground)]">
                Contact de l’artisan
              </label>
              <input
                id="artisanContact"
                name="artisanContact"
                type="text"
                required
                placeholder="Ex: Atelier Durand, durand@example.com"
                className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="followUpDelayDays" className="text-sm font-medium text-[var(--foreground)]">
                Délai de relance
              </label>
              <select
                id="followUpDelayDays"
                name="followUpDelayDays"
                defaultValue="7"
                className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
              >
                <option value="2">2 jours</option>
                <option value="3">3 jours</option>
                <option value="5">5 jours</option>
                <option value="7">7 jours</option>
                <option value="14">14 jours</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="templateId" className="text-sm font-medium text-[var(--foreground)]">
                Template de relance
              </label>
              <select
                id="templateId"
                name="templateId"
                defaultValue=""
                className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
              >
                <option value="">Aucun template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="note" className="text-sm font-medium text-[var(--foreground)]">
                Note
              </label>
              <textarea
                id="note"
                name="note"
                rows={5}
                placeholder="Ex: Devis façade attendu avant validation"
                className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
              />
            </div>

            <button
              type="submit"
              disabled={chantierOptions.length === 0}
              className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-92 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Enregistrer le rappel
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Chantiers</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-[var(--field)] px-4 py-2 text-sm text-[var(--soft)]">
                {chantierSummaries.length} chantier{chantierSummaries.length > 1 ? "s" : ""}
              </div>
              <a href="#create-chantier" className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white transition hover:opacity-92">
                Nouveau chantier
              </a>
            </div>
          </div>

          {chantierSummaries.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-[var(--field)] px-6 py-10 text-sm text-[var(--soft)]">
              Aucun chantier enregistré.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {chantierSummaries.map((chantier) => {
                const modalId = `chantier-${chantier.name.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}`;

                return (
                  <div key={chantier.name}>
                    <a href={`#${modalId}`} className="chantier-card">
                      <div className="grid gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold">{chantier.name}</h3>
                            <p className="mt-1 text-sm text-[var(--soft)]">{chantier.count} relance{chantier.count > 1 ? "s" : ""}</p>
                          </div>
                          {chantier.overdueCount > 0 ? (
                            <span className="status-pill status-pill--danger">{chantier.overdueCount} en retard</span>
                          ) : (
                            <span className="status-pill">{chantier.pendingCount} en attente</span>
                          )}
                        </div>

                        <div className="grid gap-2 text-sm text-[var(--soft)]">
                          <p>Prochaine échéance: {chantier.nextDue ? formatDate(chantier.nextDue) : "Aucune"}</p>
                          <p>Clique pour voir toutes les relances du chantier.</p>
                        </div>
                      </div>
                    </a>

                    <div id={modalId} className="modal-overlay">
                      <div className="modal-card modal-card-wide">
                        <div className="mb-6 flex items-start justify-between gap-4">
                          <div className="text-left">
                            <h3 className="text-2xl font-semibold">{chantier.name}</h3>
                            <p className="mt-2 text-sm text-[var(--soft)]">Liste complète des relances attribuées à ce chantier.</p>
                          </div>
                          <a href="#" className="modal-close" aria-label="Fermer la fenêtre">×</a>
                        </div>

                        <div className="grid gap-4">
                          {chantier.reminders.map((reminder) => {
                            const editModalId = `edit-${reminder.id}`;
                            const selectedTemplate = templates.find((template) => template.id === reminder.templateId);
                            const tone = getStatusTone(reminder.status);

                            return (
                              <article key={reminder.id} className="rounded-[1.5rem] border border-black/8 bg-[var(--field)] p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                  <div className="grid gap-3">
                                    <div>
                                      <div className="flex flex-wrap items-center gap-3">
                                        <h4 className="text-lg font-semibold">{reminder.projectName}</h4>
                                        <span className={`status-pill status-pill--${tone}`}>{getStatusLabel(reminder.status)}</span>
                                      </div>
                                      <p className="mt-2 text-sm text-[var(--soft)]">{reminder.artisanContact}</p>
                                    </div>

                                    <div className="grid gap-1 text-sm text-[var(--soft)]">
                                      <p>Échéance: {formatDate(reminder.dueAt)}</p>
                                      <p>Délai: {reminder.followUpDelayDays} jours</p>
                                      <p>Template: {selectedTemplate?.title || "Aucun"}</p>
                                      <p>Note: {reminder.note || "-"}</p>
                                    </div>
                                  </div>

                                  <a href={`#${editModalId}`} className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-black/20">
                                    Modifier
                                  </a>
                                </div>

                                <div id={editModalId} className="modal-overlay">
                                  <div className="modal-card">
                                    <div className="mb-6 flex items-start justify-between gap-4">
                                      <div className="text-left">
                                        <h3 className="text-xl font-semibold">Modifier la relance</h3>
                                      </div>
                                      <a href={`#${modalId}`} className="modal-close" aria-label="Fermer la fenêtre">×</a>
                                    </div>

                                    <form action={updateReminder} className="grid gap-4 text-left">
                                      <input type="hidden" name="id" value={reminder.id} />

                                      <div className="grid gap-2">
                                        <label htmlFor={`${editModalId}-chantier`} className="text-sm font-medium">
                                          Chantier
                                        </label>
                                        <input
                                          id={`${editModalId}-chantier`}
                                          name="chantierName"
                                          defaultValue={reminder.chantierName}
                                          required
                                          className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
                                        />
                                      </div>

                                      <div className="grid gap-2">
                                        <label htmlFor={`${editModalId}-project`} className="text-sm font-medium">
                                          Nom de la relance
                                        </label>
                                        <input
                                          id={`${editModalId}-project`}
                                          name="projectName"
                                          defaultValue={reminder.projectName}
                                          required
                                          className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
                                        />
                                      </div>

                                      <div className="grid gap-2">
                                        <label htmlFor={`${editModalId}-contact`} className="text-sm font-medium">
                                          Contact de l’artisan
                                        </label>
                                        <input
                                          id={`${editModalId}-contact`}
                                          name="artisanContact"
                                          defaultValue={reminder.artisanContact}
                                          required
                                          className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
                                        />
                                      </div>

                                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] md:items-start">
                                        <div className="grid gap-2">
                                          <label htmlFor={`${editModalId}-delay`} className="text-sm font-medium">
                                            Délai de relance
                                          </label>
                                          <select
                                            id={`${editModalId}-delay`}
                                            name="followUpDelayDays"
                                            defaultValue={String(reminder.followUpDelayDays)}
                                            className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
                                          >
                                            <option value="2">2 jours</option>
                                            <option value="3">3 jours</option>
                                            <option value="5">5 jours</option>
                                            <option value="7">7 jours</option>
                                            <option value="14">14 jours</option>
                                          </select>
                                        </div>

                                        <div className="grid gap-2">
                                          <label htmlFor={`${editModalId}-template`} className="text-sm font-medium">
                                            Template de relance
                                          </label>
                                          <select
                                            id={`${editModalId}-template`}
                                            name="templateId"
                                            defaultValue={reminder.templateId || ""}
                                            className="w-full rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
                                          >
                                            <option value="">Aucun template</option>
                                            {templates.map((template) => (
                                              <option key={template.id} value={template.id}>
                                                {template.title}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div className="grid gap-2">
                                          <label htmlFor={`${editModalId}-status`} className="text-sm font-medium">
                                            Statut
                                          </label>
                                          <select
                                            id={`${editModalId}-status`}
                                            name="status"
                                            defaultValue={reminder.status}
                                            className="w-full rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
                                          >
                                            {statusOptions.map((status) => (
                                              <option key={status} value={status}>
                                                {getStatusLabel(status)}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>

                                      <div className="grid gap-2">
                                        <label htmlFor={`${editModalId}-note`} className="text-sm font-medium">
                                          Note
                                        </label>
                                        <textarea
                                          id={`${editModalId}-note`}
                                          name="note"
                                          rows={5}
                                          defaultValue={reminder.note || ""}
                                          className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
                                        />
                                      </div>

                                      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-between">
                                        <button type="submit" className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-92">
                                          Enregistrer les modifications
                                        </button>
                                      </div>
                                    </form>

                                    <form action={deleteReminder} className="mt-6 border-t border-black/8 pt-6 text-left">
                                      <input type="hidden" name="id" value={reminder.id} />
                                      <button
                                        type="submit"
                                        className="inline-flex items-center justify-center rounded-full bg-[#8f2f2f] px-6 py-3 text-sm font-medium text-white transition hover:opacity-92"
                                      >
                                        Supprimer la ligne
                                      </button>
                                    </form>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div id="create-chantier" className="modal-overlay">
        <div className="modal-card">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="text-left">
              <h3 className="text-xl font-semibold">Créer un chantier</h3>
              <p className="mt-2 text-sm text-[var(--soft)]">Ajoute un chantier, il sera ensuite disponible dans le sélecteur des relances.</p>
            </div>
            <a href="#" className="modal-close" aria-label="Fermer la fenêtre">×</a>
          </div>

          <form action={createChantier} className="grid gap-4 text-left">
            <div className="grid gap-2">
              <label htmlFor="create-chantier-name" className="text-sm font-medium">
                Nom du chantier
              </label>
              <input
                id="create-chantier-name"
                name="chantierName"
                required
                placeholder="Ex: Villa Montmorency, lot façade"
                className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
              />
            </div>

            <div className="mt-2 flex justify-end">
              <button type="submit" className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-92">
                Créer le chantier
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
