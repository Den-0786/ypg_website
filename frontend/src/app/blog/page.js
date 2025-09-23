import Image from "next/image";
import { buildImageSrc } from "../../utils/config";
import Link from "next/link";

async function fetchBlogPosts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/blog/?forWebsite=true`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.posts) ? data.posts : [];
  } catch {
    return [];
  }
}

export default async function BlogListPage() {
  const posts = await fetchBlogPosts();

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Blog</h1>

        {posts.length === 0 ? (
          <div className="text-center text-gray-600">No posts yet.</div>
        ) : (
          <div
            className={`grid gap-6 ${
              posts.length === 1
                ? "grid-cols-1 place-items-center"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {posts.map((post) => (
              <article
                key={post.id}
                className={`group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition ${
                  posts.length === 1 ? "max-w-md w-full" : ""
                }`}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative h-56">
                    <Image
                      src={
                        post.image
                          ? buildImageSrc(post.image)
                          : "/placeholder-item.jpg"
                      }
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="p-5">
                  <div className="text-xs text-gray-500 mb-2">
                    {post.date} · {post.category}
                  </div>
                  <h2 className="text-lg font-semibold mb-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
