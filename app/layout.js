import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Providers from "@/lib/tenstack/client";
import { Agentation } from "agentation";

export const metadata = {
  title: "CineStream - Cinematic Video Portal",
  description: "A premium, lights-out cinema portal showcase for discovering new releases and top masterpieces.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dynamic Font Loading */}
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background font-montserrat">
        <NavBar />
        <Providers>{children}</Providers>
        <Footer />
        <Agentation/>
      </body>
    </html>
  );
}
