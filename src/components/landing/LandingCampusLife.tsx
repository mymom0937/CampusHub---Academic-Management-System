import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { Carousel } from '@/components/ui/carousel'
import { ImgWithFallback } from '@/components/ui/img-with-fallback'
import { Button } from '@/components/ui/button'
import { CAMPUS_LIFE_SLIDES } from '@/lib/landing-constants'

function CampusLifeSlide({
  image,
  title,
  subtitle,
  description,
}: {
  image: string
  title: string
  subtitle: string
  description: string
}) {
  return (
    <div className="relative h-[500px] md:h-[600px] w-full bg-gradient-to-br from-slate-800 to-slate-900">
      <ImgWithFallback
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8 items-center">
          <div className="max-w-md rounded-xl border bg-card p-6 md:p-8 shadow-xl">
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-sm font-medium text-primary mb-3">{subtitle}</p>
            <p className="text-muted-foreground text-sm mb-6">{description}</p>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/news">
                Find out More
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <span className="text-4xl md:text-6xl font-bold text-white/30 tracking-widest">
          CAMPUS LIFE
        </span>
      </div>
    </div>
  )
}

export function LandingCampusLife() {
  return (
    <section id="campus" className="relative scroll-mt-20">
      <Carousel autoPlay interval={5500} showArrows showDots>
        {CAMPUS_LIFE_SLIDES.map((slide, i) => (
          <CampusLifeSlide key={i} {...slide} />
        ))}
      </Carousel>
    </section>
  )
}
