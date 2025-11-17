import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MarkdownPreview } from "@/components/MarkdownPreview";

export const metadata = {
  title: "Hohenadl Development | Web Development & CMS Solutions",
  description: "Professional web development services specializing in modern, fast, and scalable web applications.",
};

export default async function HomePage() {
  // Fetch CMS Content
  const heroContent = await prisma.post.findFirst({
    where: { slug: "homepage-hero", type: "page", published: true },
  });

  const services = await prisma.post.findMany({
    where: { type: "service", published: true },
    orderBy: { createdAt: "asc" },
  });

  const latestPosts = await prisma.post.findMany({
    where: { published: true, type: "post" }, // ← Nur Blog-Posts
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
    },
  });

  // Fallbacks
  const heroTitle = heroContent?.title || "Hohenadl Development";
  const heroSubtitle = heroContent?.excerpt || "Web Development & CMS Solutions";
  const heroDescription = heroContent?.content || "Professional web development services.";

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          {/* Logo/Brand - CMS Driven */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-900 mb-2">
              {heroTitle}
            </h1>
            <p className="text-xl text-blue-600 font-medium">
              {heroSubtitle}
            </p>
          </div>

          <div className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed prose prose-lg">
            <MarkdownPreview content={heroDescription} />
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="#services"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View Services
            </Link>
            <Link
              href="/blog"
              className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md"
            >
              Read Blog
            </Link>
          </div>
        </div>

        {/* Services Section - CMS Driven */}
        <div id="services" className="mt-32">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            What I Offer
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Professional web development services for businesses that want to stand out online
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              // Icon mapping (könnte später auch aus DB kommen)
              const icons = ["🚀", "📝", "💼"];
              
              return (
                <div key={service.id} className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition">
                  <div className="text-5xl mb-4">{icons[index] || "✨"}</div>
                  <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                  <div className="text-gray-600 prose prose-sm">
                    <MarkdownPreview content={service.content} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tech Stack - bleibt hardcoded (Design-Element) */}
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Technology Stack
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Built with modern, production-ready technologies
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Next.js 16", icon: "⚡" },
              { name: "TypeScript", icon: "📘" },
              { name: "PostgreSQL", icon: "🐘" },
              { name: "Prisma ORM", icon: "🔷" },
              { name: "Tailwind CSS", icon: "🎨" },
              { name: "NextAuth.js", icon: "🔒" },
              { name: "React", icon: "⚛️" },
              { name: "Git & CI/CD", icon: "🔄" },
            ].map((tech) => (
              <div key={tech.name} className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition">
                <div className="text-4xl mb-2">{tech.icon}</div>
                <div className="font-semibold text-gray-900">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Blog Section */}
        {latestPosts.length > 0 && (
          <div className="mt-32">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
              Latest Articles
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Insights on web development, best practices, and technical tutorials
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="text-sm text-gray-500">
                    {post.publishedAt?.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/blog"
                className="text-blue-600 hover:text-blue-800 font-medium text-lg"
              >
                View all articles →
              </Link>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-32 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Ready to start your project?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Let&apos;s build something amazing together. Professional web development for your business.
          </p>
          <div className="flex gap-4 justify-center">
            
              <a href="mailto:kontakt@hohenadl.dev"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Get in Touch
            </a>
            <Link
              href="/blog"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Hohenadl Development</h3>
              <p className="text-gray-400">
                Professional web development services specializing in modern, scalable web applications.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/#services" className="hover:text-white">Services</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="mailto:kontakt@hohenadl.dev" className="hover:text-white">
                    kontakt@hohenadl.dev
                  </a>
                </li>
                <li className="text-sm">Based in Germany</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Hohenadl Development. Built with Next.js 16, TypeScript & Prisma.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}