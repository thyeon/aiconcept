import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/react-query";
import { Toaster } from "@/components/ui/sonner";
import { SidebarNav, MobileNav } from "@/components/layout/sidebar-nav";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Document Processing Platform",
  description: "Enterprise-grade AI-driven document processing system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.variable} antialiased`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar Navigation */}
          <SidebarNav />

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <QueryProvider>
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {children}
              </div>
            </QueryProvider>
          </main>
        </div>

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Toast Notifications */}
        <Toaster />
      </body>
    </html>
  );
}
