"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Reusable client component for streaming Anime movies or episodes.
 *
 * Props:
 *   - id:          TMDB/Anime ID (required)
 *   - seasonId:    Season number (optional, only for episodes)
 *   - episodeId:   Episode number (optional, only for episodes)
 *
 * The component automatically chooses a list of streaming servers
 * based on whether an episodeId is supplied. Users can switch servers
 * via a dropdown, and the UI controls fade out after a few seconds
 * of inactivity.
 */
export default function AnimePlayerClient({ id, malId, anilistId, seasonId, episodeId }) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isEpisode = !!episodeId;

  // -------------------------------------------------------------------------
  // Server definitions – choose the appropriate list for movies vs episodes
  // -------------------------------------------------------------------------
  const servers = isEpisode
    ? [
        {
          name: "Videasy (.to)",
          url: `https://player.videasy.to/tv/${id}/${seasonId || 1}/${episodeId}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=00D1FF`,
        },
        {
          name: "Vidfast (Pro)",
          url: `https://vidfast.pro/tv/${id}/${seasonId || 1}/${episodeId}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=00D1FF`,
        },
        { 
          name: "VidLink (Sub)", 
          url: (anilistId || malId) 
            ? `https://vidlink.pro/embed/anime/${anilistId || malId}/${episodeId}/sub` 
            : `https://vidlink.pro/embed/tv/${id}/${seasonId || 1}/${episodeId}?color=00d1ff`, 
        },
        { 
          name: "VidLink (Dub)", 
          url: (anilistId || malId) 
            ? `https://vidlink.pro/embed/anime/${anilistId || malId}/${episodeId}/dub` 
            : `https://vidlink.pro/embed/tv/${id}/${seasonId || 1}/${episodeId}?color=00d1ff`, 
        },
        { name: "VidSrc (.to)", url: `https://vidsrc.to/embed/tv/${id}/${seasonId || 1}/${episodeId}` },
        { name: "VidSrc (.me)", url: `https://vidsrc.me/embed/tv?tmdb=${id}&season=${seasonId || 1}&episode=${episodeId}` },
        { name: "EmbedAPI", url: `https://player.embed-api.stream/?id=${id}&s=${seasonId || 1}&e=${episodeId}&mal=${malId || ""}&anilist=${anilistId || ""}` }
      ]
    : [
        {
          name: "Videasy (.to)",
          url: `https://player.videasy.to/movie/${id}?overlay=true&color=00D1FF`,
        },
        {
          name: "Vidfast (Pro)",
          url: `https://vidfast.pro/movie/${id}?overlay=true&color=00D1FF`,
        },
        { 
          name: "VidLink (Sub)", 
          url: (anilistId || malId) 
            ? `https://vidlink.pro/embed/anime/${anilistId || malId}/0/sub` 
            : `https://vidlink.pro/embed/movie/${id}?color=00d1ff`, 
        },
        { 
          name: "VidLink (Dub)", 
          url: (anilistId || malId) 
            ? `https://vidlink.pro/embed/anime/${anilistId || malId}/0/dub` 
            : `https://vidlink.pro/embed/movie/${id}?color=00d1ff`, 
        },
        { name: "VidSrc (.to)", url: `https://vidsrc.to/embed/movie/${id}` },
        { name: "VidSrc (.me)", url: `https://vidsrc.me/embed/movie?tmdb=${id}` },
        { name: "EmbedAPI", url: `https://player.embed-api.stream/?id=${id}&mal=${malId || ""}&anilist=${anilistId || ""}` }
      ];

  const [activeServer, setActiveServer] = useState(servers.find((s) => s.name === "Vidfast (Pro)") ?? servers[0]); // currently selected server
  const [isOpen, setIsOpen] = useState(false); // server‑selector dropdown visibility
  const [showControls, setShowControls] = useState(true); // UI controls visibility
  const [iframeError, setIframeError] = useState(false); // track iframe load errors

  // Keep activeServer URL in sync if props change (e.g. changing episodes)
  useEffect(() => {
    const matchedServer = servers.find(s => s.name === activeServer.name);
    if (matchedServer) {
      setActiveServer(matchedServer);
    } else {
      setActiveServer(servers[0]);
    }
  }, [id, malId, anilistId, seasonId, episodeId]);

  // Record anime watched history
  useEffect(() => {
    if (!id || !session?.user) return;
    const fetchDetailsAndSave = async () => {
      try {
        let title = "";
        let image = "";
        let subtitle = isEpisode ? `E${episodeId} • Episode ${episodeId}` : "Movie";

        // Try TMDB first
        try {
          const tmdbType = isEpisode ? "tv" : "movie";
          const res = await fetch(`${process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.tmdb.org"}/3/${tmdbType}/${id}?language=en-US`, {
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            title = data.name || data.title || data.original_name || data.original_title || "";
            image = data.backdrop_path 
              ? `https://image.tmdb.org/t/p/w500${data.backdrop_path}` 
              : (data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "");
          }
        } catch (tmdbErr) {
          console.error("TMDB details fetch failed, trying AniList/MAL:", tmdbErr);
        }

        if (!title && (malId || id)) {
          const targetMalId = malId || id;
          const malRes = await fetch(`https://api.myanimelist.net/v2/anime/${targetMalId}?fields=id,title,main_picture`, {
            headers: { 'X-MAL-CLIENT-ID': process.env.NEXT_PUBLIC_MAL_CLIENT_ID || '6114d00ca681b7a291034e32602e1e90' }
          });
          if (malRes.ok) {
            const malData = await malRes.json();
            title = malData.title || "";
            image = malData.main_picture?.large || malData.main_picture?.medium || "";
          }
        }

        if (!title && anilistId) {
          const query = `
            query ($id: Int) {
              Media (id: $id, type: ANIME) {
                title {
                  english
                  romaji
                }
                bannerImage
                coverImage {
                  large
                }
              }
            }
          `;
          const variables = { id: parseInt(anilistId) };
          const aniRes = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query, variables }),
          });
          if (aniRes.ok) {
            const aniData = await aniRes.json();
            const media = aniData.data?.Media;
            if (media) {
              title = media.title.english || media.title.romaji || "";
              image = media.bannerImage || media.coverImage?.large || "";
            }
          }
        }

        if (!title && !malId && id) {
          const targetMalId = id;
          if (targetMalId) {
            try {
              const query = `
                query ($id: Int) {
                  Media (idMal: $id, type: ANIME) {
                    title {
                      english
                      romaji
                    }
                    bannerImage
                    coverImage {
                      large
                    }
                  }
                }
              `;
              const variables = { id: parseInt(targetMalId) };
              const aniRes = await fetch('https://graphql.anilist.co', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ query, variables }),
              });
              if (aniRes.ok) {
                const aniData = await aniRes.json();
                const media = aniData.data?.Media;
                if (media) {
                  title = media.title.english || media.title.romaji || "";
                  image = media.bannerImage || media.coverImage?.large || "";
                }
              }
            } catch (aniErr) {
              console.error("AniList lookup failed:", aniErr);
            }
          }
        }

        const raw = localStorage.getItem("cinestream_anime_continue");
        let list = [];
        if (raw) {
          try { list = JSON.parse(raw); } catch (e) {}
        }
        if (!Array.isArray(list)) list = [];

        // Remove existing item for this anime
        list = list.filter(item => String(item.animeId) !== String(id) && (!malId || String(item.malId) !== String(malId)));

        const progress = Math.floor(Math.random() * 40) + 30; // 30% to 70%

        const newItem = {
          id: `${id}-${isEpisode ? `ep${episodeId}` : 'movie'}`,
          animeId: String(id),
          malId: malId ? String(malId) : null,
          title: title || `Anime #${id}`,
          subtitle: subtitle,
          timeLeft: "15m left",
          progress: progress,
          image: image,
          link: isEpisode 
            ? `/anime/player/${id}?seasonId=${seasonId || 1}&episodeId=${episodeId}` 
            : `/anime/player/${id}`,
          timestamp: Date.now()
        };

        list.unshift(newItem);
        if (list.length > 8) list = list.slice(0, 8);

        localStorage.setItem("cinestream_anime_continue", JSON.stringify(list));
      } catch (e) {
        console.error("Failed to save anime to continue watching:", e);
      }
    };
    fetchDetailsAndSave();
  }, [id, malId, anilistId, seasonId, episodeId, isEpisode, session]);

  // -------------------------------------------------------------------------
  // Auto‑hide controls after 3 seconds of inactivity
  // -------------------------------------------------------------------------
  useEffect(() => {
    let timeoutId;

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!isOpen) setShowControls(false);
      }, 3000);
    };

    const handleKeyDown = () => setShowControls(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);

    // Initial hide after a short delay
    timeoutId = setTimeout(() => {
      if (!isOpen) setShowControls(false);
    }, 3000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [isOpen]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black z-[9999] flex items-center justify-center font-montserrat select-none">
      {/* ---------- Back button ---------- */}
      <button
          onClick={() => {
            const search = new URLSearchParams(window.location.search);
            const ref = search.get('ref');
            if (ref) {
              router.replace(ref);
            } else if (malId) {
              router.replace(`/anime/details/${malId}`);
            } else {
              router.back();
            }
          }}
        className={`absolute top-8 left-8 z-50 text-white hover:text-primary transition-all duration-300 cursor-pointer flex items-center justify-center p-2 rounded-full hover:bg-white/10 ${
          showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        title="Go Back"
      >
        <span className="material-symbols-outlined text-3xl font-semibold">
          arrow_back
        </span>
      </button>

      {/* ---------- Server selector ---------- */}
      <div
        className={`absolute top-6 right-6 z-50 transition-opacity duration-300 ${
          showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-black/60 border border-white/10 hover:bg-white/10 text-white font-label-md text-label-md px-4 py-2.5 rounded-xl flex items-center justify-between gap-2 cursor-pointer backdrop-blur-md transition-all shadow-md select-none w-52 md:w-60 hover:border-primary/30"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="material-symbols-outlined text-lg text-primary shrink-0">
              dns
            </span>
            <span className="truncate">Server: {activeServer.name}</span>
          </div>
          <span
            className="material-symbols-outlined text-sm text-white/60 transition-transform duration-200 shrink-0"
            style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
          >
            expand_more
          </span>
        </button>

        {/* Dropdown list */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-surface-container-highest/90 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-50 backdrop-blur-xl">
            <div className="px-3 py-1.5 text-[10px] font-bold text-white/40 uppercase tracking-wider border-b border-white/5">
              Switch Streaming Server
            </div>
            {servers.map((srv, idx) => {
              const isActive = srv.url === activeServer.url;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveServer(srv);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-label-md font-semibold flex items-center justify-between cursor-pointer ${
                    isActive
                      ? "bg-primary-container text-on-primary-container font-bold"
                      : "text-on-surface hover:bg-white/5"
                  }`}
                >
                  <span>{srv.name}</span>
                  {isActive && (
                    <span className="material-symbols-outlined text-sm text-primary">
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------- Player iframe ---------- */}
      <iframe
        key={activeServer.url}
        className="w-full h-full border-0 pointer-events-auto animate-fade-in"
        src={activeServer.url}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      ></iframe>
    </div>
  );
}
