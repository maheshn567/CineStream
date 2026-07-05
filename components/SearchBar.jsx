"use client"
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [istyping, setIsTyping] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Sync search input with URL path
    useEffect(() => {
        if (pathname && pathname.startsWith("/search/")) {
            const queryFromPath = pathname.substring(8); // Get path suffix after "/search/"
            const decodedQuery = decodeURIComponent(queryFromPath).replace(/\//g, " ");
            if (decodedQuery !== searchQuery) {
                setSearchQuery(decodedQuery);
            }
        } else {
            setSearchQuery("");
        }
    }, [pathname]);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/search/${searchQuery}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Debounce query entry
    useEffect(() => {
        if (!searchQuery.trim()) {
            setIsTyping(false);
            return;
        }
        setIsTyping(true);
        
        const timer = setTimeout(() => {
            setIsTyping(false);
            handleSearch();
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <div>
           <div className="relative focus-within:ring-2 focus-within:ring-primary/50 rounded-full hidden md:block">
                {/* Dynamic micro-spinner or search icon based on typing state */}
                {istyping ? (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <span 
                        onClick={handleSearch}
                        className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                    >
                        search
                    </span>
                )}
                
                <input 
                    className="bg-surface-container-high border-outline-variant text-on-surface font-body-md text-body-md rounded-full pl-10 pr-10 py-2 w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-on-surface-variant" 
                    placeholder="Search..." 
                    type="text"
                    name="searchBar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />

                {/* Clear button */}
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none cursor-pointer flex items-center"
                    >
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                )}
            </div> 
        </div>
    );
}