from pathlib import Path
path = Path("src/app/page.tsx")
text = path.read_text()
text = text.replace('import { redirect } from "next/navigation";\n', 'import Link from "next/link";\nimport { redirect } from "next/navigation";\n', 1)
old = '''        <section className="grid gap-4">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[var(--muted)]">MVP architecte</p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            Centraliser les relances artisans sans finir noyé dans les post-its, les mails et les oublis polis.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[var(--soft)]">
            Cette première version fait exactement ce qu’on lui demande, ce qui est déjà rare: créer un rappel, afficher la liste
            des relances enregistrées, puis les modifier proprement sans bricoler dans le vide.
          </p>
        </section>
'''
new = '''        <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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
'''
if old not in text:
    raise SystemExit('target block not found')
path.write_text(text.replace(old, new, 1))
