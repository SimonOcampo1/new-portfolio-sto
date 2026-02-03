import type { Metadata } from "next";
import { Geist, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simón Ocampo | Portfolio",
  description:
    "Systems Analyst and future Systems Engineer. Full Stack development and academic research portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${geist.variable} antialiased`}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <SmoothScroll />
            {children}
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
