import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Connexion</p>
          <h2>Acces mono-utilisateur</h2>
          <p>
            Connecte-toi avec le compte configure dans les variables
            d&apos;environnement du VPS.
          </p>
        </div>
      </div>

      <LoginForm />
    </section>
  );
}
