import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relances Architecte",
  description: "Application de suivi des relances artisans pour architecte.",
};

const navigation = [
  { href: "/", label: "Tableau de bord" },
  { href: "/reminders", label: "Relances" },
  { href: "/projects", label: "Projets" },
  { href: "/contacts", label: "Contacts" },
  { href: "/templates", label: "Templates" },
  { href: "/settings", label: "Parametres" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <header className="app-header">
          <div>
            <p className="eyebrow">Relances Architecte</p>
            <h1>Suivi des relances artisans</h1>
          </div>
          <nav aria-label="Navigation principale">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
