import type { Metadata } from 'next';
import { Inter, Creepster } from 'next/font/google'; // Using Inter as base, Creepster for titles potentially
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

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
      </body>
    </html>
  );
}
