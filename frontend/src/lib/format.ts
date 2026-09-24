export function timeAgo(iso: string | undefined, now = Date.now()) {
  if (!iso) return "";
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function duration(fromIso: string | undefined, toIso: string | undefined) {
  if (!fromIso || !toIso) return "";
  const s = Math.max(0, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 1000));
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

// "https://github.com/user/repo.git" -> "user/repo"
export function repoName(repoUrl: string | undefined) {
  if (!repoUrl) return "unknown repository";
  try {
    const { pathname, hostname } = new URL(repoUrl);
    const path = pathname.replace(/^\/|\.git$|\/$/g, "");
    return hostname === "github.com" ? path : `${hostname}/${path}`;
  } catch {
    return repoUrl;
  }
}
