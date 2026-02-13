import { useGetProducts, useGetCategories, useGetBestSellingProduct } from '../hooks/useQueries';
import BannerCarousel from '../components/home/BannerCarousel';
import ProductSection from '../components/product/ProductSection';
import HomeSearchBar from '../components/home/HomeSearchBar';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { data: products = [], isLoading: productsLoading } = useGetProducts();
  const { data: categories = [] } = useGetCategories();
  const { data: bestSelling } = useGetBestSellingProduct();
  const navigate = useNavigate();

  const featured = products.slice(0, 8);
  const trending = products.slice(8, 16);
  const recommended = bestSelling ? [bestSelling, ...products.slice(0, 7)] : products.slice(0, 8);

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Welcome to <span className="text-gold">Meet Enterprise</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Premium shopping experience with luxury products
            </p>
            <HomeSearchBar />
          </div>
        </div>
      </section>

      {/* Banner Carousel */}
      <section className="container mx-auto px-4">
        <BannerCarousel />
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="h-auto py-6 flex flex-col gap-2"
                onClick={() => navigate({ to: '/catalog', search: { category: category.id } })}
              >
                <span className="font-semibold">{category.name}</span>
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {!productsLoading && featured.length > 0 && (
        <ProductSection title="Featured Products" products={featured} />
      )}

      {/* Trending Products */}
      {!productsLoading && trending.length > 0 && (
        <ProductSection title="Trending Now" products={trending} />
      )}

      {/* Recommended Products */}
      {!productsLoading && recommended.length > 0 && (
        <ProductSection title="Recommended for You" products={recommended} />
      )}

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Discover Premium Quality</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Explore our curated collection of premium products with unbeatable prices and fast delivery
          </p>
          <Button size="lg" onClick={() => navigate({ to: '/catalog' })} className="gap-2">
            Browse All Products
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
