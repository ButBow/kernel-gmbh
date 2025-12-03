import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useContent } from '@/contexts/ContentContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import type { Post } from '@/data/initialData';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/[ß]/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminBlog() {
  const { posts, addPost, updatePost, deletePost } = useContent();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState<Omit<Post, 'id'>>({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    tags: [],
    image: '',
    status: 'draft'
  });

  const resetForm = () => {
    setForm({
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      tags: [],
      image: '',
      status: 'draft'
    });
    setEditingPost(null);
    setTagInput('');
  };

  const handleSave = () => {
    if (!form.title) return;

    const slug = form.slug || generateSlug(form.title);
    const postData = { ...form, slug };

    if (editingPost) {
      updatePost(editingPost.id, postData);
    } else {
      addPost(postData);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      date: post.date,
      tags: [...post.tags],
      image: post.image,
      status: post.status
    });
    setDialogOpen(true);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
    setTagInput('');
  };

  const removeTag = (index: number) => {
    setForm({ ...form, tags: form.tags.filter((_, i) => i !== index) });
  };

  const sortedPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AdminLayout title="Blog">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Blog-Beiträge
        </p>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Beitrag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Beitrag bearbeiten' : 'Neuen Beitrag erstellen'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Titel</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Beitragstitel"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Slug (URL)</label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder={form.title ? generateSlug(form.title) : 'auto-generiert'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Datum</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Teaser / Auszug</label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Kurzer Teaser für die Übersicht"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Inhalt (Markdown)</label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="# Überschrift&#10;&#10;Ihr Beitragsinhalt..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Bild-URL</label>
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
                {form.image && (
                  <div className="mt-2 rounded-lg overflow-hidden">
                    <img src={form.image} alt="Preview" className="w-full h-40 object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Tag hinzufügen"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeTag(i)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(value: 'draft' | 'published') => setForm({ ...form, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Entwurf</SelectItem>
                    <SelectItem value="published">Veröffentlicht</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleSave}>
                  {editingPost ? 'Speichern' : 'Erstellen'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {post.image && (
                  <div className="w-40 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={post.status === 'published' ? 'default' : 'outline'}>
                      {post.status === 'published' ? 'Live' : 'Entwurf'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.date)}
                    </div>
                  </div>
                  <h3 className="font-semibold mb-1">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Beitrag wirklich löschen?')) {
                        deletePost(post.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
