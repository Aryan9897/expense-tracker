import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Signup } from './pages/Signup';

function App() {
  const [view, setView] = useState<'login' | 'signup' | 'dashboard' | 'profile'>('login');
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

  return (
    <div className="app-shell">
      {view === 'login' ? (
        <Login
          email={email}
          onEmailChange={(value) => {
            setEmail(value);
            setProfile((prev) => ({ ...prev, email: value }));
          }}
          onSubmit={() => {
            setProfile((prev) => ({ ...prev, email: email || prev.email }));
            setView('dashboard');
          }}
          onSignup={() => setView('signup')}
        />
      ) : view === 'signup' ? (
        <Signup
          initial={{ ...profile, ...auth }}
          onSubmit={(data) => {
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
          }}
          onCancel={() => setView('login')}
        />
      ) : view === 'dashboard' ? (
        <Dashboard
          email={profile.email || email || 'you@example.com'}
          onSignOut={() => setView('login')}
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
