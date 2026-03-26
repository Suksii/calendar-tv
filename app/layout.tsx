import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
  title: "TV Kalendar",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cnr">
      <body className="min-h-full flex flex-col">
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
