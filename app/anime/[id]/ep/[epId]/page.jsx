import AnimePlayerClient from '@/features/anime/components/AnimePlayerClient';

/**
 * Anime episode streaming page
 * Uses the reusable AnimePlayerClient component to play the selected episode.
 * The page receives the anime ID and episode ID from the route parameters.
 */
export default async function AnimeEpisode({ params }) {
  // Destructure route parameters – Next.js provides them in the params object
  const { id: animeId, epId: episodeId } = await params;

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      {/* Player component that handles server selection and UI controls */}
      <AnimePlayerClient id={animeId} episodeId={episodeId} />
    </main>
  );
}
