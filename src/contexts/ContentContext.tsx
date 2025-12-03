import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '@/lib/storage';
import {
  Category, Product, Project, Post, SiteSettings,
  initialCategories, initialProducts, initialProjects, initialPosts, initialSettings
} from '@/data/initialData';

interface ContentContextType {
  categories: Category[];
  products: Product[];
  projects: Project[];
  posts: Post[];
  settings: SiteSettings;
  
  // Categories
  addCategory: (category: Omit<Category, 'id' | 'order'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: Category[]) => void;
  
  // Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  
  // Projects
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: number, project: Partial<Project>) => void;
  deleteProject: (id: number) => void;
  
  // Posts
  addPost: (post: Omit<Post, 'id'>) => void;
  updatePost: (id: number, post: Partial<Post>) => void;
  deletePost: (id: number) => void;
  
  // Settings
  updateSettings: (settings: Partial<SiteSettings>) => void;
}

const ContentContext = createContext<ContentContextType | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);

  // Load data from localStorage on mount
  useEffect(() => {
    setCategories(getStorageItem(STORAGE_KEYS.CATEGORIES, initialCategories));
    setProducts(getStorageItem(STORAGE_KEYS.PRODUCTS, initialProducts));
    setProjects(getStorageItem(STORAGE_KEYS.PROJECTS, initialProjects));
    setPosts(getStorageItem(STORAGE_KEYS.POSTS, initialPosts));
    setSettings(getStorageItem(STORAGE_KEYS.SETTINGS, initialSettings));
  }, []);

  // Categories
  const addCategory = (category: Omit<Category, 'id' | 'order'>) => {
    const newCategory: Category = {
      ...category,
      id: `cat_${Date.now()}`,
      order: categories.length + 1
    };
    const updated = [...categories, newCategory];
    setCategories(updated);
    setStorageItem(STORAGE_KEYS.CATEGORIES, updated);
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...category } : c);
    setCategories(updated);
    setStorageItem(STORAGE_KEYS.CATEGORIES, updated);
  };

  const deleteCategory = (id: string) => {
    const hasProducts = products.some(p => p.categoryId === id);
    if (hasProducts) {
      alert('Diese Kategorie enthält noch Produkte. Bitte entfernen Sie zuerst alle Produkte.');
      return;
    }
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    setStorageItem(STORAGE_KEYS.CATEGORIES, updated);
  };

  const reorderCategories = (newCategories: Category[]) => {
    const updated = newCategories.map((c, i) => ({ ...c, order: i + 1 }));
    setCategories(updated);
    setStorageItem(STORAGE_KEYS.CATEGORIES, updated);
  };

  // Products
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now()
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    setStorageItem(STORAGE_KEYS.PRODUCTS, updated);
  };

  const updateProduct = (id: number, product: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...product } : p);
    setProducts(updated);
    setStorageItem(STORAGE_KEYS.PRODUCTS, updated);
  };

  const deleteProduct = (id: number) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    setStorageItem(STORAGE_KEYS.PRODUCTS, updated);
  };

  // Projects
  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now()
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    setStorageItem(STORAGE_KEYS.PROJECTS, updated);
  };

  const updateProject = (id: number, project: Partial<Project>) => {
    const updated = projects.map(p => p.id === id ? { ...p, ...project } : p);
    setProjects(updated);
    setStorageItem(STORAGE_KEYS.PROJECTS, updated);
  };

  const deleteProject = (id: number) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    setStorageItem(STORAGE_KEYS.PROJECTS, updated);
  };

  // Posts
  const addPost = (post: Omit<Post, 'id'>) => {
    const newPost: Post = {
      ...post,
      id: Date.now()
    };
    const updated = [...posts, newPost];
    setPosts(updated);
    setStorageItem(STORAGE_KEYS.POSTS, updated);
  };

  const updatePost = (id: number, post: Partial<Post>) => {
    const updated = posts.map(p => p.id === id ? { ...p, ...post } : p);
    setPosts(updated);
    setStorageItem(STORAGE_KEYS.POSTS, updated);
  };

  const deletePost = (id: number) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    setStorageItem(STORAGE_KEYS.POSTS, updated);
  };

  // Settings
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    setStorageItem(STORAGE_KEYS.SETTINGS, updated);
  };

  return (
    <ContentContext.Provider value={{
      categories, products, projects, posts, settings,
      addCategory, updateCategory, deleteCategory, reorderCategories,
      addProduct, updateProduct, deleteProduct,
      addProject, updateProject, deleteProject,
      addPost, updatePost, deletePost,
      updateSettings
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
