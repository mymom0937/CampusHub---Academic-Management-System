import { Link } from '@tanstack/react-router'
import { ArrowRight, LayoutDashboard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Carousel } from '@/components/ui/carousel'
import { ImgWithFallback } from '@/components/ui/img-with-fallback'
import { HERO_SLIDES } from '@/lib/landing-constants'
import type { SessionUser } from '@/types/dto'

type LandingHeroProps = {
  user: SessionUser | null
  dashboardPath: string | null
}

function HeroSlide({
  image,
  title,
  description,
  cta,
  ctaSecondary,
  user,
  dashboardPath,
}: {
  image: string
  title: string
  description: string
  cta: string
  ctaSecondary: string
  user: SessionUser | null
  dashboardPath: string | null
}) {
  return (
    <div className="relative h-[70vh] min-h-[500px] w-full bg-gradient-to-br from-slate-800 to-slate-900">
      <ImgWithFallback
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="relative flex h-full items-center justify-end pr-4 md:pr-16 lg:pr-24">
        <div className="max-w-xl text-right md:max-w-2xl">
          <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl leading-tight mb-4">
            {title}
          </h1>
          <p className="text-white/90 text-base md:text-lg mb-8 leading-relaxed">
            {description}
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            {user && dashboardPath ? (
              <Button size="lg" asChild className="gap-2 bg-white text-slate-900 hover:bg-slate-100 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                <Link to={dashboardPath}>
                  <LayoutDashboard className="h-5 w-5" />
                  Go to Portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="gap-2 bg-white text-slate-900 hover:bg-slate-100 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                  <Link to="/login">
                    {cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="gap-2 border-white text-white hover:bg-white/10">
                  <Link to="/register">{ctaSecondary}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingHero({ user, dashboardPath }: LandingHeroProps) {
  return (
    <section className="relative">
      <Carousel autoPlay interval={6000} showArrows showDots>
        {HERO_SLIDES.map((slide, i) => (
          <HeroSlide
            key={i}
            {...slide}
            user={user}
            dashboardPath={dashboardPath}
          />
        ))}
      </Carousel>
    </section>
  )
}
