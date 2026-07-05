"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnimeNav({ activeGenreId, onGenreChange }) {
    const router = useRouter();

    const genreMap = {
        "All Genres": "",
        "Shonen": "27",
        "Seinen": "42",
        "Action": "1",
        "Fantasy": "10",
        "Cyberpunk": "24",
        "Mecha": "18",
        "Romance": "22",
        "Slice of Life": "36"
    };

    const genres = Object.keys(genreMap);
    
    const currentSelected = activeGenreId 
        ? (Object.keys(genreMap).find(key => String(genreMap[key]) === String(activeGenreId)) || "All Genres")
        : "All Genres";

    const [selected, setSelected] = useState(currentSelected);

    // Keep selected chip in sync with route params
    useEffect(() => {
        if (activeGenreId) {
            const current = Object.keys(genreMap).find(key => String(genreMap[key]) === String(activeGenreId)) || "All Genres";
            setSelected(current);
        } else {
            setSelected("All Genres");
        }
    }, [activeGenreId]);

    const handleSelect = (genre) => {
        setSelected(genre);
        const genreId = genreMap[genre];
        if (genre === "All Genres") {
            router.push("/anime");
        } else {
            router.push(`/anime/genres/${genreId}`);
        }
        if (onGenreChange) {
            onGenreChange(genre);
        }
    };

    return (
        <section className="px-gutter md:px-lg mt-6 relative z-20">
            {/* Scoped styles to hide horizontal scrollbar on chips */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            
            <div className="flex items-center justify-center  space-x-4 overflow-x-auto hide-scrollbar pb-4">
                {genres.map((genre) => {
                    const isSelected = selected === genre;
                    return (
                        <button
                            key={genre}
                            onClick={() => handleSelect(genre)}
                            className={`px-6 py-2 rounded-full text-label-md font-label-md tracking-label-md transition-all duration-300 whitespace-nowrap cursor-pointer ${
                                isSelected
                                    ? "bg-primary-container text-on-primary-container font-semibold"
                                    : "bg-surface-container-high border border-outline-variant/30 hover:border-primary-container text-on-surface-variant hover:text-primary font-medium"
                            }`}
                        >
                            {genre}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
