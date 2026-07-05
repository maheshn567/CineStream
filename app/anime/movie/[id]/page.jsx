import AnimePlayerClient from '@/features/anime/components/AnimePlayerClient';

export default async function AnimeMovie({ params }) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center">
      <AnimePlayerClient id={id} />
    </main>
  );
}