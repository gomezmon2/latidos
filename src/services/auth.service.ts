import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Authentication Service
 * Handles all authentication operations with Supabase
 */
export class AuthService {
  /**
   * Register a new user with email and password
   */
  static async signUp(email: string, password: string, fullName: string) {
    try {
      console.log("🔵 [AUTH] Iniciando registro...", { email, fullName });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      console.log("🔵 [AUTH] Respuesta de Supabase:", { data, error });

      if (error) {
        console.error("🔴 [AUTH] Error en signUp:", error);
        throw error;
      }

      // Verificar si el usuario necesita confirmar email
      if (data.user && !data.session) {
        console.warn("⚠️ [AUTH] Usuario creado pero sin sesión - Requiere confirmación de email");
      }

      console.log("✅ [AUTH] Registro exitoso:", {
        userId: data.user?.id,
        hasSession: !!data.session
      });

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error("🔴 [AUTH] Error signing up:", error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }

  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }

  /**
   * Sign in with GitHub OAuth
   */
  static async signInWithGitHub() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  /**
   * Get the current user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Get the current session
   */
  static async getSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }

  /**
   * Reset password request
   */
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error requesting password reset:", error);
      throw error;
    }
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }
}
