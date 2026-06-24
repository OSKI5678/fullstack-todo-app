import { useState } from 'react';

export default function LoginForm({ onLogin, onRegister }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [message, setMessage] = useState('');

  const handleLoginClick = async () => {
    if (!usernameInput || !passwordInput) {
      setMessage('Wpisz login i hasło!');
      return;
    }
    const error = await onLogin(usernameInput, passwordInput);
    if (error) setMessage(error);
  };

  const handleRegisterClick = async () => {
    if (!usernameInput || !passwordInput) {
      setMessage('Wpisz login i hasło!');
      return;
    }
    const statusMessage = await onRegister(usernameInput, passwordInput);
    setMessage(statusMessage);
  };

  return (
    <div className="scene">
      <div className="brand">
        Next<span>Task</span>
      </div>

      <div className="glass-card">
        <div className="avatar">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>
        </div>

        <div className="field">
          <svg viewBox="0 0 24 24">
            <path d="M3 6h18v12H3z" />
            <path d="M3 7l9 6 9-6" />
          </svg>
          <input
            type="text"
            placeholder="Login"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />
        </div>

        <div className="field">
          <svg viewBox="0 0 24 24">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <input
            type="password"
            placeholder="Hasło"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
        </div>

        <div className="row">
          <span className="hint">Chcesz utworzyć konto?</span>
          <button className="link-btn" onClick={handleRegisterClick}>
            Zarejestruj się
          </button>
        </div>

        {message && <p className="message">{message}</p>}
      </div>

      <button className="login-btn" onClick={handleLoginClick}>
        ZALOGUJ SIĘ
      </button>
    </div>
  );
}