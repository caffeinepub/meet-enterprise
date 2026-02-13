import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useEffect, useRef } from 'react';

export default function BannerCarousel() {
  const carouselRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current?.scrollNext) {
        carouselRef.current.scrollNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Carousel
      ref={carouselRef}
      opts={{ loop: true }}
      className="w-full"
    >
      <CarouselContent>
        {[1, 2, 3].map((index) => (
          <CarouselItem key={index}>
            <div className="relative aspect-[16/6] md:aspect-[16/5] rounded-lg overflow-hidden bg-gradient-to-r from-gold/10 to-gold/5" />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}
