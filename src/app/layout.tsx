import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/lib/GameContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Deluxe Blackjack",
  description: "Play blackjack online with authentic casino rules. | Built with Next.js, React, Tailwind CSS, and Framer Motion.",
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
      sizes: "any"
    }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <GameProvider>
          <ThemeProvider>
            <Header />
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </GameProvider>
      </body>
    </html>
  );
}
