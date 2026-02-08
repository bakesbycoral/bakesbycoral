'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TipTapEditor } from '@/components/admin/TipTapEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');
  const [newTagInput, setNewTagInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_id: '',
    featured_image: '',
    og_image: '',
    status: 'draft',
    publish_at: '',
    meta_title: '',
    meta_description: '',
    tags: [] as string[],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch('/api/admin/blog/categories'),
          fetch('/api/admin/blog/tags'),
        ]);

        if (catRes.ok) {
          const data = await catRes.json() as Record<string, unknown>;
          setCategories(Array.isArray(data) ? data : (data.categories as typeof categories) || []);
        }
        if (tagRes.ok) {
          const data = await tagRes.json() as Record<string, unknown>;
          setAllTags((data.tags as typeof allTags) || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }
    fetchData();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
      meta_title: formData.meta_title || '', // Keep custom meta title if set
    });
  };

  const calculateReadingTime = useCallback((content: string) => {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes;
  }, []);

  const handleAddTag = async () => {
    if (!newTagInput.trim()) return;

    try {
      const response = await fetch('/api/admin/blog/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagInput.trim() }),
      });

      if (response.ok) {
        const newTag = await response.json() as Tag;
        if (!allTags.find(t => t.id === newTag.id)) {
          setAllTags([...allTags, newTag]);
        }
        if (!formData.tags.includes(newTag.id)) {
          setFormData({ ...formData, tags: [...formData.tags, newTag.id] });
        }
        setNewTagInput('');
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const toggleTag = (tagId: string) => {
    if (formData.tags.includes(tagId)) {
      setFormData({ ...formData, tags: formData.tags.filter(id => id !== tagId) });
    } else {
      setFormData({ ...formData, tags: [...formData.tags, tagId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent, submitStatus?: string) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSubmit = {
        ...formData,
        status: submitStatus || formData.status,
      };

      const response = await fetch('/api/admin/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        const data = await response.json() as { id: string };
        router.push(`/admin/blog/${data.id}`);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setSaving(false);
    }
  };

  const readingTime = calculateReadingTime(formData.content);
  const wordCount = formData.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const metaTitleLength = (formData.meta_title || formData.title).length;
  const metaDescLength = (formData.meta_description || formData.excerpt).length;

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Blog Post</h1>
            <p className="text-sm text-gray-500 mt-1">
              {wordCount} words &bull; {readingTime} min read
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={saving || !formData.title || !formData.content}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={saving || !formData.title || !formData.content}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'seo'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            SEO & Social
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Slug */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter an engaging title..."
                    />
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                      URL Slug
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 text-sm mr-2">/blog/</span>
                      <input
                        type="text"
                        id="slug"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <TipTapEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                />
              </div>

              {/* Excerpt */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  A short summary displayed in blog listings and search results.
                </p>
                <textarea
                  id="excerpt"
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the post..."
                  maxLength={300}
                />
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {formData.excerpt.length}/300 characters
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Featured Image */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Featured Image</h3>
                <ImageUpload
                  value={formData.featured_image}
                  onChange={(url) => setFormData({ ...formData, featured_image: url })}
                  folder="blog"
                  placeholder="Click to upload featured image"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 1200x630px for optimal display
                </p>
              </div>

              {/* Category */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Category</h3>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Tags / Keywords</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.tags.includes(tag.id)
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                {formData.tags.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="max-w-3xl space-y-6">
            {/* Search Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Search Engine Preview</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer truncate">
                  {formData.meta_title || formData.title || 'Page Title'}
                </div>
                <div className="text-green-700 text-sm">
                  yoursite.com/blog/{formData.slug || 'post-url'}
                </div>
                <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {formData.meta_description || formData.excerpt || 'Add a meta description to improve click-through rates from search results.'}
                </div>
              </div>
            </div>

            {/* Meta Title */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Title shown in search results and browser tabs. Leave blank to use post title.
              </p>
              <input
                type="text"
                id="meta_title"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={formData.title || 'Enter meta title...'}
                maxLength={70}
              />
              <div className="flex justify-between items-center mt-1">
                <div className={`text-xs ${metaTitleLength > 60 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {metaTitleLength > 60 ? 'Title may be truncated in search results' : 'Optimal length: 50-60 characters'}
                </div>
                <div className={`text-xs ${metaTitleLength > 60 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {metaTitleLength}/70
                </div>
              </div>
            </div>

            {/* Meta Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Description shown in search results. Leave blank to use excerpt.
              </p>
              <textarea
                id="meta_description"
                rows={3}
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={formData.excerpt || 'Enter meta description...'}
                maxLength={160}
              />
              <div className="flex justify-between items-center mt-1">
                <div className={`text-xs ${metaDescLength > 155 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {metaDescLength > 155 ? 'Description may be truncated' : 'Optimal length: 120-155 characters'}
                </div>
                <div className={`text-xs ${metaDescLength > 155 ? 'text-orange-500' : 'text-gray-400'}`}>
                  {metaDescLength}/160
                </div>
              </div>
            </div>

            {/* Social Image */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Social Sharing Image (OG Image)</h3>
              <p className="text-xs text-gray-500 mb-3">
                Image displayed when shared on social media. Leave blank to use featured image.
              </p>
              <ImageUpload
                value={formData.og_image}
                onChange={(url) => setFormData({ ...formData, og_image: url })}
                folder="blog/og"
                aspectRatio="aspect-[1.91/1]"
                placeholder="Click to upload social image"
              />
              {!formData.og_image && formData.featured_image && (
                <p className="text-xs text-gray-500 mt-2">
                  Will use featured image if not set
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Recommended: 1200x630px (1.91:1 aspect ratio)
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Publication Status</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Draft</div>
                    <div className="text-sm text-gray-500">Save as draft, not visible to public</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Published</div>
                    <div className="text-sm text-gray-500">Publish immediately, visible to public</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="status"
                    value="scheduled"
                    checked={formData.status === 'scheduled'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Schedule</div>
                    <div className="text-sm text-gray-500">Publish automatically at a future date</div>
                  </div>
                </label>
              </div>

              {formData.status === 'scheduled' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label htmlFor="publish_at" className="block text-sm font-medium text-gray-700 mb-1">
                    Publish Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    id="publish_at"
                    value={formData.publish_at}
                    onChange={(e) => setFormData({ ...formData, publish_at: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* URL & Slug */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">URL Settings</h3>
              <div>
                <label htmlFor="slug-settings" className="block text-sm text-gray-600 mb-1">
                  Post URL
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
                    /blog/
                  </span>
                  <input
                    type="text"
                    id="slug-settings"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  The URL where this post will be accessible. Use lowercase letters, numbers, and hyphens.
                </p>
              </div>
            </div>

            {/* Delete Section - only shown when editing */}
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <h3 className="text-sm font-medium text-red-700 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-600 mb-4">
                Once published, your post will be available at the URL above. You can always change it back to a draft later.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
