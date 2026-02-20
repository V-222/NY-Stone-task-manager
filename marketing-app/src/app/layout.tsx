import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "NY Stone Marketing",
  description: "Marketing team task manager for NY Stone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <AppProvider>
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
