import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h1 className="font-display text-4xl">404</h1>
      <p className="text-muted-foreground">Page not found.</p>
      <Link
        href="/"
        className="rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground"
      >
        Return home
      </Link>
    </div>
  );
}
