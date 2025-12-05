import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  STORAGE_KEYS, getStorageItem, setStorageItem,
  fetchContentFromServer, saveContentToServer 
} from '@/lib/storage';
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
  isLoading: boolean;
  
  // Categories
  addCategory: (category: Omit<Category, 'id' | 'order'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (categories: Category[]) => void;
  importCategories: (categories: Category[], mode: 'add' | 'replace') => void;
  
  // Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  importProducts: (products: Product[], mode: 'add' | 'replace') => void;
  
  // Projects
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: number, project: Partial<Project>) => void;
  deleteProject: (id: number) => void;
  importProjects: (projects: Project[], mode: 'add' | 'replace') => void;
  
  // Posts
  addPost: (post: Omit<Post, 'id'>) => void;
  updatePost: (id: number, post: Partial<Post>) => void;
  deletePost: (id: number) => void;
  importPosts: (posts: Post[], mode: 'add' | 'replace') => void;
  
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
  const [isLoading, setIsLoading] = useState(true);

  // Save all content to server and localStorage
  const persistContent = useCallback(async (
    newCategories: Category[],
    newProducts: Product[],
    newProjects: Project[],
    newPosts: Post[],
    newSettings: SiteSettings
  ) => {
    // Always save to localStorage as backup
    setStorageItem(STORAGE_KEYS.CATEGORIES, newCategories);
    setStorageItem(STORAGE_KEYS.PRODUCTS, newProducts);
    setStorageItem(STORAGE_KEYS.PROJECTS, newProjects);
    setStorageItem(STORAGE_KEYS.POSTS, newPosts);
    setStorageItem(STORAGE_KEYS.SETTINGS, newSettings);

    // Try to save to server
    await saveContentToServer({
      categories: newCategories,
      products: newProducts,
      projects: newProjects,
      posts: newPosts,
      settings: newSettings,
    });
  }, []);

  // Load data from server first, fallback to localStorage
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      
      // Try to load from server first
      const serverContent = await fetchContentFromServer();
      
      if (serverContent) {
        // Server data available - use it
        setCategories(serverContent.categories as Category[] || initialCategories);
        setProducts(serverContent.products as Product[] || initialProducts);
        setProjects(serverContent.projects as Project[] || initialProjects);
        setPosts(serverContent.posts as Post[] || initialPosts);
        setSettings(serverContent.settings as SiteSettings || initialSettings);
        
        // Also update localStorage as cache
        setStorageItem(STORAGE_KEYS.CATEGORIES, serverContent.categories);
        setStorageItem(STORAGE_KEYS.PRODUCTS, serverContent.products);
        setStorageItem(STORAGE_KEYS.PROJECTS, serverContent.projects);
        setStorageItem(STORAGE_KEYS.POSTS, serverContent.posts);
        setStorageItem(STORAGE_KEYS.SETTINGS, serverContent.settings);
      } else {
        // Fallback to localStorage (for Lovable preview)
        setCategories(getStorageItem(STORAGE_KEYS.CATEGORIES, initialCategories));
        setProducts(getStorageItem(STORAGE_KEYS.PRODUCTS, initialProducts));
        setProjects(getStorageItem(STORAGE_KEYS.PROJECTS, initialProjects));
        setPosts(getStorageItem(STORAGE_KEYS.POSTS, initialPosts));
        setSettings(getStorageItem(STORAGE_KEYS.SETTINGS, initialSettings));
      }
      
      setIsLoading(false);
    };
    
    loadContent();
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
    persistContent(updated, products, projects, posts, settings);
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...category } : c);
    setCategories(updated);
    persistContent(updated, products, projects, posts, settings);
  };

  const deleteCategory = (id: string) => {
    const hasProducts = products.some(p => p.categoryId === id);
    if (hasProducts) {
      alert('Diese Kategorie enthält noch Produkte. Bitte entfernen Sie zuerst alle Produkte.');
      return;
    }
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    persistContent(updated, products, projects, posts, settings);
  };

  const reorderCategories = (newCategories: Category[]) => {
    const updated = newCategories.map((c, i) => ({ ...c, order: i + 1 }));
    setCategories(updated);
    persistContent(updated, products, projects, posts, settings);
  };

  const importCategories = (newCategories: Category[], mode: 'add' | 'replace') => {
    let updated: Category[];
    if (mode === 'replace') {
      updated = newCategories.map((c, i) => ({
        ...c,
        id: c.id || `cat_${Date.now()}_${i}`,
        order: i + 1
      }));
    } else {
      const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order)) : 0;
      updated = [
        ...categories,
        ...newCategories.map((c, i) => ({
          ...c,
          id: c.id || `cat_${Date.now()}_${i}`,
          order: maxOrder + i + 1
        }))
      ];
    }
    setCategories(updated);
    persistContent(updated, products, projects, posts, settings);
  };

  // Products
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now()
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    persistContent(categories, updated, projects, posts, settings);
  };

  const updateProduct = (id: number, product: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...product } : p);
    setProducts(updated);
    persistContent(categories, updated, projects, posts, settings);
  };

  const deleteProduct = (id: number) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    persistContent(categories, updated, projects, posts, settings);
  };

  const importProducts = (newProducts: Product[], mode: 'add' | 'replace') => {
    let updated: Product[];
    if (mode === 'replace') {
      updated = newProducts.map((p, i) => ({
        ...p,
        id: p.id || Date.now() + i
      }));
    } else {
      updated = [
        ...products,
        ...newProducts.map((p, i) => ({
          ...p,
          id: p.id || Date.now() + i
        }))
      ];
    }
    setProducts(updated);
    persistContent(categories, updated, projects, posts, settings);
  };

  // Projects
  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now()
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    persistContent(categories, products, updated, posts, settings);
  };

  const updateProject = (id: number, project: Partial<Project>) => {
    const updated = projects.map(p => p.id === id ? { ...p, ...project } : p);
    setProjects(updated);
    persistContent(categories, products, updated, posts, settings);
  };

  const deleteProject = (id: number) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    persistContent(categories, products, updated, posts, settings);
  };

  const importProjects = (newProjects: Project[], mode: 'add' | 'replace') => {
    let updated: Project[];
    if (mode === 'replace') {
      updated = newProjects.map((p, i) => ({
        ...p,
        id: p.id || Date.now() + i
      }));
    } else {
      updated = [
        ...projects,
        ...newProjects.map((p, i) => ({
          ...p,
          id: p.id || Date.now() + i
        }))
      ];
    }
    setProjects(updated);
    persistContent(categories, products, updated, posts, settings);
  };

  // Posts
  const addPost = (post: Omit<Post, 'id'>) => {
    const newPost: Post = {
      ...post,
      id: Date.now()
    };
    const updated = [...posts, newPost];
    setPosts(updated);
    persistContent(categories, products, projects, updated, settings);
  };

  const updatePost = (id: number, post: Partial<Post>) => {
    const updated = posts.map(p => p.id === id ? { ...p, ...post } : p);
    setPosts(updated);
    persistContent(categories, products, projects, updated, settings);
  };

  const deletePost = (id: number) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    persistContent(categories, products, projects, updated, settings);
  };

  const importPosts = (newPosts: Post[], mode: 'add' | 'replace') => {
    let updated: Post[];
    if (mode === 'replace') {
      updated = newPosts.map((p, i) => ({
        ...p,
        id: p.id || Date.now() + i
      }));
    } else {
      updated = [
        ...posts,
        ...newPosts.map((p, i) => ({
          ...p,
          id: p.id || Date.now() + i
        }))
      ];
    }
    setPosts(updated);
    persistContent(categories, products, projects, updated, settings);
  };

  // Settings
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    persistContent(categories, products, projects, posts, updated);
  };

  return (
    <ContentContext.Provider value={{
      categories, products, projects, posts, settings, isLoading,
      addCategory, updateCategory, deleteCategory, reorderCategories, importCategories,
      addProduct, updateProduct, deleteProduct, importProducts,
      addProject, updateProject, deleteProject, importProjects,
      addPost, updatePost, deletePost, importPosts,
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
