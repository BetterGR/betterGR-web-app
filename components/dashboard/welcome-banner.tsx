export function WelcomeBanner() {
  return (
    <div className="flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3">
      <div>
        <h2 className="text-lg font-semibold">Welcome back, Student</h2>
        <p className="text-sm text-muted-foreground">
          Here's what's happening with your courses today.
        </p>
      </div>
    </div>
  );
}