
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden text-foreground selection:bg-primary selection:text-white">
            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Floating Navbar */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 
          ${scrolled ? 'glass py-3' : 'bg-transparent py-5'}`}
            >
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => navigate('/dashboard')}
                    >
                        <span className="text-3xl transition-transform group-hover:scale-110 duration-300">🍬</span>
                        <h1 className="text-2xl font-black tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-500 transition-all">
                            Sweet Shop
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-1 mr-4">
                            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase px-3 py-1 rounded-full border border-white/10 glass">
                                {user?.username || user?.email}
                            </span>
                            <span className="text-xs font-bold tracking-wide text-primary uppercase px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                                {user?.role}
                            </span>
                        </div>

                        {user?.role === 'admin' && (
                            <Button
                                onClick={() => navigate('/admin')}
                                variant={isActive('/admin') ? 'default' : 'ghost'}
                                className="transition-all hover:scale-105"
                            >
                                Admin Panel
                            </Button>
                        )}

                        {user?.role === 'customer' && (
                            <Button
                                onClick={() => navigate('/dashboard')}
                                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                                className="transition-all hover:scale-105"
                            >
                                Shop
                            </Button>
                        )}

                        <Button
                            onClick={handleLogout}
                            variant="destructive"
                            className="ml-2 transition-all hover:scale-105 shadow-lg shadow-destructive/20"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-24 min-h-screen relative z-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in zoom-in-95 duration-500">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 mt-12 bg-black/20 backdrop-blur">
                <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Sweet Shop Premium. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
