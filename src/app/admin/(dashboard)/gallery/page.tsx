'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  category: string;
  sort_order: number;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  cakes: 'Cakes',
  'wedding-cakes': 'Wedding Cakes',
  cookies: 'Cookies',
  'cookie-cups': 'Cookie Cups',
};

const categoryColors: Record<string, string> = {
  cakes: 'bg-pink-100 text-pink-800',
  'wedding-cakes': 'bg-purple-100 text-purple-800',
  cookies: 'bg-amber-100 text-amber-800',
  'cookie-cups': 'bg-blue-100 text-blue-800',
};

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const res = await fetch('/api/admin/gallery');
      if (res.ok) {
        const data = await res.json() as GalleryImage[];
        setImages(data);
      }
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setImages(images.filter((img) => img.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    } finally {
      setDeleting(null);
    }
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    dragIndexRef.current = index;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragEnter(index: number) {
    dragOverIndexRef.current = index;
    setDragOverIndex(index);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const from = dragIndexRef.current;
    const to = dragOverIndexRef.current;
    if (from === null || to === null || from === to) return;

    const reordered = [...images];
    const [dragged] = reordered.splice(from, 1);
    reordered.splice(to, 0, dragged);

    setImages(reordered);
    setOrderChanged(true);
    dragIndexRef.current = null;
    dragOverIndexRef.current = null;
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
    dragOverIndexRef.current = null;
    setDragIndex(null);
    setDragOverIndex(null);
  }

  async function handleSaveOrder() {
    setSaving(true);
    try {
      const order = images.map((img, index) => ({
        id: img.id,
        sort_order: index,
      }));

      const res = await fetch('/api/admin/gallery/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });

      if (res.ok) {
        setOrderChanged(false);
      }
    } catch (error) {
      console.error('Failed to save order:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-600 mt-1">Manage your gallery images</p>
        </div>
        <div className="flex items-center gap-3">
          {orderChanged && (
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Order
                </>
              )}
            </button>
          )}
          <Link
            href="/admin/gallery/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Image
          </Link>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No gallery images yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first image.</p>
          <Link
            href="/admin/gallery/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Image
          </Link>
        </div>
      ) : (
        <>
          {orderChanged && (
            <p className="text-sm text-amber-600 mb-4">You have unsaved changes to the image order.</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-xl border-2 overflow-hidden group cursor-grab active:cursor-grabbing transition-all ${
                  dragOverIndex === index && dragIndex !== index
                    ? 'border-blue-500 scale-[1.02] shadow-lg'
                    : dragIndex === index
                      ? 'opacity-50 border-gray-200'
                      : 'border-gray-200'
                }`}
              >
                <div className="aspect-square bg-gray-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.image_url}
                    alt={image.caption || 'Gallery image'}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-lg p-1.5 shadow-sm">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/gallery/${image.id}`}
                      className="px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(image.id)}
                      disabled={deleting === image.id}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting === image.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[image.category] || 'bg-gray-100 text-gray-800'}`}>
                    {categoryLabels[image.category] || image.category}
                  </span>
                  {image.caption && (
                    <p className="text-sm text-gray-600 mt-1 truncate">{image.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
