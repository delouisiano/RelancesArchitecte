import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relances Architecte",
  description: "Application de suivi des relances artisans pour architecte.",
};

const navigation = [
  { href: "/", label: "Accueil", icon: "M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3z" },
  { href: "/reminders", label: "Relances", icon: "M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5" },
  { href: "/projects", label: "Projets", icon: "M3 7h7l2 3h9v9H3z" },
  { href: "/contacts", label: "Contacts", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0" },
  { href: "/templates", label: "Modeles", icon: "M6 3h9l3 3v15H6z M14 3v4h4 M9 12h6 M9 16h6" },
  { href: "/settings", label: "Parametres", icon: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { href: "/manual", label: "Manuel", icon: "M9.1 9a3 3 0 1 1 5.8 1c-.4 1.2-1.8 1.5-2.5 2.1-.5.5-.7 1.2-.7 1.9 M12 17h.01" },
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
