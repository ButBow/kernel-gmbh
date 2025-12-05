import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginAttempts, isLocked, lockoutEndTime, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from state (set by ProtectedRoute)
  const from = (location.state as { from?: string })?.from || '/admin';
  const [remainingTime, setRemainingTime] = useState<string>('');

  // Update remaining lockout time
  useEffect(() => {
    if (!isLocked || !lockoutEndTime) {
      setRemainingTime('');
      return;
    }

    const updateTime = () => {
      const remaining = lockoutEndTime - Date.now();
      if (remaining <= 0) {
        setRemainingTime('');
        window.location.reload(); // Refresh to reset state
        return;
      }
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockoutEndTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLocked) {
      setError('Zu viele Fehlversuche. Bitte warten.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(password);
      if (success) {
        // Redirect to the originally requested page
        navigate(from, { replace: true });
      } else {
        const attemptsLeft = 5 - (loginAttempts + 1);
        if (attemptsLeft > 0) {
          setError(`Falsches Passwort. Noch ${attemptsLeft} Versuche.`);
        } else {
          setError('Konto gesperrt. Bitte 15 Minuten warten.');
        }
      }
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
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          {isLocked && (
            <Alert variant="destructive" className="mb-4">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Konto gesperrt. Entsperrung in: {remainingTime}
              </AlertDescription>
            </Alert>
          )}
          
          {loginAttempts > 0 && loginAttempts < 5 && !isLocked && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {5 - loginAttempts} Versuche verbleibend
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Passwort eingeben"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center"
                disabled={isLocked}
                maxLength={100}
                autoComplete="current-password"
              />
              {error && (
                <p className="text-sm text-destructive mt-2 text-center">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLocked || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Anmelden...
                </>
              ) : (
                'Anmelden'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
