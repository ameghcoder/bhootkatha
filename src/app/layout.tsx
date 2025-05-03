import type { Metadata } from 'next';
import { Inter, Creepster } from 'next/font/google'; // Using Inter as base, Creepster for titles potentially
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Example of adding a "creepy" font - apply this selectively
const fontCreepy = Creepster({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-creepy",
});


export const metadata: Metadata = {
  title: 'Bhootkatha - Hindi Horror Script Generator',
  description: 'Generate cinematic Hindi horror scripts with AI and visualize scenes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased dark", // Apply dark theme globally
          fontSans.variable,
          fontCreepy.variable
        )}
      >
        {children}
        <Toaster />

        {/* Replace Your Google Analytics Code here */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HMZV5DRB8P"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HMZV5DRB8P');
          `}
        </Script>
      </body>
    </html>
  );
}
