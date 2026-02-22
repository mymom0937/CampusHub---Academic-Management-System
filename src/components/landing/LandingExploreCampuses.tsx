import { Carousel } from '@/components/ui/carousel'
import { ImgWithFallback } from '@/components/ui/img-with-fallback'
import { Button } from '@/components/ui/button'
import { CAMPUS_SLIDES } from '@/lib/landing-constants'

function CampusSlide({
  image,
  name,
  description,
}: {
  image: string
  name: string
  description: string
}) {
  return (
    <div className="w-full">
      <div className="rounded-xl overflow-hidden border bg-card shadow-lg">
        <div className="aspect-[16/10] w-full overflow-hidden">
          <ImgWithFallback
            src={image}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="border-t bg-card p-4 sm:p-5">
          <h4 className="font-semibold text-lg">{name}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

export function LandingExploreCampuses() {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted text-foreground">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-[minmax(280px,1fr)_1.5fr] gap-8 lg:gap-12 items-start">
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Explore Our Campuses
            </h2>
            <p className="text-muted-foreground">
              Discover our main campus and specialized facilities. Each location
              offers unique resources and learning environments designed to
              support your academic journey.
            </p>
            <Button variant="secondary" size="lg" className="gap-2 w-fit">
              Explore the Campus
              <span aria-hidden>→</span>
            </Button>
          </div>
          <div className="relative w-full min-w-0">
            <Carousel autoPlay interval={5000} showArrows showDots dotsVariant="dark">
              {CAMPUS_SLIDES.map((slide, i) => (
                <CampusSlide key={i} {...slide} />
              ))}
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  )
}
