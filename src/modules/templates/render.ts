export type TemplateRenderInput = {
  subject: string;
  body: string;
  projectName: string;
  contactName: string;
  contactCompany?: string | null;
  dueAt: Date;
  note?: string | null;
  architectName?: string | null;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export function renderTemplate(input: TemplateRenderInput) {
  const variables: Record<string, string> = {
    "{{nomProjet}}": input.projectName,
    "{{nomContact}}": input.contactName,
    "{{entrepriseContact}}": input.contactCompany ?? "",
    "{{echeance}}": formatDate(input.dueAt),
    "{{nomArchitecte}}": input.architectName ?? "",
    "{{projectName}}": input.projectName,
    "{{contactName}}": input.contactName,
    "{{contactCompany}}": input.contactCompany ?? "",
    "{{dueAt}}": formatDate(input.dueAt),
    "{{architectName}}": input.architectName ?? "",
    "{{note}}": input.note ?? "",
  };

  const replaceVariables = (value: string) =>
    Object.entries(variables).reduce(
      (current, [key, replacement]) => current.replaceAll(key, replacement),
      value,
    );

  return {
    subject: replaceVariables(input.subject),
    body: replaceVariables(input.body),
  };
}
