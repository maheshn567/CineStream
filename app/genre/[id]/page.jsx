import HeroClousre from "@/features/movies/components/HeroClousre";
import GenresNav from "@/features/movies/components/Genres.Nav";
import NewRelease from "@/features/movies/components/NewRelease";

export default function GenrePage() {
    return (
        <div className="min-h-screen w-full bg-surface font-montserrat pb-12">
            <HeroClousre />
            <div className="bg-surface relative -mt-8 z-20 rounded-t-3xl">
                <GenresNav />
            </div>
            {/* Displaying movies specific to the genre ID parsed from URL */}
            <NewRelease />
        </div>
    );
}
