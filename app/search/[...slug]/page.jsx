import SearchPage from "@/features/movies/components/SearchPage";
import { notFound } from "next/navigation";

export default async function SearchPages({params}){
    const {slug} = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL}/3/search/multi?query=${slug}&include_adult=false&language=en-US&page=1`,{
        headers:{
            accept: "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
        },
        next: { revalidate: 86400 }
    });
    if (!res.ok) {
        if (res.status === 404) {
            notFound();
        }
        throw new Error("Failed to fetch search results from server");
    }
    const data = await res.json();
    const queryStr = decodeURIComponent(Array.isArray(slug) ? slug.join(" ") : slug);
    return(
        <>
            <SearchPage data={data} query={queryStr} />  
        </>
    )
}