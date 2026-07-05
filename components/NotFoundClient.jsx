"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundClient() {
    const router = useRouter();

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
            <button 
                onClick={() => router.back()}
                className="w-full sm:w-auto bg-surface-container-high hover:bg-surface-variant border border-outline-variant/30 text-white font-semibold px-8 py-3.5 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>Go Back</span>
            </button>
            
            <Link 
                href="/"
                className="w-full sm:w-auto bg-primary-container text-on-primary-container hover:shadow-[0_0_20px_rgba(0,209,255,0.4)] font-bold px-8 py-3.5 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                <span>Back to Home</span>
            </Link>
        </div>
    );
}
