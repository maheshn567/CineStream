"use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import { authClient } from "@/lib/auth-client";

export default function NavBar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { data: session, isPending } = authClient.useSession();

    const handleMobileSearch = () => {
        if (searchQuery.trim()) {
            setIsMobileSearchOpen(false);
            router.push(`/search/${searchQuery}`);
        }
    };

    const handleMobileSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            handleMobileSearch();
        }
    };

    // Debounced automatic search as user types
    useEffect(() => {
        if (!isMobileSearchOpen || !searchQuery.trim()) return;
        
        const timer = setTimeout(() => {
            router.push(`/search/${searchQuery}`);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchQuery, isMobileSearchOpen]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = async () => {
        try {
            await authClient.signOut({
                callbackURL: "/"
            });
        } catch (e) {
            console.error("Sign out error", e);
        }
    };

    // Track navigation history stack in sessionStorage (excluding player pages)
    useEffect(() => {
        if (typeof window === "undefined" || !pathname) return;

        const currentPath = window.location.pathname + window.location.search;
        
        // Match player routes to exclude them
        const isPlayerPage = 
            /^\/movie\/[^\/]+$/.test(window.location.pathname) || 
            /^\/series\/[^\/]+\/season\/[^\/]+\/episode\/[^\/]+$/.test(window.location.pathname) ||
            /^\/anime\/player\/[^\/]+$/.test(window.location.pathname);

        if (isPlayerPage) return;

        let stack = [];
        try {
            const stored = sessionStorage.getItem("custom_history");
            if (stored) stack = JSON.parse(stored);
        } catch (e) {}

        if (!Array.isArray(stack)) stack = [];

        const lastIdx = stack.length - 1;
        if (lastIdx >= 0 && stack[lastIdx] === currentPath) {
            return;
        }

        if (lastIdx >= 1 && stack[lastIdx - 1] === currentPath) {
            stack.pop();
        } else {
            stack.push(currentPath);
        }

        // Limit history stack size to 50 entries
        if (stack.length > 50) {
            stack.shift();
        }

        sessionStorage.setItem("custom_history", JSON.stringify(stack));
    }, [pathname]);

    // Helper to check if a route is active
    const isActive = (path) => pathname === path;

    if (pathname === "/signin" || pathname === "/login" || pathname === "/register") {
        return null;
    }

    return (
        <nav className={`${
            isScrolled 
                ? "bg-surface/90 backdrop-blur-xl border-b border-white/10" 
                : "bg-transparent border-b border-transparent"
        } fixed top-0 w-full z-50 transition-all duration-500`}>
            
            {isMobileSearchOpen ? (
                /* Full-width expanding search input overlay */
                <div className="flex items-center justify-between px-6 py-3 w-full bg-surface-container-high z-50 border-b border-white/10">
                    <button 
                        onClick={() => setIsMobileSearchOpen(false)}
                        className="text-on-surface-variant hover:text-on-surface p-2 rounded-full cursor-pointer flex items-center"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    
                    <input 
                        type="text"
                        placeholder="Search movies, series..."
                        className="bg-transparent text-white font-body-md text-body-md focus:outline-none w-full px-4"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleMobileSearchKeyDown}
                        autoFocus
                    />

                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="text-on-surface-variant hover:text-on-surface p-2 rounded-full cursor-pointer flex items-center"
                        >
                            <span className="material-symbols-outlined text-base">close</span>
                        </button>
                    )}
                </div>
            ) : (
                /* Normal desktop/mobile header layout */
                <div className="flex justify-between items-center px-lg py-sm max-w-container-max mx-auto">
                    
                    {/* Left side: Logo & Navigation Links */}
                    <div className="flex items-center space-x-lg">
                        <Link href="/" className="flex items-center space-x-1 group">
                            <img 
                                src="/image.svg" 
                                alt="CineStream Logo" 
                                className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                            />
                            <span className="font-headline-md text-headline-md font-bold text-primary">
                                CineStream
                            </span>
                        </Link>
                        
                        <div className="hidden md:flex space-x-md">
                            <Link 
                                href="/" 
                                className={`${isActive('/') ? 'text-primary-container font-bold border-b-2 border-primary-container pb-1' : 'text-on-surface-variant hover:text-on-surface'} font-body-md text-body-md transition-colors`}
                            >
                                Movies
                            </Link>
                            <Link 
                                href="/series" 
                                className={`${isActive('/series') ? 'text-primary-container font-bold border-b-2 border-primary-container pb-1' : 'text-on-surface-variant hover:text-on-surface'} font-body-md text-body-md transition-colors`}
                            >
                                Series
                            </Link>
                            <Link 
                                href="/anime" 
                                className={`${isActive('/anime') ? 'text-primary-container font-bold border-b-2 border-primary-container pb-1' : 'text-on-surface-variant hover:text-on-surface'} font-body-md text-body-md transition-colors`}
                            >
                                Anime
                            </Link>
                            <Link 
                                href="/tv" 
                                className={`${isActive('/tv') ? 'text-primary-container font-bold border-b-2 border-primary-container pb-1' : 'text-on-surface-variant hover:text-on-surface'} font-body-md text-body-md transition-colors`}
                            >
                                TV Shows
                            </Link>
                            <Link 
                                href="/mylist" 
                                className={`${isActive('/mylist') ? 'text-primary-container font-bold border-b-2 border-primary-container pb-1' : 'text-on-surface-variant hover:text-on-surface'} font-body-md text-body-md transition-colors`}
                            >
                                My List
                            </Link>
                        </div>
                    </div>

                    {/* Right side: Search, Notifications, & Profile */}
                    <div className="flex items-center space-x-md">
                        
                        {/* Search bar */}
                        <SearchBar />
                        
                        {/* Mobile Search Button */}
                        <button 
                            onClick={() => setIsMobileSearchOpen(true)}
                            className="text-on-surface-variant hover:text-on-surface p-2 rounded-full md:hidden cursor-pointer"
                        >
                            <span className="material-symbols-outlined">search</span>
                        </button>


                        {/* User Profile / Auth Actions */}
                        {isPending ? (
                            <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse"></div>
                        ) : session ? (
                            <div className="relative">
                                <button 
                                    className="flex items-center space-x-2 focus:outline-none cursor-pointer"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10">
                                        <img 
                                            alt="Profile" 
                                            className="w-full h-full object-cover" 
                                            src={session.user.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuD9nZf7P5jLpT3R_p6v-z9E5W2u3-i0X8A9E_Y8-0abHz2rhHyC5HywnJEpbJspOkwcin9C4voR_QxHCpqNJVnqiSGG4cnwKqqs1xzDE715zgd441lLxxHYHFMwKu2y83gMAwNV6lDS0N3SJrT-11i3sWcrxFGnQWyjwFNDmZ81RmTfR82wzRaKOF3lVcEztb2reSFGKyqxheRJpUa0Fb2BOvntpJqojC8dGFWkJGab_cxbnF2B9fnVDFYARBcbGULJCJ5mf4avn8"}
                                        />
                                    </div>
                                    <span className="material-symbols-outlined text-on-surface-variant text-sm">
                                        arrow_drop_down
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-surface-container-highest/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                                        <div className="px-4 py-2 border-b border-white/5 mb-1">
                                            <p className="text-xs font-semibold text-[#bbc9cf]">Signed in as</p>
                                            <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
                                        </div>
                                        <Link href="/profile" className="flex items-center space-x-3 px-4 py-2 hover:bg-white/5 text-on-surface text-label-md">
                                            <span className="material-symbols-outlined text-sm">person</span>
                                            <span>My Profile</span>
                                        </Link>
                    
                                        <div className="h-px bg-white/10 my-2"></div>
                                        <button 
                                            onClick={handleSignOut}
                                            className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-white/5 text-error text-label-md text-left transition-colors cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-sm">logout</span>
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link 
                                href="/login" 
                                className="bg-primary text-on-primary font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0px_0px_15px_rgba(0,209,255,0.2)]"
                            >
                                Sign In
                            </Link>
                        )}

                        {/* Hamburger Menu Toggle */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-on-surface-variant hover:text-on-surface p-2 rounded-full md:hidden cursor-pointer flex items-center"
                        >
                            <span className="material-symbols-outlined">
                                {isMobileMenuOpen ? "close" : "menu"}
                            </span>
                        </button>
                    </div>

                </div>
            )}

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && !isMobileSearchOpen && (
                <div className="md:hidden w-full bg-surface-container-low/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex flex-col space-y-4 animate-fade-in z-45">
                    <Link 
                        href="/" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`${isActive('/') ? 'text-primary font-bold' : 'text-on-surface-variant'} font-body-md text-body-md py-2 border-b border-white/5`}
                    >
                        Movies
                    </Link>
                    <Link 
                        href="/series" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`${isActive('/series') ? 'text-primary font-bold' : 'text-on-surface-variant'} font-body-md text-body-md py-2 border-b border-white/5`}
                    >
                        Series
                    </Link>
                    <Link 
                        href="/anime" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`${isActive('/anime') ? 'text-primary font-bold' : 'text-on-surface-variant'} font-body-md text-body-md py-2 border-b border-white/5`}
                    >
                        Anime
                    </Link>
                    <Link 
                        href="/tv" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`${isActive('/tv') ? 'text-primary font-bold' : 'text-on-surface-variant'} font-body-md text-body-md py-2 border-b border-white/5`}
                    >
                        TV Shows
                    </Link>
                    <Link 
                        href="/mylist" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`${isActive('/mylist') ? 'text-primary font-bold' : 'text-on-surface-variant'} font-body-md text-body-md py-2`}
                    >
                        My List
                    </Link>
                </div>
            )}
        </nav>
    );
}
