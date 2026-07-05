"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    if (pathname === "/signin" || pathname === "/login" || pathname === "/register") {
        return null;
    }
    return (
        <footer className="bg-surface-container-low w-full mt-xl border-t border-white/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter px-lg py-xl max-w-container-max mx-auto">
                
                {/* Column 1: Brand & Socials */}
                <div className="col-span-2 md:col-span-1 space-y-md">
                    <div className="flex items-center space-x-3">
                        <img 
                            src="./image.svg" 
                            alt="CineStream Logo" 
                            className="h-14 w-auto object-contain" 
                        />
                        <span className="font-headline-md text-headline-md text-primary font-bold">
                            CineStream
                        </span>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">© {new Date().getFullYear()} CineStream. All rights reserved.</p>
                    <div className="flex space-x-4">
                        <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">
                            facebook
                        </span>
                        <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer">
                            language
                        </span>
                    </div>
                </div>

                {/* Column 2: Platform */}
                <div className="flex flex-col space-y-sm">
                    <h4 className="text-white font-bold mb-2">Platform</h4>
                    <Link href="/help" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                        Help Center
                    </Link>
                    <Link href="/terms" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                        Terms of Use
                    </Link>
                    <Link href="/devices" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                        Devices
                    </Link>
                </div>

                {/* Column 3: Legal */}
                <div className="flex flex-col space-y-sm">
                    <h4 className="text-white font-bold mb-2">Legal</h4>
                    <Link href="/privacy" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/cookies" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                        Cookie Preferences
                    </Link>
                    <Link href="/notices" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                        Legal Notices
                    </Link>
                </div>

                {/* Column 4: Support */}
                <div className="flex flex-col space-y-sm">
                    <h4 className="text-white font-bold mb-2">Support</h4>
                    <Link href="/corporate" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                        Corporate Info
                    </Link>
                    <Link href="/contact" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                        Contact Us
                    </Link>
                    <Link href="/live-chat" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                        Live Support
                    </Link>
                </div>

            </div>
        </footer>
    );
}
