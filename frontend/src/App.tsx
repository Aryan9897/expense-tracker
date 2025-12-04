import { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';

function App() {
  const [view, setView] = useState<'login' | 'dashboard'>('login');
  const [email, setEmail] = useState('');

  return (
    <div className="app-shell">
      {view === 'login' ? (
        <Login email={email} onEmailChange={setEmail} onSubmit={() => setView('dashboard')} />
      ) : (
        <Dashboard email={email || 'you@example.com'} onSignOut={() => setView('login')} />
      )}
    </div>
  );
}

export default App;
