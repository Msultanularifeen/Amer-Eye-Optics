import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
};

export function StarRating({ rating, size = 16, className, showValue = false }: Props) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={
              i <= Math.round(rating)
                ? 'fill-warning text-warning'
                : 'fill-muted text-muted-foreground/40'
            }
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
