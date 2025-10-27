import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminDirectLogin() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if already authenticated
    fetch('/api/auth/user', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          // Already logged in, redirect to admin
          setLocation('/admin');
        }
      })
      .catch(() => {
        // Not authenticated, stay on this page
      });
  }, [setLocation]);

  useEffect(() => {
    const handleSubmit = async (e: Event) => {
      e.preventDefault();
      
      const form = e.target as HTMLFormElement;
      const username = (form.querySelector('#username') as HTMLInputElement)?.value;
      const password = (form.querySelector('#password') as HTMLInputElement)?.value;
      const submitBtn = form.querySelector('#submit-btn') as HTMLButtonElement;
      const errorDiv = form.querySelector('#error-msg') as HTMLDivElement;

      if (!username || !password) {
        if (errorDiv) {
          errorDiv.textContent = 'Veuillez remplir tous les champs';
          errorDiv.style.display = 'block';
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connexion...';
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
          // Success - redirect to admin
          window.location.href = '/admin';
        } else {
          // Error
          if (errorDiv) {
            errorDiv.textContent = data.message || 'Identifiants incorrects';
            errorDiv.style.display = 'block';
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
          }
        }
      } catch (error) {
        if (errorDiv) {
          errorDiv.textContent = 'Erreur de connexion';
          errorDiv.style.display = 'block';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Se connecter';
        }
      }
    };

    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', handleSubmit);
      return () => form.removeEventListener('submit', handleSubmit);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, hsl(145, 63%, 49%) 0%, hsl(25, 95%, 53%) 100%)',
      padding: '24px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        padding: '32px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'hsl(145, 63%, 49%, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(145, 63%, 49%)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>Administration</h1>
          <p style={{
            fontSize: '14px',
            color: '#666'
          }}>Connexion à l'espace d'administration</p>
        </div>

        <form id="login-form">
          <div id="error-msg" style={{
            display: 'none',
            background: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px'
          }}></div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="username" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#1a1a1a'
            }}>Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              autoComplete="username"
              placeholder="admin"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#1a1a1a'
            }}>Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            id="submit-btn"
            style={{
              width: '100%',
              background: 'hsl(145, 63%, 49%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'hsl(145, 63%, 42%)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'hsl(145, 63%, 49%)'}
          >
            Se connecter
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#999'
        }}>
          Identifiants par défaut : admin / admin123
        </div>
      </div>
    </div>
  );
}
