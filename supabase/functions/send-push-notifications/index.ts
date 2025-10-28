import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildPushPayload,
  type PushSubscription,
  type PushMessage,
  type VapidKeys,
} from "npm:@block65/webcrypto-web-push@1.0.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRecord {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: any;
  sent: boolean;
  created_at: string;
}

interface SubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // VAPID keys in base64url format (standard web-push format)
    const vapid: VapidKeys = {
      subject: Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@latidos.app',
      publicKey: Deno.env.get('VAPID_PUBLIC_KEY')!,
      privateKey: Deno.env.get('VAPID_PRIVATE_KEY')!,
    };

    console.log('Initializing with VAPID subject:', vapid.subject);

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending notifications (limit 50 per execution)
    const { data: notifications, error: queueError } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('sent', false)
      .order('created_at', { ascending: true })
      .limit(50);

    if (queueError) {
      console.error('Error fetching notifications:', queueError);
      throw queueError;
    }

    if (!notifications || notifications.length === 0) {
      console.log('No pending notifications');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No pending notifications',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${notifications.length} notifications`);

    let sentCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each notification
    for (const notification of notifications as NotificationRecord[]) {
      try {
        // Get user's push subscriptions
        const { data: subs, error: subError } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', notification.user_id);

        if (subError) {
          console.error(`Error fetching subscriptions for user ${notification.user_id}:`, subError);
          errors.push(`User ${notification.user_id}: ${subError.message}`);
          errorCount++;
          continue;
        }

        if (!subs || subs.length === 0) {
          console.log(`No subscriptions for user ${notification.user_id}`);
          // Mark as sent even if no subscriptions
          await supabase
            .from('notification_queue')
            .update({ sent: true, sent_at: new Date().toISOString() })
            .eq('id', notification.id);
          continue;
        }

        console.log(`Found ${subs.length} subscription(s) for user ${notification.user_id}`);

        // Send to each subscription
        let userSentSuccessfully = false;
        for (const sub of subs as SubscriptionRecord[]) {
          try {
            const subscription: PushSubscription = {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            };

            // Prepare notification payload
            const notificationData = {
              title: notification.title,
              body: notification.body,
              icon: '/logo.png',
              badge: '/badge.png',
              tag: `latidos-${notification.type}`,
              data: {
                url: notification.data?.url || '/',
                type: notification.type,
                ...notification.data,
              },
            };

            const message: PushMessage = {
              data: JSON.stringify(notificationData),
              options: {
                ttl: 86400, // 24 hours
                urgency: 'normal',
              },
            };

            console.log(`Sending to endpoint: ${sub.endpoint.substring(0, 50)}...`);

            // Build and send push notification
            const payload = await buildPushPayload(message, subscription, vapid);
            const response = await fetch(subscription.endpoint, payload);

            if (response.ok) {
              console.log(`✓ Notification sent successfully to ${sub.endpoint.substring(0, 50)}...`);
              sentCount++;
              userSentSuccessfully = true;
            } else if (response.status === 410 || response.status === 404) {
              // Subscription expired or invalid, remove it
              console.log(`✗ Subscription expired (${response.status}), removing: ${sub.endpoint.substring(0, 50)}...`);
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', sub.id);
            } else {
              const errorText = await response.text();
              console.error(`✗ Push failed with status ${response.status}: ${errorText}`);
              errorCount++;
              errors.push(`Notification ${notification.id}, endpoint ${sub.endpoint.substring(0, 30)}: ${response.status} ${errorText.substring(0, 100)}`);
            }
          } catch (pushError: any) {
            console.error('Error sending to subscription:', pushError);
            errorCount++;
            errors.push(`Notification ${notification.id}: ${pushError.message}`);
          }
        }

        // Mark notification as sent
        await supabase
          .from('notification_queue')
          .update({
            sent: true,
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id);

        if (userSentSuccessfully) {
          console.log(`✓ Notification ${notification.id} marked as sent`);
        }

      } catch (err: any) {
        console.error('Error processing notification:', err);
        errorCount++;
        errors.push(`Notification ${notification.id}: ${err.message}`);
      }
    }

    const result = {
      success: true,
      message: 'Processing completed',
      processed: notifications.length,
      sent: sentCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors.slice(0, 10) : undefined, // Limit to first 10 errors
    };

    console.log('Processing result:', result);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
