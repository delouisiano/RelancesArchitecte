export type TemplateRenderInput = {
  subject: string;
  body: string;
  projectName: string;
  contactName: string;
  contactCompany?: string | null;
  dueAt: Date;
  note?: string | null;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}

export function renderTemplate(input: TemplateRenderInput) {
  const variables: Record<string, string> = {
    "{{projectName}}": input.projectName,
    "{{contactName}}": input.contactName,
    "{{contactCompany}}": input.contactCompany ?? "",
    "{{dueAt}}": formatDate(input.dueAt),
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
