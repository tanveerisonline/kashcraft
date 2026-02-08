/**
 * Blog Content Service
 * Manages blog posts, categories, and SEO optimization
 */

import prisma from '@/lib/db/prisma';
import { slugify } from '@/lib/utils/string-utils';

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  status: BlogPostStatus;
  viewCount: number;
  viewsLastMonth: number;
  likes: number;
  comments: number;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  postCount: number;
  createdAt: Date;
}

/**
 * Blog content service with SEO support
 */
export class BlogContentService {
  private static instance: BlogContentService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): BlogContentService {
    if (!BlogContentService.instance) {
      BlogContentService.instance = new BlogContentService();
    }
    return BlogContentService.instance;
  }

  // ===== Blog Posts =====

  /**
   * Create blog post
   */
  async createBlogPost(
    title: string,
    content: string,
    excerpt: string,
    author: string,
    categoryId: string,
    tags: string[] = [],
    image?: string,
    seoTitle?: string,
    seoDescription?: string,
    seoKeywords?: string[],
    featured: boolean = false,
    status: BlogPostStatus = 'draft'
  ): Promise<BlogPost> {
    try {
      const slug = slugify(title);

      const post = await prisma.blogPost.create({
        data: {
          title,
          slug,
          content,
          excerpt,
          author,
          categoryId,
          tags: JSON.stringify(tags),
          image,
          seoTitle,
          seoDescription,
          seoKeywords: seoKeywords ? JSON.stringify(seoKeywords) : undefined,
          featured,
          status,
          publishedAt: status === 'published' ? new Date() : null,
        },
      });

      return this.mapBlogPost(post);
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  /**
   * Update blog post
   */
  async updateBlogPost(
    postId: string,
    updates: Partial<BlogPost>
  ): Promise<BlogPost | null> {
    try {
      const post = await prisma.blogPost.update({
        where: { id: postId },
        data: {
          title: updates.title,
          slug: updates.title ? slugify(updates.title) : undefined,
          content: updates.content,
          excerpt: updates.excerpt,
          tags: updates.tags ? JSON.stringify(updates.tags) : undefined,
          image: updates.image,
          seoTitle: updates.seoTitle,
          seoDescription: updates.seoDescription,
          seoKeywords: updates.seoKeywords ? JSON.stringify(updates.seoKeywords) : undefined,
          featured: updates.featured,
          status: updates.status,
          publishedAt: updates.status === 'published' ? new Date() : undefined,
        },
      });

      return this.mapBlogPost(post);
    } catch (error) {
      console.error('Error updating blog post:', error);
      return null;
    }
  }

  /**
   * Get published blog posts
   */
  async getPublishedPosts(
    page: number = 1,
    limit: number = 10,
    categorySlug?: string
  ): Promise<{ posts: BlogPost[]; total: number; pages: number }> {
    try {
      const where: any = { status: 'published' };

      if (categorySlug) {
        const category = await prisma.blogCategory.findUnique({
          where: { slug: categorySlug },
        });
        if (category) {
          where.categoryId = category.id;
        }
      }

      const total = await prisma.blogPost.count({ where });

      const posts = await prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        posts: posts.map(p => this.mapBlogPost(p)),
        total,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error getting published posts:', error);
      throw error;
    }
  }

  /**
   * Get blog post by slug
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const post = await prisma.blogPost.findFirst({
        where: { slug, status: 'published' },
      });

      if (post) {
        // Increment view count
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { viewCount: { increment: 1 } },
        });

        return this.mapBlogPost(post);
      }

      return null;
    } catch (error) {
      console.error('Error getting blog post by slug:', error);
      return null;
    }
  }

  /**
   * Get related posts
   */
  async getRelatedPosts(postId: string, limit: number = 3): Promise<BlogPost[]> {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: postId },
      });

      if (!post) return [];

      const relatedPosts = await prisma.blogPost.findMany({
        where: {
          id: { not: postId },
          status: 'published',
          OR: [
            { categoryId: post.categoryId },
            { tags: { contains: (post.tags as string) } },
          ],
        },
        take: limit,
        orderBy: { publishedAt: 'desc' },
      });

      return relatedPosts.map(p => this.mapBlogPost(p));
    } catch (error) {
      console.error('Error getting related posts:', error);
      return [];
    }
  }

  /**
   * Search blog posts
   */
  async searchBlogPosts(query: string, limit: number = 10): Promise<BlogPost[]> {
    try {
      const posts = await prisma.blogPost.findMany({
        where: {
          status: 'published',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { publishedAt: 'desc' },
      });

      return posts.map(p => this.mapBlogPost(p));
    } catch (error) {
      console.error('Error searching blog posts:', error);
      return [];
    }
  }

  /**
   * Get featured posts
   */
  async getFeaturedPosts(limit: number = 5): Promise<BlogPost[]> {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { status: 'published', featured: true },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      });

      return posts.map(p => this.mapBlogPost(p));
    } catch (error) {
      console.error('Error getting featured posts:', error);
      return [];
    }
  }

  /**
   * Delete blog post
   */
  async deleteBlogPost(postId: string): Promise<boolean> {
    try {
      await prisma.blogPost.delete({
        where: { id: postId },
      });
      return true;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }

  // ===== Blog Categories =====

  /**
   * Create blog category
   */
  async createBlogCategory(
    name: string,
    description?: string,
    image?: string
  ): Promise<BlogCategory> {
    try {
      const slug = slugify(name);

      const category = await prisma.blogCategory.create({
        data: {
          name,
          slug,
          description,
          image,
        },
      });

      return this.mapBlogCategory(category);
    } catch (error) {
      console.error('Error creating blog category:', error);
      throw error;
    }
  }

  /**
   * Get all blog categories
   */
  async getBlogCategories(): Promise<BlogCategory[]> {
    try {
      const categories = await prisma.blogCategory.findMany({
        include: {
          posts: { where: { status: 'published' } },
        },
      });

      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || undefined,
        image: cat.image || undefined,
        postCount: cat.posts.length,
        createdAt: cat.createdAt,
      }));
    } catch (error) {
      console.error('Error getting blog categories:', error);
      return [];
    }
  }

  /**
   * Get blog category by slug
   */
  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null> {
    try {
      const category = await prisma.blogCategory.findUnique({
        where: { slug },
        include: {
          posts: { where: { status: 'published' } },
        },
      });

      if (!category) return null;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || undefined,
        image: category.image || undefined,
        postCount: category.posts.length,
        createdAt: category.createdAt,
      };
    } catch (error) {
      console.error('Error getting blog category:', error);
      return null;
    }
  }

  /**
   * Generate sitemap for blog posts
   */
  async generateBlogSitemap(): Promise<string> {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true },
      });

      const urls = posts.map(post => `
        <url>
          <loc>https://kashcraft.com/blog/${post.slug}</loc>
          <lastmod>${post.updatedAt.toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `).join('');

      return `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          ${urls}
        </urlset>`;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return '';
    }
  }

  /**
   * Get blog analytics
   */
  async getBlogAnalytics(): Promise<any> {
    try {
      const totalPosts = await prisma.blogPost.count({ where: { status: 'published' } });
      const totalViews = await prisma.blogPost.aggregate({
        _sum: { viewCount: true },
        where: { status: 'published' },
      });

      const topPosts = await prisma.blogPost.findMany({
        where: { status: 'published' },
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: { title: true, slug: true, viewCount: true },
      });

      return {
        totalPosts,
        totalViews: totalViews._sum?.viewCount || 0,
        topPosts,
      };
    } catch (error) {
      console.error('Error getting blog analytics:', error);
      throw error;
    }
  }

  /**
   * Map database post to interface
   */
  private mapBlogPost(post: any): BlogPost {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author,
      category: post.category?.name || '',
      tags: post.tags ? JSON.parse(post.tags) : [],
      featured: post.featured,
      status: post.status,
      viewCount: post.viewCount,
      viewsLastMonth: post.viewsLastMonth || 0,
      likes: post.likes || 0,
      comments: post.comments || 0,
      image: post.image || undefined,
      seoTitle: post.seoTitle || undefined,
      seoDescription: post.seoDescription || undefined,
      seoKeywords: post.seoKeywords ? JSON.parse(post.seoKeywords) : undefined,
      publishedAt: post.publishedAt || new Date(),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  /**
   * Map database category to interface
   */
  private mapBlogCategory(category: any): BlogCategory {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || undefined,
      image: category.image || undefined,
      postCount: 0,
      createdAt: category.createdAt,
    };
  }
}

// Export singleton instance
export const blogContentService = BlogContentService.getInstance();
