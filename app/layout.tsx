import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};


export const metadata: Metadata = {
  title: {
    default: "SDEJT - Gestor de Presenças",
    template: "%s | Gestor de Presenças",
  },
  description:
    "Sistema corporativo de registo de ponto e assiduidade via QR Code. Uso exclusivo interno.",
  keywords: ["ponto", "presença", "qr code", "gestão", "moçambique", "interno"],
  authors: [{ name: "Equipa de TI" }],
  applicationName: "SDEJT",

  robots: {
    index: false,
    follow: false,
  },

  openGraph: {
    title: "Gestor de Presenças",
    description: "Registo de presença diário.",
    type: "website",
    locale: "pt_MZ",
    siteName: "SDEJT",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-MZ">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
