import HeroClousre from "@/features/movies/components/HeroClousre";
import GenresNav from "@/features/movies/components/Genres.Nav";
import Continue from "@/features/movies/components/Continue";
import NewRelease from "@/features/movies/components/NewRelease";
import TopRated from "@/features/movies/components/TopRated";
import Popular from "@/features/movies/components/popular";
import Upcomming from "@/features/movies/components/Upcomming";



export default function Home() {
  return (  
    <div className="min-h-screen w-full bg-surface font-montserrat pb-12">
    <HeroClousre/>
    <div className="bg-surface relative -mt-8 z-20 rounded-t-3xl">
    <GenresNav/>
    </div>
    <Continue/>
    <TopRated/>
    <Popular/>
    <NewRelease/>
    <Upcomming/>
    </div>
    
  );
}
