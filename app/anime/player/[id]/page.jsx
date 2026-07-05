"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import AnimePlayerClient from "@/features/anime/components/AnimePlayerClient";

/**
 * Player page that receives an anime ID and optional season/episode IDs.
 * It renders the reusable AnimePlayerClient which provides server switching.
 *
 * URL format examples:
 *   /anime/player/123                 -> movie streaming
 *   /anime/player/123?seasonId=2&episodeId=5   -> series episode streaming
 *   /anime/player/123?trailerKey=abc123        -> trailer playback (YouTube embed handled elsewhere)
 */
export default function AnimePlayerPage() {
  const { id } = useParams(); // get dynamic route id
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract query parameters if present
  const seasonId = searchParams?.get("seasonId") ?? undefined;
  const episodeId = searchParams?.get("episodeId") ?? undefined;
  const trailerKey = searchParams?.get("trailerKey") ?? undefined;
  
  // Read malId and anilistId from sessionStorage to keep URLs clean
  const [malId, setMalId] = useState(undefined);
  const [anilistId, setAnilistId] = useState(undefined);

  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      try {
        const stored = sessionStorage.getItem(`anime_ids_${id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.malId) setMalId(parsed.malId);
          if (parsed.anilistId) setAnilistId(parsed.anilistId);
        }
      } catch (e) {
        console.error("Failed to load anime IDs from sessionStorage:", e);
      }
    }
  }, [id]);

  // If a trailerKey is supplied we could render a simple YouTube iframe directly.
  // For consistency with the existing player UI we delegate to AnimePlayerClient
  // which will treat the lack of episodeId as a movie stream. The trailer case
  // is handled inside AnimeDetailsPage by passing the key to the player page.

  return (
    <div className="relative min-h-screen bg-black">
      {/* Render the player component */}
      <AnimePlayerClient
        id={id}
        malId={malId}
        anilistId={anilistId}
        seasonId={seasonId}
        episodeId={episodeId}
        // Pass trailerKey via a custom prop if you wish to embed YouTube directly.
        // The current AnimePlayerClient does not use this prop, but keeping it here
        // makes future extensions straightforward.
        // trailerKey={trailerKey}
      />
    </div>
  );
}
