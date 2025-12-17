import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { auth as firebaseAuth } from './lib/firebase';
import { UserService } from './services/user';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Signup } from './pages/Signup';
import { ChangePassword } from './pages/ChangePassword';

function App() {
  const { user, loading, loginWithEmail, signupWithEmail, loginWithGoogle, logout, updateUserEmail } = useAuth();
  const [view, setView] = useState<'login' | 'signup' | 'dashboard' | 'profile' | 'change-password'>(
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
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        setView('dashboard');
        // Fetch profile
        UserService.getUserProfile(user.uid).then((data) => {
          if (data) {
            setProfile(data);
          }
        }).catch(err => console.error("Failed to load profile", err));
      } else {
        setView('login');
        setProfile({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          jobTitle: '',
          company: '',
          bio: ''
        });
      }
    }
  }, [loading, user]);

  const handleEmailLogin = async (emailValue: string, password: string) => {
    setAuthPending(true);
    setAuthError(null);
    try {
      await loginWithEmail(emailValue, password);
      // View update handled by useEffect
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

      const newProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        company: data.company,
        bio: data.bio
      };

      setProfile(newProfile);

      // Save to Firestore
      if (user) {
        // This might race if user state isn't updated internally yet by Firebase SDK immediately.
        // However, in typical flows, signupWithEmail waits. The user object in context might update via onAuthStateChanged.
        // A better approach is to rely on the fact that if signup succeeds, we have a user.
        // But we need the UID. The signupWithEmail wrapper in AuthContext doesn't return the User object directly, verify AuthContext.
      }

      // Wait for auth state change to trigger useEffect or handle saving here if possible.
      // Actually, checking AuthContext, signupWithEmail creates user.
      // Ideally we would save here, but we need the UID.
      // Let's modify logic to save profile AFTER successful login/signup if we can get the UID.
      // Since `signupWithEmail` awaits `createUserWithEmailAndPassword`, the `auth.currentUser` should be populated immediately after.

      // We will perform a check:
      if (firebaseAuth.currentUser) {
        await UserService.updateUserProfile(firebaseAuth.currentUser.uid, newProfile);
      }

      setEmail(data.email);
      setAuth({ password: data.password, confirmPassword: data.confirmPassword });
      // View update to dashboard handled by useEffect or manual setView if desired, 
      // but useEffect [loading, user] will catch the new user state and set dashboard.
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
      // View update handled by useEffect
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
      ) : view === 'profile' ? (
        <Profile
          profile={profile}
          isSaving={isSavingProfile}
          isGoogleUser={user?.providerData.some((p) => p.providerId === 'google.com')}
          onSave={async (data) => {
            if (user) {
              setIsSavingProfile(true);
              try {
                // Update in Firestore
                await UserService.updateUserProfile(user.uid, data);

                setProfile(data);
                setEmail((prev) => prev || data.email);
                setView('dashboard');
              } catch (err: any) {
                console.error("Failed to save profile", err);
                alert("Failed to save profile changes. Please try again.");
              } finally {
                setIsSavingProfile(false);
              }
            } else {
              // Fallback for local-only testing or weird state
              setProfile(data);
              setView('dashboard');
            }
          }}
          onChangePassword={() => setView('change-password')}
          onCancel={() => setView('dashboard')}
        />
      ) : (
        <ChangePassword
          onCancel={() => setView('profile')}
          onSuccess={() => {
            alert('Password updated successfully');
            setView('profile');
          }}
        />
      )}
    </div>
  );
}

export default App;
