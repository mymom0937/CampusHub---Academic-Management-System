export function LandingAbout() {
  return (
    <section id="about" className="py-16 md:py-24 px-4 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">About</p>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Excellence in Academic Management</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          CampusHub is a modern academic management platform designed for universities and colleges.
          We streamline enrollment, grading, and administration so students, instructors, and
          administrators can focus on what matters most: teaching and learning.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'Course Management',
            'Enrollment',
            'Grading & GPA',
            'Transcripts',
            'Announcements',
            'Role-Based Access',
          ].map((item) => (
            <span
              key={item}
              className="inline-flex items-center rounded-full border bg-background px-4 py-1.5 text-sm font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
