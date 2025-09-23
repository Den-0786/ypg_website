import Image from "next/image";
import { buildImageSrc } from "../../../utils/config";

async function fetchPost(slug) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://ypg-website.onrender.com"}/api/blog/${slug}/`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.post || null;
  } catch {
    return null;
  }
}

export default async function BlogDetailPage({ params }) {
  const { slug } = params;
  const post = await fetchPost(slug);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-600">
        Post not found.
      </div>
    );
  }

  return (
    <article className="max-w-xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
            {post.category}
          </span>
          <span>•</span>
          <span>{post.date}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>
      </div>

      {/* Image */}
      <div className="relative h-96 md:h-[28rem] rounded-xl overflow-hidden mb-6 shadow-md">
        <Image
          src={post.image ? buildImageSrc(post.image) : "/placeholder-item.jpg"}
          alt={post.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
          <div className="whitespace-pre-line">{post.content}</div>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center mt-8">
        <a
          href="/#blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Blog
        </a>
      </div>
    </article>
  );
}
