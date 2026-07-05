import SeriesPlayerClient from "@/features/series/components/SeriesPlayerClient";

export default async function SeriesPlayerPage({ params }) {
    const { id, seasonId, episodeId } = await params;

    return (
        <SeriesPlayerClient 
            id={id} 
            seasonId={seasonId} 
            episodeId={episodeId} 
        />
    );
}