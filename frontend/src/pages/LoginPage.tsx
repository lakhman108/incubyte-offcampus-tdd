import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex flex-col justify-center items-center relative z-10 p-12 glass border-r border-white/5">
        <div className="max-w-md text-center space-y-6">
          <div className="flex justify-center mb-8">
            <span className="text-9xl animate-float drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">🍬</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white">
            Sweet Shop <span className="text-primary">Premium</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Experience the most delightful sweets in town with our curated collection of premium treats.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-12 w-full">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl glass-card bg-white/5 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-bold tracking-tight text-white mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl">
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl mb-6 text-sm font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-200">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-200">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-primary focus:ring-primary/20"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:text-primary/80 font-bold hover:underline transition-all">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
