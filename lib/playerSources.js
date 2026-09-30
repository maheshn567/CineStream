// Embed sources used by the movie, series, and anime players.
// Each builder returns an ordered list of { name, url }. The players show the
// list in a server dropdown, so the order here is the order users see.

// Source the series and anime players select first.
export const DEFAULT_SOURCE_NAME = "Vidfast (Pro)";

export function getMovieSources(id) {
    return [
        { name: "Vidfast (Pro)", url: `https://vidfast.pro/movie/${id}?overlay=true&color=00D1FF` },
        { name: "Videasy (.to)", url: `https://player.videasy.to/movie/${id}?overlay=true&color=00D1FF` },
        { name: "Videasy (.net)", url: `https://player.videasy.net/movie/${id}?overlay=true&color=00D1FF` },
        { name: "VidSrc (.to)", url: `https://vidsrc.to/embed/movie/${id}` },
        { name: "VidSrc (.me)", url: `https://vidsrc.me/embed/movie?tmdb=${id}` },
        { name: "VidLink (Sub)", url: `https://vidlink.pro/embed/movie/${id}?color=00D1FF` },
        { name: "VidLink (Dub)", url: `https://vidlink.pro/embed/movie/${id}?color=00D1FF` },
        { name: "EmbedAPI", url: `https://player.embed-api.stream/?id=${id}` }
    ];
}

export function getSeriesSources({ id, seasonId, episodeId }) {
    return [
        { name: "Videasy (.to)", url: `https://player.videasy.to/tv/${id}/${seasonId}/${episodeId}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=00D1FF` },
        { name: "Vidfast (Pro)", url: `https://vidfast.pro/tv/${id}/${seasonId}/${episodeId}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=00D1FF` },
        { name: "Videasy (.net)", url: `https://player.videasy.net/tv/${id}/${seasonId}/${episodeId}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=00D1FF` },
        { name: "VidSrc (.to)", url: `https://vidsrc.to/embed/tv/${id}/${seasonId}/${episodeId}` },
        { name: "VidSrc (.me)", url: `https://vidsrc.me/embed/tv?tmdb=${id}&season=${seasonId}&episode=${episodeId}` },
        { name: "EmbedAPI", url: `https://player.embed-api.stream/?id=${id}&s=${seasonId}&e=${episodeId}` }
    ];
}

// Anime episodes. The VidLink entries use the AniList/MAL id (sub/dub) when one
// is available and fall back to the TMDB id otherwise.
export function getAnimeEpisodeSources({ id, malId, anilistId, seasonId, episodeId }) {
    return [
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
    ];
}

// Anime movies.
export function getAnimeMovieSources({ id, malId, anilistId }) {
    return [
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
}

// Single inline embed on the anime details page (a preview player, not the server dropdown).
export function getAnimeDetailsPreviewUrl({ tmdbId, season, episode }) {
    return `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}?color=00d1ff`;
}
