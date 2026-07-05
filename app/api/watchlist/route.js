import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const { tmdbId, type } = await req.json();
        if (!tmdbId || !type) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Check if already in watchlist
        const existing = await db.userWatchList.findFirst({
            where: {
                user_id: session.user.id,
                tmdb_id: Number(tmdbId),
                type: type
            }
        });

        if (existing) {
            return NextResponse.json({ message: "Already in watchlist", id: existing.id }, { status: 200 });
        }

        const watchlistItem = await db.userWatchList.create({
            data: {
                user_id: session.user.id,
                tmdb_id: Number(tmdbId),
                type: type
            }
        });

        return NextResponse.json(watchlistItem, { status: 201 });
    } catch (err) {
        console.error("Watchlist POST error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tmdbId } = await req.json();
        if (!tmdbId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        await db.userWatchList.deleteMany({
            where: {
                user_id: session.user.id,
                tmdb_id: Number(tmdbId)
            }
        });

        return NextResponse.json({ message: "Removed successfully" }, { status: 200 });
    } catch (err) {
        console.error("Watchlist DELETE error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
