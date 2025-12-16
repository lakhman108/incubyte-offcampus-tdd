import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(
        formData.username,
        formData.email,
        formData.password
      );
      login(response.token, response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background relative overflow-hidden">
      {/* Visual Panel Right (Swapped from Login) */}
      <div className="hidden lg:flex order-last flex-col justify-center items-center relative z-10 p-12 glass border-l border-white/5">
        <div className="max-w-md text-center space-y-6">
          <div className="flex justify-center mb-8">
            <span className="text-9xl animate-float drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" style={{ animationDelay: '-2s' }}>🍭</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white">
            Join the <span className="text-accent animate-pulse">Club</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Create an account to track orders, save your favorites, and get exclusive sweet deals.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-12 w-full">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl glass-card bg-white/5 animate-pulse" style={{ animationDelay: `${i * 200 + 500}ms` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Form Panel Left */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative z-10">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse" />
        </div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-bold tracking-tight text-white mb-2">Create Account</h2>
            <p className="text-muted-foreground">Sign up to get started</p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl">
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl mb-6 text-sm font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-200">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="SweetLover123"
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-accent focus:ring-accent/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-200">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-accent focus:ring-accent/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-200">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-accent focus:ring-accent/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-accent focus:ring-accent/20"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-lg font-bold bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/25 transition-all hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-accent hover:text-accent/80 font-bold hover:underline transition-all">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
