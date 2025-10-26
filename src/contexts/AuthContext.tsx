import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthService } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";

/**
 * Auth Context Type Definition
 */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to the app
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const session = await AuthService.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign up a new user
   */
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      console.log("🔵 [AuthContext] Iniciando signUp...");

      const { user, session } = await AuthService.signUp(email, password, fullName);

      console.log("🔵 [AuthContext] Resultado:", {
        hasUser: !!user,
        hasSession: !!session,
        userId: user?.id
      });

      setUser(user);
      setSession(session);

      // Si hay usuario pero NO hay sesión, significa que necesita confirmar email
      if (user && !session) {
        console.warn("⚠️ [AuthContext] Usuario creado pero requiere confirmación de email");
        toast({
          title: "¡Revisa tu email!",
          description: "Te hemos enviado un email de confirmación. Por favor verifica tu bandeja de entrada.",
          variant: "default",
        });
        throw new Error("EMAIL_CONFIRMATION_REQUIRED");
      }

      // Si hay sesión, todo está bien
      if (session) {
        console.log("✅ [AuthContext] Registro exitoso con sesión activa");
        toast({
          title: "¡Cuenta creada!",
          description: "Tu cuenta ha sido creada exitosamente.",
        });
      }
    } catch (error: any) {
      console.error("🔴 [AuthContext] Error en signUp:", error);

      // Si el error es por confirmación de email, no mostrar como error destructivo
      if (error.message === "EMAIL_CONFIRMATION_REQUIRED") {
        throw error;
      }

      toast({
        title: "Error al crear cuenta",
        description: error.message || "Ocurrió un error al crear tu cuenta",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with email and password
   */
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user, session } = await AuthService.signIn(email, password);
      setUser(user);
      setSession(session);

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    try {
      await AuthService.signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión con Google",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Sign in with GitHub
   */
  const signInWithGitHub = async () => {
    try {
      await AuthService.signInWithGitHub();
    } catch (error: any) {
      toast({
        title: "Error al iniciar sesión con GitHub",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      setLoading(true);
      await AuthService.signOut();
      setUser(null);
      setSession(null);

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * Custom hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
