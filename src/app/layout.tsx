import "@/css/satoshi.css";
import "@/css/style.css";

import { Sidebar } from "@/components/Layouts/sidebar";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import { Header } from "@/components/Layouts/header";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

import { LoadingProvider } from './loading-context'
import LoadingScreen from '@/components/Layouts/LoadingScreen'


export const metadata: Metadata = {
  title: {
    template: "%s | Niigata Koi Global Admin",
    default: "Niigata Koi Global Admin Dashboard",
  },
  description:
    "Admin dashboard for Niigata Koi Global, providing seamless management of inventory, sales, and operations with an intuitive and responsive interface.",
};


export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <NextTopLoader showSpinner={false} />
          <LoadingProvider>
          <LoadingScreen />
          <div className="flex min-h-screen">
            <Sidebar />

            <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
              <Header />
              <Toaster position="bottom-right" />
              <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 pb-0">
                {children}
              </main>
            </div>
          </div>
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
