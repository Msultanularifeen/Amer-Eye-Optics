import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight } from 'lucide-react';
import { SiteLayout } from '@/components/site-layout';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBlogPosts } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Eye Care Blog',
  description: 'Eye care tips, eyewear fashion trends, lens guides, and health articles from the experts at Amir Optical Center.',
};

export default async function BlogPage() {
  const posts = await getBlogPosts(20);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="Blog"
              title="Eye care insights & tips"
              subtitle="Expert advice on protecting your vision, choosing the right eyewear, and keeping your eyes healthy."
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.05}>
              <Link href={`/blog/${post.slug}`}>
                <Card className="group h-full overflow-hidden p-0 transition hover:shadow-premium">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {post.image && (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <Badge variant="secondary" className="mb-2">{post.category}</Badge>
                    <h3 className="font-display text-lg font-semibold line-clamp-2 group-hover:text-primary">{post.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" /> {new Date(post.published_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-primary">
                        Read <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
