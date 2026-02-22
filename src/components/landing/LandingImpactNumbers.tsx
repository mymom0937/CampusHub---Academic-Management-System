import { GraduationCap, Award, BookOpen, Users } from 'lucide-react'
import { IMPACT_STATS } from '@/lib/landing-constants'

const icons = [Users, Award, BookOpen, GraduationCap]

export function LandingImpactNumbers() {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          Our Impact in Numbers
        </h2>
        <div className="w-16 h-1 bg-primary mx-auto mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {IMPACT_STATS.map((stat, idx) => {
            const Icon = icons[idx] ?? Users
            return (
              <div
                key={idx}
                className="rounded-xl border bg-card p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </p>
                <p className="font-semibold text-foreground mb-1">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
