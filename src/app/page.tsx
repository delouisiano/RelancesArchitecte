import { deleteReminder, updateReminder } from "@/app/actions";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { addDays, formatDate, getStatusLabel } from "@/lib/reminders";
import { ReminderStatus } from "../generated/prisma/enums";
import { redirect } from "next/navigation";

async function createReminder(formData: FormData) {
  "use server";

  const projectName = String(formData.get("projectName") || "").trim();
  const artisanContact = String(formData.get("artisanContact") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const followUpDelayDays = Number(formData.get("followUpDelayDays"));

  if (!projectName || !artisanContact || !Number.isFinite(followUpDelayDays)) {
    redirect("/?error=invalid");
  }

  const since = new Date(Date.now() - 2 * 60 * 1000);
  const existing = await prisma.reminder.findFirst({
    where: {
      projectName,
      artisanContact,
      followUpDelayDays,
      note: note || null,
      createdAt: { gte: since },
    },
  });

  if (!existing) {
    await prisma.reminder.create({
      data: {
        projectName,
        artisanName: artisanContact,
        artisanContact,
        note: note || null,
        followUpDelayDays,
        dueAt: addDays(new Date(), followUpDelayDays),
      },
    });
  }

  redirect("/");
}

const statusOptions = [ReminderStatus.PENDING, ReminderStatus.DONE, ReminderStatus.RESPONDED, ReminderStatus.ABANDONED];

export default async function Home() {
  const reminders = await prisma.reminder.findMany({
    orderBy: [{ dueAt: "asc" }],
  });

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 text-[var(--foreground)] md:px-10 md:py-14">
      <div className="mx-auto grid max-w-6xl gap-8">
        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-4">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[var(--muted)]">MVP architecte</p>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
              Centraliser les relances artisans sans finir noyé dans les post-its, les mails et les oublis polis.
            </h1>
            <p className="max-w-3xl text-base leading-7 text-[var(--soft)]">
              Cette première version fait exactement ce qu’on lui demande, ce qui est déjà rare: créer un rappel, afficher la liste
              des relances enregistrées, puis les modifier proprement sans bricoler dans le vide.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/templates" className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-[var(--foreground)] transition hover:border-black/20">
              Gérer les templates mails
            </Link>
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 grid gap-2">
            <h2 className="text-2xl font-semibold">Nouveau rappel</h2>
            <p className="text-sm leading-6 text-[var(--soft)]">
              On enregistre le projet, le contact, le délai, et une note. Pas besoin d’un rituel vaudou pour suivre une relance.
            </p>
          </div>

          <form action={createReminder} method="post" className="grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="projectName" className="text-sm font-medium text-[var(--foreground)]">
                Nom du projet
              </label>
              <input
                id="projectName"
                name="projectName"
                type="text"
                required
                placeholder="Ex: Rénovation appartement Haussmann"
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
                placeholder="Nom, email ou téléphone"
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
              <label htmlFor="note" className="text-sm font-medium text-[var(--foreground)]">
                Note
              </label>
              <textarea
                id="note"
                name="note"
                rows={5}
                placeholder="Ex: attente devis menuiserie, relance prévue si pas de retour"
                className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-92"
            >
              Enregistrer le rappel
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Rappels enregistrés</h2>
              <p className="text-sm leading-6 text-[var(--soft)]">Vue simple des relances en base. Sobre, lisible, presque civilisé.</p>
            </div>
            <div className="rounded-full bg-[var(--field)] px-4 py-2 text-sm text-[var(--soft)]">
              {reminders.length} rappel{reminders.length > 1 ? "s" : ""}
            </div>
          </div>

          {reminders.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-[var(--field)] px-6 py-10 text-sm text-[var(--soft)]">
              Aucun rappel pour le moment. Tu peux commencer par créer une première entrée, ce qui est souvent une stratégie sous-estimée.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-[1.25rem] border border-black/8 text-left text-sm">
                <thead className="bg-[var(--field)] text-[var(--soft)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Projet</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Délai</th>
                    <th className="px-4 py-3 font-medium">Échéance</th>
                    <th className="px-4 py-3 font-medium">Statut</th>
                    <th className="px-4 py-3 font-medium">Note</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.map((reminder) => {
                    const modalId = `edit-${reminder.id}`;

                    return (
                      <tr key={reminder.id} className="border-t border-black/6 align-top odd:bg-white even:bg-[#fdfbf8]">
                        <td className="px-4 py-4 font-medium">{reminder.projectName}</td>
                        <td className="px-4 py-4 text-[var(--soft)]">{reminder.artisanContact}</td>
                        <td className="px-4 py-4 text-[var(--soft)]">{reminder.followUpDelayDays} j</td>
                        <td className="px-4 py-4 text-[var(--soft)]">{formatDate(reminder.dueAt)}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-black/6 px-3 py-1 text-xs font-medium text-[var(--foreground)]">
                            {getStatusLabel(reminder.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[var(--soft)]">{reminder.note || "-"}</td>
                        <td className="px-4 py-4 text-right">
                          <details className="action-menu">
                            <summary className="action-trigger" aria-label="Modifier la relance">
                              <span>⋮</span>
                            </summary>
                            <div className="action-popover">
                              <a href={`#${modalId}`} className="action-link">
                                Modifier
                              </a>
                            </div>
                          </details>

                          <div id={modalId} className="modal-overlay">
                            <div className="modal-card">
                              <div className="mb-6 flex items-start justify-between gap-4">
                                <div className="text-left">
                                  <h3 className="text-xl font-semibold">Modifier la relance</h3>
                                  <p className="mt-2 text-sm leading-6 text-[var(--soft)]">
                                    Tu peux ajuster les champs, changer le statut, ou supprimer l’entrée si elle n’a plus lieu d’être.
                                  </p>
                                </div>
                                <a href="#" className="modal-close" aria-label="Fermer la fenêtre">
                                  ×
                                </a>
                              </div>

                              <form action={updateReminder} className="grid gap-4 text-left">
                                <input type="hidden" name="id" value={reminder.id} />

                                <div className="grid gap-2">
                                  <label htmlFor={`${modalId}-project`} className="text-sm font-medium">
                                    Nom du projet
                                  </label>
                                  <input
                                    id={`${modalId}-project`}
                                    name="projectName"
                                    defaultValue={reminder.projectName}
                                    required
                                    className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
                                  />
                                </div>

                                <div className="grid gap-2">
                                  <label htmlFor={`${modalId}-contact`} className="text-sm font-medium">
                                    Contact de l’artisan
                                  </label>
                                  <input
                                    id={`${modalId}-contact`}
                                    name="artisanContact"
                                    defaultValue={reminder.artisanContact}
                                    required
                                    className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
                                  />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="grid gap-2">
                                    <label htmlFor={`${modalId}-delay`} className="text-sm font-medium">
                                      Délai de relance
                                    </label>
                                    <select
                                      id={`${modalId}-delay`}
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
                                    <label htmlFor={`${modalId}-status`} className="text-sm font-medium">
                                      Statut
                                    </label>
                                    <select
                                      id={`${modalId}-status`}
                                      name="status"
                                      defaultValue={reminder.status}
                                      className="rounded-2xl border border-black/10 bg-[var(--field)] px-4 py-3 text-sm outline-none transition focus:border-black/30"
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
                                  <label htmlFor={`${modalId}-note`} className="text-sm font-medium">
                                    Note
                                  </label>
                                  <textarea
                                    id={`${modalId}-note`}
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
