import { login } from "@/modules/auth/actions";

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

      <form action={login} className="panel form-panel narrow">
        <label>
          Identifiant
          <input name="username" required />
        </label>
        <label>
          Mot de passe
          <input name="password" type="password" required />
        </label>
        <button className="button primary" type="submit">
          Se connecter
        </button>
      </form>
    </section>
  );
}
