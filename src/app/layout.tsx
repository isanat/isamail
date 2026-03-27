import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IsaMail - Email Profissional com Domínio Próprio",
  description: "Serviço de email profissional com domínio próprio. Privacidade, performance e suporte especializado para sua empresa.",
  keywords: ["IsaMail", "Email profissional", "Domínio próprio", "Email corporativo", "Email empresarial"],
  authors: [{ name: "IsaMail Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "IsaMail - Email Profissional com Domínio Próprio",
    description: "Serviço de email profissional com domínio próprio. Privacidade, performance e suporte especializado.",
    url: "https://isamail.space",
    siteName: "IsaMail",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IsaMail - Email Profissional com Domínio Próprio",
    description: "Serviço de email profissional com domínio próprio. Privacidade, performance e suporte especializado.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
