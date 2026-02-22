import { Carousel } from '@/components/ui/carousel'

const PARTNERS = [
  { name: 'Partner 1', logo: 'https://via.placeholder.com/120x60?text=Partner+1' },
  { name: 'Partner 2', logo: 'https://via.placeholder.com/120x60?text=Partner+2' },
  { name: 'Partner 3', logo: 'https://via.placeholder.com/120x60?text=Partner+3' },
  { name: 'Partner 4', logo: 'https://via.placeholder.com/120x60?text=Partner+4' },
  { name: 'Partner 5', logo: 'https://via.placeholder.com/120x60?text=Partner+5' },
]

function PartnerSlide() {
  return (
    <div className="flex items-center justify-center gap-12 px-8 py-12">
      {PARTNERS.map((p, i) => (
        <div
          key={i}
          className="flex h-16 w-28 items-center justify-center rounded-lg bg-muted/50 p-4 grayscale hover:grayscale-0 transition-all"
        >
          <img
            src={p.logo}
            alt={p.name}
            className="max-h-12 max-w-full object-contain"
          />
        </div>
      ))}
    </div>
  )
}

export function LandingPartners() {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Featured Partners
        </h2>
        <Carousel autoPlay interval={4000} showArrows showDots={false}>
          <PartnerSlide />
          <PartnerSlide />
        </Carousel>
      </div>
    </section>
  )
}
