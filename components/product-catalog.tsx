'use client';

import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase, type Product, CATEGORIES } from '@/lib/supabase';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const GENDERS = ['men', 'women', 'kids', 'unisex'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

export function ProductCatalog({ initial }: { initial: Product[] }) {
  const [products] = useState<Product[]>(initial);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [gender, setGender] = useState<string>('all');
  const [brand, setBrand] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [availability, setAvailability] = useState<string>('all');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [loading] = useState(false);

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchCat = category === 'all' || p.category === category;
      const matchGender = gender === 'all' || p.gender === gender;
      const matchBrand = brand === 'all' || p.brand === brand;
      const effectivePrice = p.discount_price ?? p.price;
      const matchPrice = Number(effectivePrice) <= maxPrice;
      const matchAvail = availability === 'all' ||
        (availability === 'in_stock' && p.availability === 'in_stock') ||
        (availability === 'out_of_stock' && p.availability === 'out_of_stock');
      return matchSearch && matchCat && matchGender && matchBrand && matchPrice && matchAvail;
    });
    switch (sort) {
      case 'popular': list = [...list].sort((a, b) => b.rating - a.rating); break;
      case 'price_low': list = [...list].sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price)); break;
      case 'price_high': list = [...list].sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price)); break;
      default: list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [products, search, category, gender, brand, maxPrice, availability, sort]);

  const clearAll = () => {
    setSearch(''); setCategory('all'); setGender('all'); setBrand('all');
    setMaxPrice(50000); setAvailability('all'); setSort('newest');
  };

  const activeFilters = (category !== 'all' ? 1 : 0) + (gender !== 'all' ? 1 : 0) + (brand !== 'all' ? 1 : 0) + (availability !== 'all' ? 1 : 0);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search frames, brands, categories..."
            className="pl-9 rounded-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[180px] rounded-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
            {activeFilters > 0 && <Badge className="ml-2 h-5 min-w-5 px-1.5">{activeFilters}</Badge>}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-6 grid gap-6 rounded-2xl border border-border/60 bg-card/60 p-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {GENDERS.map((g) => <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Brand</Label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All brands</SelectItem>
                {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Availability</Label>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2 lg:col-span-4">
            <div className="flex items-center justify-between">
              <Label>Max Price</Label>
              <span className="text-sm font-medium text-primary">PKR {maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={50000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          {activeFilters > 0 && (
            <div className="md:col-span-2 lg:col-span-4">
              <Button variant="ghost" size="sm" onClick={clearAll} className="rounded-full">
                <X className="mr-1.5 h-4 w-4" /> Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold">No products found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          <Button variant="outline" onClick={clearAll} className="mt-4 rounded-full">Clear filters</Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
