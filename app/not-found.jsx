import NotFoundClient from "@/components/NotFoundClient";

export default function NotFound() {
    return (
        <main className="min-h-screen w-full bg-surface flex flex-col items-center justify-center relative overflow-hidden px-6 font-montserrat text-on-surface">
            {/* Cinematic background glows */}
            <div 
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    background: "radial-gradient(circle at center, rgba(0, 209, 255, 0.15) 0%, transparent 60%)"
                }}
            />
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="z-10 max-w-[36rem] w-full text-center space-y-8 bg-surface-container-low/40 backdrop-blur-xl border border-white/5 p-8 md:p-12 rounded-3xl shadow-2xl animate-fade-in">
                {/* Cinema Filter Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse">
                    <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>
                        movie_filter
                    </span>
                </div>

                {/* 404 Glow Title */}
                <div className="space-y-2">
                    <h1 className="text-[6.5rem] md:text-[8rem] font-extrabold leading-none tracking-tighter bg-gradient-to-r from-primary via-primary-container to-white bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,209,255,0.3)] select-none">
                        404
                    </h1>
                    <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white">
                        Scene Not Found
                    </h2>
                </div>

                {/* Subtext */}
                <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-[28rem] mx-auto font-medium">
                    The reel you are looking for has been cut from the final edit, or moved to a different timeline. Let's get you back to the main feature.
                </p>

                {/* Action Buttons (Client side wrapper) */}
                <NotFoundClient />
            </div>
        </main>
    );
}
