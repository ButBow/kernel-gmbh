export interface Promotion {
  id: string;
  name: string;
  description: string;
  discountCode: string;
  discountPercent: number;
  discountType: 'percent' | 'fixed';
  discountAmount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  showInBanner: boolean;
  template: 'blackfriday' | 'cyberweek' | 'student' | 'seasonal' | 'custom';
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  icon?: string;
  priority: number;
}

export const PROMOTION_TEMPLATES: Record<Promotion['template'], {
  label: string;
  defaultBg: string;
  defaultText: string;
  defaultAccent: string;
  defaultIcon: string;
}> = {
  blackfriday: {
    label: 'Black Friday',
    defaultBg: 'hsl(0, 0%, 5%)',
    defaultText: 'hsl(0, 0%, 100%)',
    defaultAccent: 'hsl(45, 100%, 50%)',
    defaultIcon: 'Percent'
  },
  cyberweek: {
    label: 'Cyber Week',
    defaultBg: 'hsl(220, 80%, 15%)',
    defaultText: 'hsl(180, 100%, 70%)',
    defaultAccent: 'hsl(280, 100%, 60%)',
    defaultIcon: 'Zap'
  },
  student: {
    label: 'Studentenrabatt',
    defaultBg: 'hsl(210, 70%, 20%)',
    defaultText: 'hsl(0, 0%, 100%)',
    defaultAccent: 'hsl(150, 80%, 50%)',
    defaultIcon: 'GraduationCap'
  },
  seasonal: {
    label: 'Saisonal',
    defaultBg: 'hsl(25, 80%, 20%)',
    defaultText: 'hsl(0, 0%, 100%)',
    defaultAccent: 'hsl(35, 100%, 60%)',
    defaultIcon: 'Gift'
  },
  custom: {
    label: 'Benutzerdefiniert',
    defaultBg: 'hsl(var(--primary))',
    defaultText: 'hsl(var(--primary-foreground))',
    defaultAccent: 'hsl(var(--accent))',
    defaultIcon: 'Tag'
  }
};

export const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'promo_student',
    name: 'Studentenrabatt',
    description: '40% Rabatt für alle Studenten',
    discountCode: 'STUDENT40',
    discountPercent: 40,
    discountType: 'percent',
    validFrom: '2024-01-01',
    validUntil: '2025-12-31',
    isActive: true,
    showInBanner: true,
    template: 'student',
    priority: 1
  },
  {
    id: 'promo_blackfriday',
    name: 'Black Friday Deal',
    description: '30% auf alle Pakete',
    discountCode: 'BLACKFRIDAY30',
    discountPercent: 30,
    discountType: 'percent',
    validFrom: '2024-11-25',
    validUntil: '2024-12-02',
    isActive: false,
    showInBanner: true,
    template: 'blackfriday',
    priority: 2
  }
];
