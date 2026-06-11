import {
  ArchiveStatus,
  ReminderEventType,
  ReminderStatus,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const now = new Date();

function addDays(days: number, hour = 9, minute = 0) {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

const projects = [
  {
    id: "demo-project-villa-montmorency",
    name: "Villa Montmorency",
    description:
      "Renovation complete d'une maison familiale : facade, menuiseries exterieures et amenagements interieurs.",
  },
  {
    id: "demo-project-appartement-marais",
    name: "Appartement Marais",
    description:
      "Reamenagement d'un appartement ancien avec creation d'une cuisine ouverte et reprise des reseaux techniques.",
  },
  {
    id: "demo-project-bureaux-opera",
    name: "Bureaux Opera",
    description:
      "Transformation de plateaux tertiaires en espaces de travail flexibles avec contraintes acoustiques fortes.",
  },
  {
    id: "demo-project-maison-neuilly",
    name: "Extension maison Neuilly",
    description:
      "Extension contemporaine, coordination structure bois, menuiseries sur mesure et finitions haut de gamme.",
  },
];

const contacts = [
  {
    id: "demo-contact-atelier-durand",
    name: "Camille Durand",
    company: "Atelier Durand",
    email: "camille.durand@example.com",
    phone: "06 12 34 56 10",
    notes: "Menuiserie interieure et mobilier sur mesure. Repond plutot en fin de journee.",
  },
  {
    id: "demo-contact-bati-rivoli",
    name: "Mehdi Benali",
    company: "Bati Rivoli",
    email: "contact@batirivoli.example",
    phone: "01 42 00 18 73",
    notes: "Entreprise generale. Demander confirmation ecrite pour les changements de planning.",
  },
  {
    id: "demo-contact-lumen-elec",
    name: "Sophie Martin",
    company: "Lumen Elec",
    email: "s.martin@lumenelec.example",
    phone: "06 44 18 22 91",
    notes: "Electricite, domotique et reprises de tableaux.",
  },
  {
    id: "demo-contact-studio-metal",
    name: "Antoine Lefevre",
    company: "Studio Metal",
    email: "atelier@studiometal.example",
    phone: "06 77 30 90 12",
    notes: "Serrurerie, verrieres, garde-corps. Tres bon techniquement, relances utiles.",
  },
  {
    id: "demo-contact-clair-enduit",
    name: "Nadia Petit",
    company: "Clair Enduit",
    email: "nadia@clairenduit.example",
    phone: "06 19 81 40 33",
    notes: "Enduits decoratifs, peintures et finitions.",
  },
  {
    id: "demo-contact-thermo-fluides",
    name: "Julien Moreau",
    company: "Thermo Fluides",
    email: "julien.moreau@thermofluides.example",
    phone: "06 58 21 09 64",
    notes: "Plomberie, chauffage, ventilation. A relancer tot pour caler les interventions.",
  },
];

const templates = [
  {
    id: "demo-template-devis",
    name: "Relance devis",
    subject: "Relance devis - {{nomProjet}}",
    body:
      "Bonjour {{nomContact}},\n\nJe me permets de revenir vers vous concernant le devis attendu pour le projet {{nomProjet}}.\n\nPouvez-vous me confirmer une date d'envoi ?\n\nBien cordialement,\n{{nomArchitecte}}",
  },
  {
    id: "demo-template-planning",
    name: "Confirmation planning",
    subject: "Planning d'intervention - {{nomProjet}}",
    body:
      "Bonjour {{nomContact}},\n\nPouvez-vous me confirmer vos disponibilites d'intervention pour le projet {{nomProjet}} ?\n\nL'objectif est de stabiliser le planning avec les autres corps d'etat.\n\nBien cordialement,\n{{nomArchitecte}}",
  },
  {
    id: "demo-template-documents",
    name: "Pieces techniques manquantes",
    subject: "Documents attendus - {{nomProjet}}",
    body:
      "Bonjour {{nomContact}},\n\nJe reviens vers vous concernant les elements techniques attendus pour {{nomProjet}}.\n\nPouvez-vous me transmettre les documents manquants ou me dire quand ils seront disponibles ?\n\nBien cordialement,\n{{nomArchitecte}}",
  },
  {
    id: "demo-template-retour-visite",
    name: "Retour apres visite chantier",
    subject: "Retour suite a la visite - {{nomProjet}}",
    body:
      "Bonjour {{nomContact}},\n\nSuite a notre visite sur le projet {{nomProjet}}, pouvez-vous me faire un retour sur les points evoques et les eventuelles reserves ?\n\nMerci d'avance,\n{{nomArchitecte}}",
  },
  {
    id: "demo-template-validation",
    name: "Validation avant commande",
    subject: "Validation avant commande - {{nomProjet}}",
    body:
      "Bonjour {{nomContact}},\n\nAvant lancement de la commande pour {{nomProjet}}, pouvez-vous me confirmer les derniers elements : prix, delai et caracteristiques techniques ?\n\nBien cordialement,\n{{nomArchitecte}}",
  },
];

const reminders = [
  {
    id: "demo-reminder-devis-facade",
    title: "Recevoir le devis facade",
    projectId: "demo-project-villa-montmorency",
    contactId: "demo-contact-bati-rivoli",
    templateId: "demo-template-devis",
    status: ReminderStatus.OVERDUE,
    dueAt: addDays(-3, 10),
    note: "Le client attend le chiffrage pour arbitrer entre ravalement simple et reprise complete.",
  },
  {
    id: "demo-reminder-menuiseries",
    title: "Valider les plans de menuiseries",
    projectId: "demo-project-maison-neuilly",
    contactId: "demo-contact-atelier-durand",
    templateId: "demo-template-validation",
    status: ReminderStatus.DUE,
    dueAt: addDays(0, 14),
    note: "Verifier dimensions, essence de bois et delai avant commande.",
  },
  {
    id: "demo-reminder-electricite",
    title: "Retour implantation electrique",
    projectId: "demo-project-appartement-marais",
    contactId: "demo-contact-lumen-elec",
    templateId: "demo-template-documents",
    status: ReminderStatus.UPCOMING,
    dueAt: addDays(4, 9, 30),
    note: "Attente du plan avec prises, luminaires et tableau revise.",
  },
  {
    id: "demo-reminder-verriere",
    title: "Confirmer delai verriere atelier",
    projectId: "demo-project-bureaux-opera",
    contactId: "demo-contact-studio-metal",
    templateId: "demo-template-planning",
    status: ReminderStatus.POSTPONED,
    dueAt: addDays(7, 11),
    note: "Relance deja reportee apres attente du retour fournisseur.",
  },
  {
    id: "demo-reminder-peinture",
    title: "Planifier les finitions peinture",
    projectId: "demo-project-appartement-marais",
    contactId: "demo-contact-clair-enduit",
    templateId: "demo-template-planning",
    status: ReminderStatus.SENT,
    dueAt: addDays(-1, 16),
    lastSentAt: addDays(-1, 16, 15),
    note: "Relance envoyee apres recalage du planning plaquiste.",
  },
  {
    id: "demo-reminder-fluides",
    title: "Recevoir schema ventilation",
    projectId: "demo-project-bureaux-opera",
    contactId: "demo-contact-thermo-fluides",
    templateId: "demo-template-documents",
    status: ReminderStatus.UPCOMING,
    dueAt: addDays(10, 8, 45),
    note: "Point necessaire avant validation du faux plafond.",
  },
  {
    id: "demo-reminder-visite",
    title: "Compte rendu apres visite",
    projectId: "demo-project-villa-montmorency",
    contactId: "demo-contact-studio-metal",
    templateId: "demo-template-retour-visite",
    status: ReminderStatus.CLOSED,
    dueAt: addDays(-8, 9),
    closedAt: addDays(-6, 18),
    note: "Sujet cloture apres reception du retour technique.",
  },
  {
    id: "demo-reminder-chauffage",
    title: "Option chauffage extension",
    projectId: "demo-project-maison-neuilly",
    contactId: "demo-contact-thermo-fluides",
    templateId: "demo-template-devis",
    status: ReminderStatus.OVERDUE,
    dueAt: addDays(-6, 15),
    note: "Comparer l'option plancher chauffant avec radiateurs basse temperature.",
  },
];

const notificationLogs = [
  {
    id: "demo-notification-devis-facade",
    reminderId: "demo-reminder-devis-facade",
    success: true,
    message: "Notification de demonstration envoyee a l'architecte.",
  },
  {
    id: "demo-notification-chauffage",
    reminderId: "demo-reminder-chauffage",
    success: false,
    message: "Simulation d'echec SMTP pour visualiser les logs.",
  },
];

async function main() {
  await prisma.notificationLog.deleteMany({
    where: { id: { in: notificationLogs.map((log) => log.id) } },
  });
  await prisma.reminderEvent.deleteMany({
    where: { reminderId: { in: reminders.map((reminder) => reminder.id) } },
  });
  await prisma.reminder.deleteMany({
    where: { id: { in: reminders.map((reminder) => reminder.id) } },
  });
  await prisma.project.deleteMany({
    where: { id: { in: projects.map((project) => project.id) } },
  });
  await prisma.contact.deleteMany({
    where: { id: { in: contacts.map((contact) => contact.id) } },
  });
  await prisma.template.deleteMany({
    where: { id: { in: templates.map((template) => template.id) } },
  });

  await prisma.userSettings.upsert({
    where: { id: "default" },
    update: {
      architectName: "Sylvain",
      agencyName: "Atelier Demo Architecture",
      architectEmail: "architecte@example.com",
      defaultReminderDays: 7,
      notificationCooldown: 24,
    },
    create: {
      id: "default",
      architectName: "Sylvain",
      agencyName: "Atelier Demo Architecture",
      architectEmail: "architecte@example.com",
      defaultReminderDays: 7,
      notificationCooldown: 24,
    },
  });

  for (const project of projects) {
    await prisma.project.create({
      data: { ...project, status: ArchiveStatus.ACTIVE },
    });
  }

  for (const contact of contacts) {
    await prisma.contact.create({
      data: { ...contact, status: ArchiveStatus.ACTIVE },
    });
  }

  for (const template of templates) {
    await prisma.template.create({
      data: { ...template, status: ArchiveStatus.ACTIVE },
    });
  }

  for (const reminder of reminders) {
    const { closedAt, lastSentAt, ...data } = reminder;

    await prisma.reminder.create({
      data: {
        ...data,
        closedAt: closedAt ?? null,
        lastSentAt: lastSentAt ?? null,
        events: {
          create: [
            {
              type: ReminderEventType.CREATED,
              message: "Relance de demonstration creee.",
            },
            ...(data.status === ReminderStatus.POSTPONED
              ? [
                  {
                    type: ReminderEventType.POSTPONED,
                    message: "Relance reportee pour coordination du planning.",
                  },
                ]
              : []),
            ...(data.status === ReminderStatus.SENT
              ? [
                  {
                    type: ReminderEventType.SENT,
                    message: "Relance marquee comme envoyee.",
                  },
                ]
              : []),
            ...(data.status === ReminderStatus.CLOSED
              ? [
                  {
                    type: ReminderEventType.CLOSED,
                    message: "Relance cloturee apres reception du retour.",
                  },
                ]
              : []),
          ],
        },
      },
    });
  }

  for (const log of notificationLogs) {
    await prisma.notificationLog.create({ data: log });
  }

  console.log(
    JSON.stringify(
      {
        seededAt: new Date().toISOString(),
        projects: projects.length,
        contacts: contacts.length,
        templates: templates.length,
        reminders: reminders.length,
        notificationLogs: notificationLogs.length,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
