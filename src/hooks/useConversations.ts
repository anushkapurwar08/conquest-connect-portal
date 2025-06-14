
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface ConversationItem {
  id: string;
  other_profile_id: string;
  other_profile_name: string;
  other_profile_role: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export const useConversations = () => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      
      // Get conversations where this profile is involved
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`mentor_id.eq.${profile.id},startup_id.eq.${profile.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (!conversationsData?.length) {
        setConversations([]);
        return;
      }

      // Process each conversation to get other participant details
      const processedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          const otherProfileId = conv.mentor_id === profile.id ? conv.startup_id : conv.mentor_id;
          
          // Get other profile details
          const { data: otherProfile } = await supabase
            .from('profiles')
            .select('id, username, first_name, last_name, role')
            .eq('id', otherProfileId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages (from other person)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('sender_profile_id', otherProfileId);

          const displayName = otherProfile?.first_name && otherProfile?.last_name
            ? `${otherProfile.first_name} ${otherProfile.last_name}`
            : otherProfile?.username || 'Unknown User';

          return {
            id: conv.id,
            other_profile_id: otherProfileId,
            other_profile_name: displayName,
            other_profile_role: otherProfile?.role || 'unknown',
            last_message: lastMessage?.content || 'No messages yet',
            last_message_time: lastMessage?.created_at || conv.created_at,
            unread_count: unreadCount || 0
          };
        })
      );

      setConversations(processedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [profile?.id]);

  return {
    conversations,
    loading,
    refreshConversations: fetchConversations
  };
};
