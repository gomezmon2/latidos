import { supabase } from "@/integrations/supabase/client";
import type {
  SharedConnection,
  SharedConnectionWithUser,
  ConnectionRequest,
  CreateConnectionDTO,
  UpdateConnectionDTO,
  ConnectionStatus,
} from "@/types/connection";

export class ConnectionService {
  /**
   * Send a connection request to another user
   */
  static async sendConnectionRequest(
    dto: CreateConnectionDTO
  ): Promise<SharedConnection> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesión para enviar solicitudes");
    }

    // Verificar que no intente conectarse consigo mismo
    if (user.id === dto.shared_user_id) {
      throw new Error("No puedes conectarte contigo mismo");
    }

    // Verificar si ya existe una conexión
    const existingConnection = await this.getConnectionBetweenUsers(
      user.id,
      dto.shared_user_id
    );

    if (existingConnection) {
      if (existingConnection.status === "pending") {
        throw new Error("Ya tienes una solicitud pendiente con este usuario");
      }
      if (existingConnection.status === "accepted") {
        throw new Error("Ya estás conectado con este usuario");
      }
      if (existingConnection.status === "rejected") {
        // Si fue rechazada, permitir enviar nueva solicitud
        await this.deleteConnection(existingConnection.id);
      }
    }

    const { data, error } = await supabase
      .from("shared_connections")
      .insert({
        user_id: user.id,
        shared_user_id: dto.shared_user_id,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending connection request:", error);
      throw new Error("No se pudo enviar la solicitud");
    }

    return data;
  }

  /**
   * Get connection between two users (if exists)
   */
  static async getConnectionBetweenUsers(
    userId1: string,
    userId2: string
  ): Promise<SharedConnection | null> {
    const { data, error } = await supabase
      .from("shared_connections")
      .select("*")
      .or(
        `and(user_id.eq.${userId1},shared_user_id.eq.${userId2}),and(user_id.eq.${userId2},shared_user_id.eq.${userId1})`
      )
      .maybeSingle();

    if (error) {
      console.error("Error getting connection:", error);
      return null;
    }

    return data;
  }

  /**
   * Accept a connection request
   */
  static async acceptConnectionRequest(
    connectionId: string
  ): Promise<SharedConnection> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesión");
    }

    const { data, error } = await supabase
      .from("shared_connections")
      .update({ status: "accepted" })
      .eq("id", connectionId)
      .eq("shared_user_id", user.id) // Solo el receptor puede aceptar
      .select()
      .single();

    if (error) {
      console.error("Error accepting connection:", error);
      throw new Error("No se pudo aceptar la solicitud");
    }

    return data;
  }

  /**
   * Reject a connection request
   */
  static async rejectConnectionRequest(
    connectionId: string
  ): Promise<SharedConnection> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesión");
    }

    const { data, error } = await supabase
      .from("shared_connections")
      .update({ status: "rejected" })
      .eq("id", connectionId)
      .eq("shared_user_id", user.id) // Solo el receptor puede rechazar
      .select()
      .single();

    if (error) {
      console.error("Error rejecting connection:", error);
      throw new Error("No se pudo rechazar la solicitud");
    }

    return data;
  }

  /**
   * Delete/cancel a connection
   */
  static async deleteConnection(connectionId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesión");
    }

    const { error } = await supabase
      .from("shared_connections")
      .delete()
      .eq("id", connectionId)
      .or(`user_id.eq.${user.id},shared_user_id.eq.${user.id}`); // Ambos pueden eliminar

    if (error) {
      console.error("Error deleting connection:", error);
      throw new Error("No se pudo eliminar la conexión");
    }
  }

  /**
   * Get all connections for current user (accepted only)
   */
  static async getMyConnections(): Promise<ConnectionRequest[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesión");
    }

    const { data, error } = await supabase
      .from("shared_connections")
      .select("*")
      .eq("status", "accepted")
      .or(`user_id.eq.${user.id},shared_user_id.eq.${user.id}`);

    if (error) {
      console.error("Error getting connections:", error);
      throw new Error("No se pudieron cargar las conexiones");
    }

    // Obtener información de perfiles para cada conexión
    const connectionsWithProfiles = await Promise.all(
      (data || []).map(async (conn: any) => {
        const isSender = conn.user_id === user.id;
        const otherUserId = isSender ? conn.shared_user_id : conn.user_id;

        // Obtener perfil del otro usuario
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", otherUserId)
          .single();

        return {
          id: conn.id,
          other_user_id: otherUserId,
          other_user_name: profile?.full_name || null,
          other_user_avatar: profile?.avatar_url || null,
          status: conn.status,
          is_sender: isSender,
          created_at: conn.created_at,
        };
      })
    );

    return connectionsWithProfiles;
  }

  /**
   * Get pending requests (received by current user)
   */
  static async getPendingRequests(): Promise<ConnectionRequest[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesión");
    }

    const { data, error } = await supabase
      .from("shared_connections")
      .select("*")
      .eq("status", "pending")
      .eq("shared_user_id", user.id); // Solo las que YO recibí

    if (error) {
      console.error("Error getting pending requests:", error);
      throw new Error("No se pudieron cargar las solicitudes");
    }

    // Obtener información de perfiles para cada solicitud
    const requestsWithProfiles = await Promise.all(
      (data || []).map(async (conn: any) => {
        // Obtener perfil del remitente
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", conn.user_id)
          .single();

        return {
          id: conn.id,
          other_user_id: conn.user_id,
          other_user_name: profile?.full_name || null,
          other_user_avatar: profile?.avatar_url || null,
          status: conn.status,
          is_sender: false,
          created_at: conn.created_at,
        };
      })
    );

    return requestsWithProfiles;
  }

  /**
   * Get sent requests (sent by current user and still pending)
   */
  static async getSentRequests(): Promise<ConnectionRequest[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Debes iniciar sesión");
    }

    const { data, error } = await supabase
      .from("shared_connections")
      .select("*")
      .eq("status", "pending")
      .eq("user_id", user.id); // Solo las que YO envié

    if (error) {
      console.error("Error getting sent requests:", error);
      throw new Error("No se pudieron cargar las solicitudes enviadas");
    }

    // Obtener información de perfiles para cada solicitud
    const requestsWithProfiles = await Promise.all(
      (data || []).map(async (conn: any) => {
        // Obtener perfil del destinatario
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", conn.shared_user_id)
          .single();

        return {
          id: conn.id,
          other_user_id: conn.shared_user_id,
          other_user_name: profile?.full_name || null,
          other_user_avatar: profile?.avatar_url || null,
          status: conn.status,
          is_sender: true,
          created_at: conn.created_at,
        };
      })
    );

    return requestsWithProfiles;
  }

  /**
   * Check if current user is connected with another user
   */
  static async isConnectedWith(otherUserId: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data } = await supabase.rpc("are_users_connected", {
      user1_id: user.id,
      user2_id: otherUserId,
    });

    return data || false;
  }

  /**
   * Get connection status with another user
   */
  static async getConnectionStatus(
    otherUserId: string
  ): Promise<ConnectionStatus | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data } = await supabase.rpc("get_connection_status", {
      user1_id: user.id,
      user2_id: otherUserId,
    });

    return data;
  }

  /**
   * Count accepted connections for current user
   */
  static async countMyConnections(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    const { data } = await supabase.rpc("count_user_connections", {
      target_user_id: user.id,
    });

    return data || 0;
  }

  /**
   * Count pending requests for current user
   */
  static async countPendingRequests(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    const { data } = await supabase.rpc("count_pending_requests", {
      target_user_id: user.id,
    });

    return data || 0;
  }
}
