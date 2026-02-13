import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import ProductCard from './ProductCard';
import type { Product } from '../../backend';

interface ProductSectionProps {
  title: string;
  products: Product[];
}

export default function ProductSection({ title, products }: ProductSectionProps) {
  return (
    <section className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {products.map((product) => (
            <div key={product.id} className="w-[280px] shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}
