import type { Metadata } from "next";
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
  description: "Deploy frontend repos to Cloudflare in one click.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-border">
          <nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                <path d="M12 3 22 20H2z" fill="currentColor" />
              </svg>
              Deployer
            </Link>
            <Link href="/#deployments" className="text-sm text-muted hover:text-foreground">
              Deployments
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:py-14">{children}</main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted">
          Cloudflare Workers · R2 · KV · GitHub Actions
        </footer>
      </body>
    </html>
  );
}
