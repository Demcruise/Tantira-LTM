import { useState } from "react";
import { Button, Callout, InputGroup } from "@blueprintjs/core";

interface LoginPageProps {
  ssoAvailable: (email: string) => boolean;
  onLogin: (email: string) => void;
}

export function LoginPage({ ssoAvailable, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const showSso = ssoAvailable(email);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }
    setError(null);
    onLogin(email.trim());
  }

  function handleSso() {
    setError(null);
    onLogin(email.trim() || "rina@tantira.co");
  }

  return (
    <div className="login-page">
      <form className="login-page__card" onSubmit={handleSubmit}>
        <div className="login-page__logo">
          <span className="login-page__logo-mark">T</span>
          <span className="login-page__logo-word">Tantira</span>
        </div>

        {error && (
          <Callout intent="danger" icon="warning-sign" className="login-page__error">
            {error}
          </Callout>
        )}

        <label className="login-page__field">
          <span>Email</span>
          <InputGroup
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </label>

        <label className="login-page__field">
          <span>Password</span>
          <InputGroup type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        <Button type="submit" intent="primary" fill text="Log in" />

        {showSso && (
          <>
            <div className="login-page__divider">
              <span>or</span>
            </div>
            <Button icon="log-in" fill text="Continue with SSO" onClick={handleSso} />
          </>
        )}
      </form>
    </div>
  );
}
