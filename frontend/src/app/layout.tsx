import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist_Mono, Inter } from "next/font/google";
import { DeploySheetProvider } from "@/components/deploy-sheet";
import { GitHubMark } from "@/components/github-mark";
import { SiteNav } from "@/components/site-nav";
import { container } from "@/components/ui";
import { repoPageUrl } from "@/lib/api";
import "./globals.css";

// Fallbacks for platforms without San Francisco. Inter's optical size axis tracks SF's Text/Display split.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
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
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

function Logo({ className = "size-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 3.5 21.5 20h-19z" fill="currentColor" />
    </svg>
  );
}

const footerLink = "transition-colors duration-200 hover:text-foreground";

export default function RootLayout({ children }: LayoutProps<"/">) {
  const repo = repoPageUrl();

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Lets CSS hold hero content for its intro animation only when scripts actually run. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <DeploySheetProvider>
          <a
            href="#main"
            className="fixed start-4 top-2 z-50 -translate-y-16 rounded-full bg-accent px-4 py-2 text-footnote font-medium text-white focus-visible:translate-y-0"
          >
            Skip to content
          </a>
          <header className="material scroll-edge sticky top-0 z-40">
            <nav aria-label="Main" className={`${container} flex h-12 items-center justify-between`}>
              <Link href="/" className="-ms-2 flex h-8 items-center gap-2 rounded-full px-2 text-callout font-semibold tracking-[-0.015em]">
                <Logo />
                Deployer
              </Link>
              <SiteNav />
            </nav>
          </header>

          <main id="main" className="flex-1">
            {children}
          </main>

          <footer className="bg-canvas text-footnote text-muted">
            <div className={`${container} py-10`}>
              <div className="flex flex-col gap-6 border-b border-separator pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-callout font-semibold text-foreground">
                    <Logo className="size-4" />
                    Deployer
                  </p>
                  <p className="max-w-xs text-pretty">Git repo in, live subdomain out. Built on Workers, KV, R2 and GitHub Actions.</p>
                </div>
                <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2 sm:flex sm:gap-x-8">
                  <Link href="/#how" className={footerLink}>
                    How it works
                  </Link>
                  <Link href="/#architecture" className={footerLink}>
                    Architecture
                  </Link>
                  <Link href="/deployments" className={footerLink}>
                    Deployments
                  </Link>
                  {repo && (
                    <a href={repo} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 ${footerLink}`}>
                      <GitHubMark className="size-3.5" />
                      Source
                    </a>
                  )}
                </nav>
              </div>
              <p className="pt-5 text-caption">No servers were harmed in the making of these deploys.</p>
            </div>
          </footer>
        </DeploySheetProvider>
      </body>
    </html>
  );
}
