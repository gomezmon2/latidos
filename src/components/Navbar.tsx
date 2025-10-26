import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User, LogOut, Settings, Users, Star, BookOpen, CircleDot, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { ROUTES } from "@/routes";
import { supabase } from "@/integrations/supabase/client";

/**
 * Navbar Component
 * Navigation bar with user menu
 */
export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { totalUnread } = useUnreadMessages();
  const [profile, setProfile] = useState<{
    full_name: string | null;
    avatar_url: string | null;
  } | null>(null);

  // Load profile from database
  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      // Fallback to user_metadata
      setProfile({
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(ROUTES.HOME);
    } catch (error) {
      // Error handled by AuthContext
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Usuario";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Latidos
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={ROUTES.EXPLORE}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Explorar
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Descubre historias públicas de la comunidad</p>
                </TooltipContent>
              </Tooltip>

              {user && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={ROUTES.MY_STORIES}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Mis Historias
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ver todas las historias que has compartido</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={ROUTES.CREATE}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Compartir
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Crea y comparte una nueva historia</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={ROUTES.COMPARTIDOS}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Compartidos
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Gestiona tus conexiones con otros usuarios</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={ROUTES.CIRCLES}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Círculos
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Organiza compartidos en grupos temáticos</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </TooltipProvider>
          </div>

          {/* User Menu or Auth Buttons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={profile?.avatar_url || undefined}
                        alt={getUserName()}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(profile?.full_name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTES.MY_STORIES)}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Mis Historias</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTES.FAVORITES)}>
                    <Star className="mr-2 h-4 w-4" />
                    <span>Favoritos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTES.COMPARTIDOS)}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Compartidos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTES.CIRCLES)}>
                    <CircleDot className="mr-2 h-4 w-4" />
                    <span>Círculos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTES.CHAT)}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>Mensajes</span>
                    {totalUnread > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1 text-xs">
                        {totalUnread > 99 ? "99+" : totalUnread}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost">Iniciar sesión</Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button>Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
