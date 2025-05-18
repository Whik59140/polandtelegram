import Link from 'next/link';
import Image from 'next/image';
import type { BlogPost } from '@/types/blog'; // Assuming Omit<BlogPost, 'rawMarkdownContent'> is compatible or adjust type

interface RelatedArticleCardProps {
  post: Omit<BlogPost, 'rawMarkdownContent'>;
}

export function RelatedArticleCard({ post }: RelatedArticleCardProps) {
  let imageToDisplay = post.featuredImage;
  if (!imageToDisplay) {
    const randomNumber = Math.floor(Math.random() * 20) + 1;
    imageToDisplay = `/blog/${randomNumber}.webp`;
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block bg-card hover:bg-muted/50 p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="relative w-full h-40 mb-3 rounded-md overflow-hidden">
        <Image 
          src={imageToDisplay}
          alt={`Immagine per ${post.title}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="text-md font-semibold text-primary group-hover:text-telegram-blue mb-1 truncate">{post.title}</h3>
      {post.excerpt && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{post.excerpt}</p>}
      <p className="text-xs text-muted-foreground/80">
        {new Date(post.publishDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </Link>
  );
} 