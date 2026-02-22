export function LandingAbout() {
  return (
    <section id="about" className="py-16 px-4 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">About</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Built with Modern Tech</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          CampusHub is a full-stack academic management SaaS built with TanStack Start (React),
          TypeScript, Prisma ORM with PostgreSQL, Better-Auth for session-based authentication,
          and shadcn/ui + Tailwind CSS for a modern, production-ready dashboard experience.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'TanStack Start',
            'React',
            'TypeScript',
            'TanStack Query',
            'Zod',
            'Prisma',
            'PostgreSQL',
            'Better-Auth',
            'Tailwind CSS',
            'shadcn/ui',
          ].map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

