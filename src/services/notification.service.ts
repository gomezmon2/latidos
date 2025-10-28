/**
 * Notification Service
 * Maneja el registro y envío de notificaciones push
 */

import { supabase } from "@/integrations/supabase/client";

export type NotificationType =
  | 'new_message'
  | 'new_comment'
  | 'new_reaction'
  | 'connection_request'
  | 'connection_accepted';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  url?: string;
  icon?: string;
  data?: any;
}

interface PushSubscriptionData {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class NotificationService {
  /**
   * Verifica si las notificaciones están soportadas
   */
  static isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Verifica el estado del permiso de notificaciones
   */
  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Solicita permiso para mostrar notificaciones
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Las notificaciones no están soportadas en este navegador');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      throw new Error('Los permisos de notificación han sido denegados');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Registra el Service Worker
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker no soportado');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registrado:', registration);
      return registration;
    } catch (error) {
      console.error('Error al registrar Service Worker:', error);
      return null;
    }
  }

  /**
   * Muestra una notificación local (no push)
   */
  static async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.isSupported()) {
      console.warn('Notificaciones no soportadas');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Permiso de notificaciones no concedido');
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/logo.png',
      badge: '/badge.png',
      tag: `latidos-${payload.type}`,
      data: {
        url: payload.url || '/',
        type: payload.type,
        ...payload.data
      },
      requireInteraction: false,
      vibrate: [200, 100, 200],
    });
  }

  /**
   * Inicializa el servicio de notificaciones
   */
  static async initialize(): Promise<boolean> {
    try {
      // Registrar Service Worker
      const registration = await this.registerServiceWorker();
      if (!registration) return false;

      // Verificar si ya tenemos permiso
      if (this.getPermissionStatus() === 'granted') {
        // Subscribir al servidor push
        await this.subscribeToPushNotifications(registration);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error al inicializar notificaciones:', error);
      return false;
    }
  }

  /**
   * Genera VAPID key del servidor (debe ser la misma que en Supabase)
   */
  private static getVapidPublicKey(): string {
    // Esta clave debe estar en las variables de entorno
    return import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
  }

  /**
   * Convierte VAPID key de base64 a Uint8Array
   */
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Subscripción a notificaciones push del servidor
   */
  static async subscribeToPushNotifications(registration: ServiceWorkerRegistration): Promise<void> {
    try {
      const vapidPublicKey = this.getVapidPublicKey();
      if (!vapidPublicKey) {
        console.warn('No se encontró VAPID public key');
        return;
      }

      // Verificar si ya existe una suscripción
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Crear nueva suscripción
        const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      // Guardar la suscripción en la base de datos
      await this.savePushSubscription(subscription);

      console.log('Suscripción push guardada correctamente');
    } catch (error) {
      console.error('Error al subscribirse a push notifications:', error);
    }
  }

  /**
   * Guarda la suscripción push en la base de datos
   */
  static async savePushSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('Usuario no autenticado');
        return;
      }

      // Convertir la suscripción a JSON
      const subscriptionJson = subscription.toJSON();

      // Nuevo formato: columnas separadas para endpoint, p256dh, auth
      const endpoint = subscriptionJson.endpoint || '';
      const p256dh = subscriptionJson.keys?.p256dh || '';
      const auth = subscriptionJson.keys?.auth || '';

      // Guardar en la base de datos con upsert
      // La tabla tiene UNIQUE(user_id, endpoint) así que podemos usar upsert
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: endpoint,
          p256dh: p256dh,
          auth: auth,
          user_agent: navigator.userAgent,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,endpoint',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error al guardar suscripción:', error);
      } else {
        console.log('Suscripción push guardada correctamente');
      }
    } catch (error) {
      console.error('Error en savePushSubscription:', error);
    }
  }

  /**
   * Desuscribirse de las notificaciones push
   */
  static async unsubscribeFromPush(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Eliminar de la base de datos
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const subscriptionJson = subscription.toJSON();
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', subscriptionJson.endpoint);
        }

        console.log('Desuscrito de notificaciones push');
      }
    } catch (error) {
      console.error('Error al desuscribirse:', error);
    }
  }

  /**
   * Muestra notificación de nuevo mensaje
   */
  static async notifyNewMessage(senderName: string, message: string, chatUrl: string): Promise<void> {
    await this.showNotification({
      type: 'new_message',
      title: `Nuevo mensaje de ${senderName}`,
      body: message.length > 100 ? message.substring(0, 100) + '...' : message,
      url: chatUrl,
    });
  }

  /**
   * Muestra notificación de nuevo comentario
   */
  static async notifyNewComment(authorName: string, storyTitle: string, storyUrl: string): Promise<void> {
    await this.showNotification({
      type: 'new_comment',
      title: 'Nuevo comentario',
      body: `${authorName} comentó en "${storyTitle}"`,
      url: storyUrl,
    });
  }

  /**
   * Muestra notificación de nueva reacción
   */
  static async notifyNewReaction(userName: string, storyTitle: string, storyUrl: string): Promise<void> {
    await this.showNotification({
      type: 'new_reaction',
      title: 'Nueva reacción',
      body: `A ${userName} le gustó tu historia "${storyTitle}"`,
      url: storyUrl,
    });
  }

  /**
   * Muestra notificación de solicitud de conexión
   */
  static async notifyConnectionRequest(userName: string): Promise<void> {
    await this.showNotification({
      type: 'connection_request',
      title: 'Nueva solicitud de conexión',
      body: `${userName} quiere conectar contigo`,
      url: '/compartidos',
    });
  }

  /**
   * Muestra notificación de conexión aceptada
   */
  static async notifyConnectionAccepted(userName: string): Promise<void> {
    await this.showNotification({
      type: 'connection_accepted',
      title: 'Solicitud aceptada',
      body: `${userName} aceptó tu solicitud de conexión`,
      url: '/compartidos',
    });
  }
}
