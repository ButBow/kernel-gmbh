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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Project } from '@/data/initialData';

const projectCategories = ['Video', 'AI-System', 'Tool', 'Beratung', 'Design'];

export default function AdminPortfolio() {
  const { projects, addProject, updateProject, deleteProject } = useContent();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState<Omit<Project, 'id'>>({
    title: '',
    category: 'Video',
    description: '',
    fullDescription: '',
    image: '',
    tags: [],
    relatedProduct: '',
    status: 'draft'
  });

  const resetForm = () => {
    setForm({
      title: '',
      category: 'Video',
      description: '',
      fullDescription: '',
      image: '',
      tags: [],
      relatedProduct: '',
      status: 'draft'
    });
    setEditingProject(null);
    setTagInput('');
  };

  const handleSave = () => {
    if (!form.title) return;

    if (editingProject) {
      updateProject(editingProject.id, form);
    } else {
      addProject(form);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      category: project.category,
      description: project.description,
      fullDescription: project.fullDescription,
      image: project.image,
      tags: [...project.tags],
      relatedProduct: project.relatedProduct,
      status: project.status
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

  return (
    <AdminLayout title="Portfolio">
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Portfolio-Projekte
        </p>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neues Projekt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? 'Projekt bearbeiten' : 'Neues Projekt erstellen'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Titel</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Projekttitel"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Kategorie</label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => setForm({ ...form, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Kurzbeschreibung</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Kurze Beschreibung für Übersichten"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Ausführliche Beschreibung</label>
                <Textarea
                  value={form.fullDescription}
                  onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                  placeholder="Detaillierte Projektbeschreibung"
                  rows={4}
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
                <label className="text-sm font-medium">Verwandtes Produkt</label>
                <Input
                  value={form.relatedProduct}
                  onChange={(e) => setForm({ ...form, relatedProduct: e.target.value })}
                  placeholder="Produktname (optional)"
                />
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
                  {editingProject ? 'Speichern' : 'Erstellen'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            {project.image && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{project.category}</Badge>
                <Badge variant={project.status === 'published' ? 'default' : 'outline'}>
                  {project.status === 'published' ? 'Live' : 'Entwurf'}
                </Badge>
              </div>
              <h3 className="font-semibold mb-2">{project.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Projekt wirklich löschen?')) {
                      deleteProject(project.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
}
