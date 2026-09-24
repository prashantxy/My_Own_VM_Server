import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Deployer", template: "%s · Deployer" },
  description: "Deploy a frontend from a Git repository to Cloudflare.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="fixed start-4 top-3 z-50 -translate-y-16 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
          <nav aria-label="Main" className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="-ms-1.5 flex h-9 items-center gap-2 rounded-lg px-1.5 font-semibold tracking-tight">
              <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
                <path d="M12 3.5 21.5 20h-19z" fill="currentColor" />
              </svg>
              Deployer
            </Link>
            <Link
              href="/#deployments"
              className="-me-2 flex h-9 items-center rounded-lg px-2 text-sm text-muted transition-colors duration-150 hover:text-foreground"
            >
              Deployments
            </Link>
          </nav>
        </header>
        <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 pt-12 pb-20 sm:px-6 sm:pt-16">
          {children}
        </main>
        <footer className="border-t border-border">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 text-[0.8125rem] text-muted sm:px-6">
            <span>Deployer</span>
            <span>Workers · R2 · KV · Actions</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
