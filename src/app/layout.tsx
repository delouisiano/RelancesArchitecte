import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relance Architecte | MVP formulaire",
  description: "Première interface MVP pour créer un rappel de relance artisan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
