'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { type Product } from '@/lib/supabase';
import { formatPrice, discountedPrice, discountPercent } from '@/lib/format';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [wished, setWished] = useState(false);
  const price = discountedPrice(product.price, product.discount_price);
  const off = discountPercent(product.price, product.discount_price);
  const out = product.availability === 'out_of_stock' || product.stock <= 0;

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    if (wished) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);
      setWished(false);
      toast.success('Removed from wishlist');
    } else {
      const { error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: product.id });
      if (error?.code === '23505') {
        setWished(true);
        toast.success('Already in your wishlist');
      } else if (!error) {
        setWished(true);
        toast.success('Added to wishlist');
      }
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-premium"
    >
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={product.images[0] ?? 'https://images.pexels.com/photos/2772531/pexels-photo-2772531.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {off > 0 && (
            <Badge className="bg-destructive text-destructive-foreground shadow-sm">
              -{off}%
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="bg-primary text-primary-foreground shadow-sm">
              Featured
            </Badge>
          )}
        </div>
        <button
          onClick={toggleWishlist}
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur transition hover:bg-background"
        >
          <Heart className={cn('h-4 w-4', wished && 'fill-destructive text-destructive')} />
        </button>
        <div className="absolute inset-x-3 bottom-3 flex translate-y-4 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button size="sm" className="flex-1" disabled={out} onClick={(e) => { e.preventDefault(); addItem(product); toast.success('Added to cart'); }}>
            <ShoppingCart className="mr-1.5 h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </span>
          <StarRating rating={product.rating} size={13} showValue />
        </div>
        <Link href={`/products/${product.slug}`} className="line-clamp-1 font-medium text-foreground hover:text-primary">
          {product.name}
        </Link>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {product.frame_color} · {product.frame_shape}
        </p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <span className="font-display text-lg font-semibold text-foreground">
              {formatPrice(price, product.currency)}
            </span>
            {off > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground line-through">
                {formatPrice(product.price, product.currency)}
              </span>
            )}
          </div>
          <span
            className={cn(
              'text-[11px] font-medium',
              out ? 'text-destructive' : product.availability === 'low_stock' ? 'text-warning' : 'text-success'
            )}
          >
            {out ? 'Out of stock' : product.availability === 'low_stock' ? 'Low stock' : 'In stock'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
