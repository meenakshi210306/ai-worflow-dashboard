import type { Metadata } from "next";
import { IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ToastStack } from "../components/toast-stack";
import { ThemeProvider } from "../components/theme-provider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "AI Workflow Dashboard",
  description: "Production-ready AI workflow automation dashboard starter"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexSans.variable}`} suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <ThemeProvider>
          {children}
          <ToastStack />
        </ThemeProvider>
      </body>
    </html>
  );
}
