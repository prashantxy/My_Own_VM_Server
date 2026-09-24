import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Deployment not found</h1>
      <p className="text-muted">It may have been removed, or the ID is wrong.</p>
      <Link href="/" className="inline-block text-sm underline">
        Back to deployments
      </Link>
    </div>
  );
}
