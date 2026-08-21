import { Link, Navigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { HydrationSkeleton } from "@/features/auth/ProtectedRoute";
import { useAuthStore } from "@/features/auth/authStore";
import { cn } from "@/lib/utils";

const nav = [
  { href: "#product", label: "Product" },
  { href: "#sharing", label: "Sharing" },
  { href: "#status", label: "Live status" },
];

const columns = [
  {
    name: "Todo",
    cards: [
      { title: "Ship invite picker", meta: "High · Maya", tone: "muted" as const },
      { title: "Write landing copy", meta: "Unassigned", tone: "muted" as const },
    ],
  },
  {
    name: "In progress",
    cards: [{ title: "Fix board filters", meta: "You", tone: "accent" as const }],
  },
  {
    name: "Done",
    cards: [{ title: "Personal workspace", meta: "Alex", tone: "muted" as const }],
  },
];

export function LandingPage() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);

  if (!hydrated) return <HydrationSkeleton />;
  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-2 px-4 md:h-16 md:gap-4 md:px-6">
          <Link to="/" className="flex min-w-0 shrink items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary font-heading text-xs font-semibold text-primary-foreground">
              T
            </span>
            <span className="font-heading hidden truncate text-[15px] tracking-tight sm:inline">
              Task Tracker
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground lg:flex" aria-label="Page">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button variant="ghost" className="min-h-11 px-2.5 sm:px-3 md:min-h-9" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button className="min-h-11 px-3 sm:px-4 md:min-h-9" asChild>
              <Link to="/signup">
                <span className="sm:hidden">Sign up</span>
                <span className="hidden sm:inline">Get started</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="mx-auto grid min-w-0 max-w-6xl items-end gap-8 px-4 pb-10 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-16 md:px-6 md:pb-10 md:pt-20">
          <div className="min-w-0 max-w-xl pb-2">
            <p className="text-[11px] font-medium tracking-[0.22em] text-primary uppercase">
              Work, in one place
            </p>
            <h1 className="mt-4 font-heading text-[2rem] leading-[1.12] tracking-tight text-balance sm:mt-5 sm:text-5xl md:text-[3.4rem] md:leading-[1.05]">
              The board you share is the board they see.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-[17px]">
              Your own workspace on day one. Invite people who already have accounts. Switch into
              that space and assigned work, status, and the list all live together — not copied onto
              anyone’s personal plate.
            </p>
            <div className="mt-7 flex w-full flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
              <Button className="min-h-12 w-full px-6 text-[15px] sm:w-auto" asChild>
                <Link to="/signup">Create your workspace</Link>
              </Button>
              <Button variant="outline" className="min-h-12 w-full px-6 text-[15px] sm:w-auto" asChild>
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              No email invites. They sign up first — you add them from Settings.
            </p>
          </div>
          <BoardPreview />
        </section>

        <section
          id="product"
          className="border-t border-border/80 bg-muted/35"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <div className="max-w-lg">
              <h2 className="font-heading text-2xl tracking-tight md:text-4xl">Everything in the product</h2>
              <p className="mt-3 text-muted-foreground">
                Built as a list, a board, and a snapshot — always scoped to the workspace in the
                switcher.
              </p>
            </div>

            <div className="mt-8 grid min-w-0 gap-px overflow-hidden rounded-2xl border bg-border sm:mt-12 md:grid-cols-12">
              <FeaturePanel
                className="md:col-span-7"
                kicker="List"
                title="Tasks that stay searchable"
                body="Create, edit, and delete. Search titles. Filter by status, priority, or assigned to you. Sort, paginate, set a due date, pick an assignee from the workspace."
              />
              <FeaturePanel
                className="md:col-span-5"
                kicker="Board"
                title="Three columns. Same tasks."
                body="Todo, In progress, Done. Drag a card on desktop. On a phone, change status on the card. The board is the list, not a second copy."
              />
              <FeaturePanel
                className="md:col-span-4"
                kicker="Dashboard"
                title="Counts for this space"
                body="KPIs and charts for the workspace you selected — not a mix of every membership."
              />
              <FeaturePanel
                className="md:col-span-4"
                kicker="Settings"
                title="People, not inboxes"
                body="Owners add members from a searchable directory of existing accounts. Remove or leave. Theme and display name live here too."
              />
              <FeaturePanel
                className="md:col-span-4"
                kicker="Accounts"
                title="Personal on signup"
                body="Email and password. You land in a private workspace immediately. Sharing is opt-in, owner-only."
              />
            </div>
          </div>
        </section>

        <section id="sharing" className="bg-foreground text-background">
          <div className="mx-auto grid min-w-0 max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:items-start md:gap-14 md:px-6 md:py-24">
            <div>
              <p className="text-[11px] font-medium tracking-[0.22em] text-primary uppercase">Sharing</p>
              <h2 className="mt-4 font-heading text-2xl tracking-tight text-balance md:text-4xl">
                Assignment is not a second board.
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-background/70">
                A task has one workspace. If Alex assigns Maya a card in Alex’s space, Maya still
                has her personal list — empty of that card — until she switches. The switcher is in
                the sidebar, the header, and Settings.
              </p>
            </div>
            <ol className="space-y-0 border-t border-background/15">
              {[
                {
                  step: "01",
                  title: "Both people create accounts",
                  body: "Invites look up people who already signed up. There is no mail-out.",
                },
                {
                  step: "02",
                  title: "Owner taps Add in Settings",
                  body: "Search the directory. One tap. They keep their personal workspace.",
                },
                {
                  step: "03",
                  title: "Both select the shared workspace",
                  body: "Then the list, board, and dashboard are identical — assigned cards included.",
                },
              ].map((item) => (
                <li
                  key={item.step}
                  className="grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] gap-3 border-b border-background/15 py-5 sm:grid-cols-[3.5rem_1fr] sm:gap-4 sm:py-6"
                >
                  <span className="font-heading text-sm text-primary">{item.step}</span>
                  <div>
                    <h3 className="text-[15px] font-medium tracking-tight">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-background/65">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="status" className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="grid min-w-0 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center md:gap-10">
            <div>
              <h2 className="font-heading text-2xl tracking-tight md:text-4xl">
                Status is shared. Timing is not magic.
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
                Your own moves update immediately. Someone else’s move is not pushed live. The app
                rechecks about every 15 seconds, or when you click back into the tab.
              </p>
            </div>
            <Alert className="min-w-0 border-foreground/15 bg-card px-4 py-4 shadow-none sm:px-5 sm:py-5">
              <AlertCircle className="text-primary" />
              <AlertTitle className="font-heading text-base font-normal tracking-tight sm:text-lg">
                If you do not see a task’s status update, refresh the page.
              </AlertTitle>
              <AlertDescription className="mt-1 text-[15px] leading-relaxed">
                Then confirm you both have the same workspace selected. Assigned work never appears
                on a personal board until you switch.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-16 md:flex-row md:items-end md:px-6 md:py-20">
            <div className="max-w-md">
              <h2 className="font-heading text-2xl tracking-tight md:text-3xl">Open a workspace.</h2>
              <p className="mt-3 text-muted-foreground">
                Two minutes to an account. Invite comes later, from Settings, once they exist.
              </p>
            </div>
            <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row">
              <Button className="min-h-12 w-full px-6 sm:w-auto" asChild>
                <Link to="/signup">Create an account</Link>
              </Button>
              <Button variant="outline" className="min-h-12 w-full px-6 sm:w-auto" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeaturePanel({
  kicker,
  title,
  body,
  className,
}: {
  kicker: string;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <article className={cn("min-w-0 bg-background p-5 sm:p-6 md:p-8", className)}>
      <p className="text-[11px] font-medium tracking-[0.18em] text-primary uppercase">{kicker}</p>
      <h3 className="mt-3 font-heading text-xl tracking-tight">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
    </article>
  );
}

function BoardPreview() {
  return (
    <div
      className="min-w-0 md:overflow-hidden md:rounded-2xl md:border md:bg-card md:p-4 md:shadow-[0_24px_80px_-32px_oklch(0.22_0.04_175/0.45)]"
      aria-hidden="true"
    >
      <div className="mb-3 hidden items-center justify-between px-1 md:flex">
        <div>
          <p className="text-[11px] text-muted-foreground">Workspace</p>
          <p className="font-heading text-sm tracking-tight">Studio — shared</p>
        </div>
        <span className="rounded-full bg-primary/12 px-2.5 py-0.5 text-[11px] font-medium text-primary">
          Same board
        </span>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0 md:pb-0 md:snap-none [&::-webkit-scrollbar]:hidden">
        {columns.map((col) => (
          <div
            key={col.name}
            className="w-[min(72vw,16rem)] shrink-0 snap-start rounded-xl border bg-muted/70 p-2 md:w-auto md:border-0"
          >
            <p className="truncate px-1 pb-2 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              {col.name}
            </p>
            <div className="space-y-2">
              {col.cards.map((card) => (
                <div
                  key={card.title}
                  className={cn(
                    "rounded-lg border bg-background px-2.5 py-2",
                    card.tone === "accent" && "border-primary/40 ring-1 ring-primary/20",
                  )}
                >
                  <p className="text-[12px] leading-snug font-medium break-words">{card.title}</p>
                  <p className="mt-1 truncate text-[10px] text-muted-foreground">{card.meta}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
