import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield, AlertCircle, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email({ message: 'Ungültige E-Mail-Adresse' }),
  password: z.string().min(6, { message: 'Passwort muss mindestens 6 Zeichen haben' }),
});

export default function Auth() {
  const { user, isAdmin, isLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = (location.state as { from?: string })?.from || '/admin';

  useEffect(() => {
    if (!isLoading && user) {
      if (isAdmin) {
        navigate(from, { replace: true });
      } else {
        toast({
          title: 'Kein Admin-Zugriff',
          description: 'Dein Konto hat keine Admin-Berechtigung.',
          variant: 'destructive',
        });
        navigate('/', { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate, from, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate input
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error: authError } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);
      
      if (authError) {
        // Handle common errors with German messages
        if (authError.message.includes('Invalid login credentials')) {
          setError('Ungültige Anmeldedaten');
        } else if (authError.message.includes('User already registered')) {
          setError('Diese E-Mail ist bereits registriert');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Bitte bestätige zuerst deine E-Mail-Adresse');
        } else {
          setError(authError.message);
        }
      } else if (isSignUp) {
        toast({
          title: 'Registrierung erfolgreich',
          description: 'Bitte bestätige deine E-Mail-Adresse.',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin-Bereich</CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Erstelle ein neues Konto für den Admin-Bereich.'
              : 'Melde dich an, um auf den Admin-Bereich zuzugreifen.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? 'Wird registriert...' : 'Wird angemeldet...'}
                </>
              ) : (
                isSignUp ? 'Registrieren' : 'Anmelden'
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              disabled={isSubmitting}
            >
              {isSignUp 
                ? 'Bereits ein Konto? Anmelden'
                : 'Noch kein Konto? Registrieren'}
            </button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Nur autorisierte Administratoren haben Zugriff auf diesen Bereich.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
