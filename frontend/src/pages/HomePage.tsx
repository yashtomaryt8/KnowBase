export function HomePage() {
  return (
    <section className="min-h-full px-8 py-10">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-border/70 bg-background/80 p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Frontend Setup</p>
        <h2 className="mt-4 text-4xl font-semibold">KnowBase workspace is ready.</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          The React, Vite, Tailwind, router, query client, Zustand UI store, and shared types are in place.
          The next prompts can focus on topic trees, editors, and search behavior.
        </p>
      </div>
    </section>
  )
}
