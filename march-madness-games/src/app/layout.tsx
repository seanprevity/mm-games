import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "March Madness Mini Games",
  description: "March Madness themed Connections, Crossword, and Millionaire",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
