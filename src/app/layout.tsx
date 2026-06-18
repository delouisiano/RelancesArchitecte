import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relances Architecte",
  description: "Application de suivi des relances artisans pour architecte.",
};

const navigation = [
  { href: "/", label: "Accueil", icon: "M4 13h5V4h6v9h5l-8 7-8-7z" },
  { href: "/reminders", label: "Relances", icon: "M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5" },
  { href: "/projects", label: "Projets", icon: "M3 7h7l2 3h9v9H3z" },
  { href: "/contacts", label: "Contacts", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0" },
  { href: "/templates", label: "Modeles", icon: "M6 3h9l3 3v15H6z M14 3v4h4 M9 12h6 M9 16h6" },
  { href: "/settings", label: "Parametres", icon: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v3 M12 19v3 M4.2 4.2l2.1 2.1 M17.7 17.7l2.1 2.1 M2 12h3 M19 12h3 M4.2 19.8l2.1-2.1 M17.7 6.3l2.1-2.1" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <aside className="app-sidebar" aria-label="Navigation principale">
          <Link className="brand-link" href="/" aria-label="Relances Architecte">
            <span className="brand-mark">RA</span>
            <span className="brand-copy">
              <span>Relances</span>
              <strong>Architecte</strong>
            </span>
          </Link>
          <nav>
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} title={item.label}>
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
