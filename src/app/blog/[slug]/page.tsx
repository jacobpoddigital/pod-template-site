import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Section } from "@/ui/section";
import { getPost, getPostSlugs, getRelatedBlogPosts, BLOG_BASE } from "@/lib/cms";
import { siteConfig } from "../../../../site.config";
import { type Crumb } from "../_components/breadcrumbs";
import { PostArticle } from "../_components/post-article";
import { PostJsonLd } from "../_components/blog-jsonld";
import { postMetadata } from "../_lib/metadata";

// /blog/[slug] — a single post: rendered + sanitized WP content in a prose container,
// author box, tags, related posts, Yoast SEO + Article/Breadcrumb JSON-LD. workflow/33.
export const dynamic = "error";
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return postMetadata(post);
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const category = post.categories[0];
  const related = await getRelatedBlogPosts({ categorySlug: category?.slug ?? null, excludeId: post.databaseId });

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: siteConfig.blog.title, href: BLOG_BASE },
    ...(category ? [{ label: category.name, href: category.href }] : []),
    { label: post.title },
  ];

  return (
    <Section dataBlock="blog_post" padding="default">
      <PostArticle post={post} related={related} crumbs={crumbs} />
      <PostJsonLd post={post} breadcrumb={crumbs.map((c) => ({ label: c.label, path: c.href ?? post.href }))} />
    </Section>
  );
}
