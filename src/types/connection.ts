/**
 * Types for shared connections system
 */

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface SharedConnection {
  id: string;
  user_id: string;
  shared_user_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Connection with user information
 */
export interface SharedConnectionWithUser extends SharedConnection {
  sender_name: string | null;
  sender_avatar: string | null;
  receiver_name: string | null;
  receiver_avatar: string | null;
}

/**
 * DTO for creating a connection request
 */
export interface CreateConnectionDTO {
  shared_user_id: string;
}

/**
 * DTO for updating connection status
 */
export interface UpdateConnectionDTO {
  status: ConnectionStatus;
}

/**
 * Connection request from perspective of current user
 */
export interface ConnectionRequest {
  id: string;
  other_user_id: string;
  other_user_name: string | null;
  other_user_avatar: string | null;
  status: ConnectionStatus;
  is_sender: boolean; // true if current user sent the request
  created_at: string;
}
