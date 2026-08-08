import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Calendar, ArrowLeft } from 'lucide-react';
import { SiteLayout } from '@/components/site-layout';
import { Reveal } from '@/components/reveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/data';

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) return { title: 'Post not found' };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();
  const all = await getBlogPosts(20);
  const related = all.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 3);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/blog" className="hover:text-primary">Blog</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground line-clamp-1">{post.title}</span>
        </nav>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Reveal>
          <Badge variant="secondary" className="mb-4">{post.category}</Badge>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <span>By {post.author}</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(post.published_at).toLocaleDateString()}</span>
          </div>
        </Reveal>

        {post.image && (
          <Reveal delay={0.1}>
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
              <Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
            </div>
          </Reveal>
        )}

        <Reveal delay={0.15}>
          <div className="mt-8 space-y-6 text-base leading-relaxed text-foreground/90">
            {post.content.split('\n').map((para, i) => (
              para.trim() ? <p key={i}>{para}</p> : null
            ))}
          </div>
        </Reveal>

        <div className="mt-10 border-t border-border/60 pt-6">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to all posts</Link>
          </Button>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold">Related articles</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`}>
                <div className="group overflow-hidden rounded-2xl border border-border/60 bg-card">
                  {p.image && (
                    <div className="relative aspect-video bg-muted">
                      <Image src={p.image} alt={p.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium line-clamp-2 group-hover:text-primary">{p.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(p.published_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
