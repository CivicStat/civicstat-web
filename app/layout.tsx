import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { PostHogProvider } from "./providers";
import PostHogPageView from "../components/PostHogPageView";
import UsersnapWidget from "../components/UsersnapWidget";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "CivicStat — Neutraal Transparantie-Platform",
  description:
    "Parlementaire data, neutraal ontsloten. Moties, stemgedrag en verkiezingsprogramma's — traceerbaar, zonder politieke duiding.",
};

// Script to set dark class before first paint (prevents flash)
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased font-sans">
        <PostHogProvider>
          <PostHogPageView />
          <Nav />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <UsersnapWidget />
        </PostHogProvider>
      </body>
    </html>
  );
}
