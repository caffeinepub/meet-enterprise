import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSearchProducts, useGetCategories } from '../../hooks/useQueries';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';

export default function HomeSearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: searchResults = [] } = useSearchProducts(debouncedQuery);
  const { data: categories = [] } = useGetCategories();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (type: 'product' | 'category', id: string) => {
    setOpen(false);
    setQuery('');
    if (type === 'product') {
      navigate({ to: '/product/$productId', params: { productId: id } });
    } else {
      navigate({ to: '/catalog', search: { category: id } });
    }
  };

  const matchingCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  return (
    <Popover open={open && debouncedQuery.length > 0} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for products, categories..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            className="pl-12 h-12 text-base"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No results found</CommandEmpty>
            {matchingCategories.length > 0 && (
              <CommandGroup heading="Categories">
                {matchingCategories.map((category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => handleSelect('category', category.id)}
                    className="cursor-pointer"
                  >
                    {category.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {searchResults.length > 0 && (
              <CommandGroup heading="Products">
                {searchResults.slice(0, 5).map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => handleSelect('product', product.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <div className="font-medium">{product.title}</div>
                        <div className="text-muted-foreground">₹{Number(product.price).toLocaleString()}</div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
