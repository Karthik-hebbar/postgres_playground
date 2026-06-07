import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PostgreSQL Playground",
  description: "Local PostgreSQL query playground",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${ibmPlexMono.variable} h-full`}>
      <body className="h-full overflow-hidden bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
