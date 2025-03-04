import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/lib/GameContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Deluxe Blackjack",
  description: "Play blackjack online with authentic casino rules. | Built with Next.js, React, Tailwind CSS, and Framer Motion.",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Deluxe Blackjack",
  },
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
      sizes: "any"
    }
  ],
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
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
