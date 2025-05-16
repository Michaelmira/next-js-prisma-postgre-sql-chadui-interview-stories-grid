import type { Metadata } from "next";
// import { Geist_Sans, Geist_Mono } from "next/font/google"; // Temporarily commented out
import { Inter } from "next/font/google"; // Using Inter for testing
import "./globals.css";
import Providers from "@/components/Providers";

// const geistSans = Geist_Sans({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Example variable name, can be anything
});

export const metadata: Metadata = {
  title: "Interview Story App",
  description: "Share and manage your interview stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}> {/* Apply font variable to html tag */}
      <body
        className={`antialiased`} /* Removed direct font variables here, relying on html tag */
      ><Providers>{children}</Providers></body>
    </html>
  );
}
