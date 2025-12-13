import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Signup } from './pages/Signup';

function App() {
  const { user, loading, loginWithEmail, signupWithEmail, loginWithGoogle, logout } = useAuth();
  const [view, setView] = useState<'login' | 'signup' | 'dashboard' | 'profile'>(
    user ? 'dashboard' : 'login'
  );
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    bio: ''
  });
  const [auth, setAuth] = useState({
    password: '',
    confirmPassword: ''
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authPending, setAuthPending] = useState(false);

  useEffect(() => {
    if (!loading) {
      setView(user ? 'dashboard' : 'login');
    }
  }, [loading, user]);

  const handleEmailLogin = async (emailValue: string, password: string) => {
    setAuthPending(true);
    setAuthError(null);
    try {
      await loginWithEmail(emailValue, password);
      setView('dashboard');
    } catch (error) {
      console.error('Email login failed', error);
      setAuthError('Could not sign in. Please check your credentials and try again.');
    } finally {
      setAuthPending(false);
    }
  };

  const handleSignup = async (data: typeof profile & typeof auth) => {
    setAuthPending(true);
    setAuthError(null);
    try {
      await signupWithEmail(data.email, data.password, `${data.firstName} ${data.lastName}`.trim());
      setProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        company: data.company,
        bio: data.bio
      });
      setEmail(data.email);
      setAuth({ password: data.password, confirmPassword: data.confirmPassword });
      setView('dashboard');
    } catch (error) {
      console.error('Signup failed', error);
      setAuthError('Could not create your account. Please try again.');
    } finally {
      setAuthPending(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthPending(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
      setView('dashboard');
    } catch (error) {
      console.error('Google sign-in failed', error);
      setAuthError('Google sign-in was interrupted. Please try again.');
    } finally {
      setAuthPending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Sign out failed', error);
    } finally {
      setView('login');
    }
  };

  if (loading) {
    return (
      <div className="app-shell" style={{ padding: '48px', textAlign: 'center' }}>
        <p className="muted">Loading your session…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {view === 'login' ? (
        <Login
          email={email}
          onEmailChange={(value) => {
            setEmail(value);
            setProfile((prev) => ({ ...prev, email: value }));
          }}
          onPasswordSignIn={(password) => handleEmailLogin(email, password)}
          onGoogleSignIn={handleGoogleLogin}
          onSignup={() => setView('signup')}
          isSubmitting={authPending}
          error={authError}
        />
      ) : view === 'signup' ? (
        <Signup
          initial={{ ...profile, ...auth }}
          onSubmit={handleSignup}
          onCancel={() => setView('login')}
          isSubmitting={authPending}
          error={authError}
        />
      ) : view === 'dashboard' ? (
        <Dashboard
          email={profile.email || email || user?.email || 'you@example.com'}
          onSignOut={handleLogout}
          onOpenProfile={() => setView('profile')}
        />
      ) : (
        <Profile
          profile={profile}
          onSave={(data) => {
            setProfile(data);
            setEmail((prev) => prev || data.email);
            setView('dashboard');
          }}
          onChangePassword={(_, newPassword, confirmPassword) => {
            if (!newPassword || !confirmPassword) return;
            setAuth({ password: newPassword, confirmPassword });
          }}
          onCancel={() => setView('dashboard')}
        />
      )}
    </div>
  );
}

export default App;
