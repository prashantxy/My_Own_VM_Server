import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { GitHubMark } from "@/components/github-mark";
import { SiteNav } from "@/components/site-nav";
import { container } from "@/components/ui";
import { repoPageUrl } from "@/lib/api";
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
  title: { default: "Deployer: ship a frontend from any Git repo", template: "%s · Deployer" },
  description: "Paste a Git repository. It’s built on GitHub Actions, stored in R2 and served from its own subdomain on Cloudflare.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

function Logo() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path d="M12 3.5 21.5 20h-19z" fill="currentColor" />
    </svg>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const repo = repoPageUrl();

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Lets CSS hold hero content for its intro animation only when scripts actually run. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="fixed start-4 top-3 z-50 -translate-y-16 rounded-lg bg-foreground px-3 py-2 text-sm font-medium text-background focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
          <nav aria-label="Main" className={`${container} flex h-14 items-center justify-between`}>
            <Link href="/" className="-ms-1.5 flex h-9 items-center gap-2 rounded-lg px-1.5 font-semibold tracking-tight">
              <Logo />
              Deployer
            </Link>
            <SiteNav />
          </nav>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="border-t border-border">
          <div className={`${container} flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between`}>
            <div className="space-y-2">
              <p className="flex items-center gap-2 font-semibold tracking-tight">
                <Logo />
                Deployer
              </p>
              <p className="max-w-xs text-sm text-pretty text-muted">
                Git repo in, live subdomain out. Built on Workers, KV, R2 and GitHub Actions.
              </p>
            </div>
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <Link href="/#how" className="transition-colors duration-150 hover:text-foreground">
                How it works
              </Link>
              <Link href="/#architecture" className="transition-colors duration-150 hover:text-foreground">
                Architecture
              </Link>
              <Link href="/deployments" className="transition-colors duration-150 hover:text-foreground">
                Deployments
              </Link>
              {repo && (
                <a href={repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-foreground">
                  <GitHubMark className="size-3.5" />
                  Source
                </a>
              )}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
