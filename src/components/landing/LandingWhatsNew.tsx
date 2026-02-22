import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ImgWithFallback } from '@/components/ui/img-with-fallback'
import { Card, CardContent } from '@/components/ui/card'

const FEATURED_NEWS = [
  {
    image: '/Images/news-placeholder.jpg',
    title: 'CampusHub Hosts Research Planning Workshop to Strengthen Academic Programs',
    description: 'Faculty and staff gathered for a two-day workshop focused on curriculum development and research initiatives.',
    date: 'January 15, 2025',
  },
  {
    image: '/Images/campus-life-1.jpg',
    title: 'Digital Transformation: New Online Course Validation Workshop',
    description: 'Advancing our digital learning infrastructure with updated validation processes.',
    date: 'January 10, 2025',
  },
  {
    image: '/Images/campus-life-2.jpg',
    title: 'Centre for Sustainable Development Hosts International Workshop',
    description: 'Experts from across the region gathered to discuss sustainable campus initiatives.',
    date: 'January 5, 2025',
  },
]

export function LandingWhatsNew() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          What&apos;s New
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="aspect-video overflow-hidden bg-muted">
                <ImgWithFallback
                  src={FEATURED_NEWS[0].image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 line-clamp-2">
                  {FEATURED_NEWS[0].title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {FEATURED_NEWS[0].description}
                </p>
                <p className="text-xs text-muted-foreground">{FEATURED_NEWS[0].date}</p>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            {FEATURED_NEWS.slice(1).map((item, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="w-24 h-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    <ImgWithFallback
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div className="mt-8 text-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/news">
              View More News
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
