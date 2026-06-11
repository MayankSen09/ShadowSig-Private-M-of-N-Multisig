import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShadowSig — Private Multisig Infrastructure for LEZ",
  description:
    "Privacy-preserving M-of-N multisig platform with anonymous approvals, shielded governance, and Risc0 threshold proofs for the Logos Execution Zone.",
  keywords: [
    "multisig",
    "zero-knowledge",
    "privacy",
    "zk-proofs",
    "Risc0",
    "LEZ",
    "governance",
    "threshold signatures",
  ],
  openGraph: {
    title: "ShadowSig — Private Multisig Infrastructure",
    description: "Anonymous approvals. Shielded governance. Threshold proofs secured by Risc0.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
