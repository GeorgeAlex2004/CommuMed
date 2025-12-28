import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommuMed - Medical Textbook Search",
  description: "Fast and accurate medical textbook search system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className="antialiased h-full overflow-hidden">{children}</body>
    </html>
  );
}

