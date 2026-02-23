import Link from 'next/link';
import type { Metadata } from 'next';
import { getDB } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Browse the gallery of gluten-free cakes, wedding cakes, cookies, and cookie cups. See what Bakes by Coral can create for you!',
  openGraph: {
    title: 'Gallery | Bakes by Coral',
    description: 'Browse the gallery of gluten-free cakes, wedding cakes, cookies, and cookie cups.',
  },
};

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  category: string;
}

const categoryTabs = [
  { value: 'all', label: 'All' },
  { value: 'cakes', label: 'Cakes' },
  { value: 'wedding-cakes', label: 'Wedding Cakes' },
  { value: 'cookies', label: 'Cookies' },
  { value: 'cookie-cups', label: 'Cookie Cups' },
];

async function getGalleryImages(category?: string): Promise<GalleryImage[]> {
  const db = getDB();
  const tenantId = 'bakesbycoral';

  let result;
  if (category && category !== 'all') {
    result = await db.prepare(`
      SELECT id, image_url, caption, category
      FROM gallery_images
      WHERE tenant_id = ? AND category = ?
      ORDER BY sort_order ASC, created_at DESC
    `).bind(tenantId, category).all<GalleryImage>();
  } else {
    result = await db.prepare(`
      SELECT id, image_url, caption, category
      FROM gallery_images
      WHERE tenant_id = ?
      ORDER BY sort_order ASC, created_at DESC
    `).bind(tenantId).all<GalleryImage>();
  }

  return result.results;
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = category || 'all';
  const images = await getGalleryImages(activeCategory);

  return (
    <>
      {/* Hero Banner */}
      <section
        className="py-16 sm:py-20"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            #F7F3ED 0px,
            #F7F3ED 40px,
            #EAD6D6 40px,
            #EAD6D6 80px
          )`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif text-[#4A2C21] font-bold">
            Gallery
          </h1>
          <p className="mt-4 text-lg text-[#4A2C21]/80">
            A peek at some of my favorite creations
          </p>
        </div>
      </section>

      {/* Category Filters + Grid */}
      <section className="py-16 sm:py-24 bg-[#F7F3ED]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categoryTabs.map((tab) => (
              <Link
                key={tab.value}
                href={tab.value === 'all' ? '/gallery' : `/gallery?category=${tab.value}`}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === tab.value
                    ? 'bg-[#541409] text-[#EAD6D6]'
                    : 'bg-white text-[#541409] hover:bg-[#541409]/10 border border-[#541409]/20'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Image Grid */}
          {images.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-[#541409]/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-serif text-[#541409] mb-2">Gallery coming soon</h3>
              <p className="text-stone-600">
                I&apos;m adding photos of my creations. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.image_url}
                      alt={image.caption || 'Gallery image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {image.caption && (
                    <p className="mt-2 text-sm text-stone-600 text-center">{image.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 sm:py-24"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            #F7F3ED 0px,
            #F7F3ED 40px,
            #EAD6D6 40px,
            #EAD6D6 80px
          )`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif text-[#4A2C21] mb-4">
            Love What You See?
          </h2>
          <p className="text-lg text-[#4A2C21]/80 mb-8">
            Let&apos;s create something special for your next celebration!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/order"
              className="w-full sm:w-auto px-8 py-4 bg-[#541409] text-[#EAD6D6] font-medium rounded-sm hover:opacity-80 transition-opacity text-center"
            >
              Place an Order
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-[#541409] text-[#541409] font-medium rounded-sm hover:bg-[#541409]/10 transition-colors text-center"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
