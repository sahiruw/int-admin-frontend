import "@/css/satoshi.css";
import "@/css/style.css";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/hooks/use-auth";
import { ConditionalLayout } from "@/components/Layouts/ConditionalLayout";

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
          <AuthProvider>
            <NextTopLoader showSpinner={false} />
            <LoadingProvider>
              <LoadingScreen />
              <ConditionalLayout>
                <Toaster position="bottom-right" />
                {children}
              </ConditionalLayout>
            </LoadingProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
