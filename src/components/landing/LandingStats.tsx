const stats = [
  { value: '3', label: 'User roles (Admin, Instructor, Student)' },
  { value: '4.0', label: 'GPA scale with academic standing' },
  { value: '100%', label: 'Type-safe (TypeScript + Zod)' },
  { value: 'SaaS', label: 'Dashboard UX patterns built-in' },
]

export function LandingStats() {
  return (
    <section className="border-y bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

