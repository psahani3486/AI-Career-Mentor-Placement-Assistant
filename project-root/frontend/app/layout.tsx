import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Career Mentor — Your Intelligent Career Companion",
  description:
    "Accelerate your career with AI-powered resume analysis, mock interviews, personalized roadmaps, and an intelligent career chatbot.",
  keywords: [
    "AI",
    "career",
    "mentor",
    "resume",
    "interview",
    "roadmap",
    "chatbot",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full bg-[#0a0a0f] text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
