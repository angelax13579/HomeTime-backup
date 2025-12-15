import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FamilyMember, Memory, Reminder, UserProfile, Prompt, FamilyPrompt, FamilyEvent, EventInvitationStatus, MemoryComment } from '@/types/family';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FamilyContextType {
  user: UserProfile;
  familyMembers: FamilyMember[];
  memories: Memory[];
  reminders: Reminder[];
  prompts: Prompt[];
  familyPrompts: FamilyPrompt[];
  events: FamilyEvent[];
  invitations: { eventId: string; event: FamilyEvent; status: EventInvitationStatus }[];
  loading: boolean;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => Promise<void>;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => Promise<void>;
  removeFamilyMember: (id: string) => Promise<void>;
  addMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'reactions' | 'comments'>) => Promise<void>;
  deleteMemory: (memoryId: string) => Promise<void>;
  addReaction: (memoryId: string, emoji: string) => Promise<void>;
  removeReaction: (memoryId: string) => Promise<void>;
  addComment: (memoryId: string, content: string) => Promise<void>;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  addFamilyPrompt: (prompt: Omit<FamilyPrompt, 'id' | 'createdAt' | 'respondedBy' | 'notificationSent'>) => void;
  addEvent: (event: Omit<FamilyEvent, 'id' | 'createdAt' | 'responses'>) => void;
  respondToInvitation: (eventId: string, status: EventInvitationStatus, message?: string) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  refreshData: () => Promise<void>;
}

const defaultPrompts: Prompt[] = [
  { id: '1', text: 'What made you smile today?', category: 'daily' },
  { id: '2', text: 'Share a childhood memory that still makes you laugh.', category: 'childhood' },
  { id: '3', text: 'What does "home" mean to you?', category: 'gratitude' },
  { id: '4', text: "What's one thing you're grateful for this week?", category: 'weekly' },
];

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  
  const [user, setUser] = useState<UserProfile>({
    id: '',
    name: 'You',
    email: '',
    country: 'United States',
    defaultVisibility: 'family',
    isPremium: false,
  });
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [prompts] = useState<Prompt[]>(defaultPrompts);
  const [familyPrompts, setFamilyPrompts] = useState<FamilyPrompt[]>([]);
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data when auth user changes
  useEffect(() => {
    if (authUser) {
      fetchData();
    } else {
      // Reset state when logged out
      setFamilyMembers([]);
      setMemories([]);
      setLoading(false);
    }
  }, [authUser?.id]);

  const fetchData = async () => {
    if (!authUser) return;
    
    setLoading(true);
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        setUser({
          id: authUser.id,
          name: profile.full_name || 'You',
          email: authUser.email || '',
          country: 'United States',
          defaultVisibility: 'family',
          isPremium: false,
        });
      } else {
        setUser({
          id: authUser.id,
          name: 'You',
          email: authUser.email || '',
          country: 'United States',
          defaultVisibility: 'family',
          isPremium: false,
        });
      }

      // Fetch family members
      const { data: members } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: true });

      if (members) {
        setFamilyMembers(members.map(m => ({
          id: m.id,
          name: m.name,
          relationship: m.relation as FamilyMember['relationship'],
          dateOfBirth: m.birthday ? new Date(m.birthday) : new Date(),
          togetherSince: new Date(m.created_at),
          showAge: true,
          showTimeVisualization: false,
          avatarUrl: m.avatar,
        })));
      }

      // Fetch memories with reactions and comments
      const { data: memoriesData } = await supabase
        .from('memories')
        .select(`
          *,
          memory_reactions (*),
          memory_comments (*)
        `)
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (memoriesData) {
        setMemories(memoriesData.map(m => ({
          id: m.id,
          authorId: m.user_id,
          authorName: m.author_name,
          content: m.content,
          photos: m.photo_url ? [m.photo_url] : [],
          createdAt: new Date(m.created_at),
          visibility: 'family' as const,
          reactions: (m.memory_reactions || []).map((r: any) => ({
            userId: r.user_id,
            emoji: r.emoji,
          })),
          comments: (m.memory_comments || []).map((c: any) => ({
            id: c.id,
            authorId: c.user_id,
            authorName: c.author_name,
            content: c.content,
            createdAt: new Date(c.created_at),
          })),
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchData();
  };

  const invitations = events
    .filter(event => event.invitedMembers.includes(user.id) && event.creatorId !== user.id)
    .map(event => ({
      eventId: event.id,
      event,
      status: event.responses[user.id]?.status || 'pending' as EventInvitationStatus,
    }));

  const addFamilyMember = async (member: Omit<FamilyMember, 'id'>) => {
    if (!authUser) return;

    const { data, error } = await supabase
      .from('family_members')
      .insert({
        user_id: authUser.id,
        name: member.name,
        relation: member.relationship,
        birthday: member.dateOfBirth?.toISOString().split('T')[0],
        avatar: member.avatarUrl,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add family member');
      console.error(error);
      return;
    }

    if (data) {
      const newMember: FamilyMember = {
        id: data.id,
        name: data.name,
        relationship: data.relation as FamilyMember['relationship'],
        dateOfBirth: data.birthday ? new Date(data.birthday) : new Date(),
        togetherSince: new Date(data.created_at),
        showAge: true,
        showTimeVisualization: false,
        avatarUrl: data.avatar,
      };
      setFamilyMembers(prev => [...prev, newMember]);
      toast.success('Family member added!');
    }
  };

  const updateFamilyMember = async (id: string, updates: Partial<FamilyMember>) => {
    const { error } = await supabase
      .from('family_members')
      .update({
        name: updates.name,
        relation: updates.relationship,
        birthday: updates.dateOfBirth?.toISOString().split('T')[0],
        avatar: updates.avatarUrl,
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update family member');
      console.error(error);
      return;
    }

    setFamilyMembers(prev =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const removeFamilyMember = async (id: string) => {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to remove family member');
      console.error(error);
      return;
    }

    setFamilyMembers(prev => prev.filter((m) => m.id !== id));
    toast.success('Family member removed');
  };

  const addMemory = async (memory: Omit<Memory, 'id' | 'createdAt' | 'reactions' | 'comments'>) => {
    if (!authUser || familyMembers.length === 0) {
      toast.error('Please add a family member first');
      return;
    }

    const { data, error } = await supabase
      .from('memories')
      .insert({
        user_id: authUser.id,
        family_member_id: familyMembers[0].id, // Default to first family member
        author_name: user.name,
        content: memory.content,
        photo_url: memory.photos?.[0],
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add memory');
      console.error(error);
      return;
    }

    if (data) {
      const newMemory: Memory = {
        id: data.id,
        authorId: authUser.id,
        authorName: user.name,
        content: data.content,
        photos: data.photo_url ? [data.photo_url] : [],
        createdAt: new Date(data.created_at),
        visibility: 'family',
        reactions: [],
        comments: [],
      };
      setMemories(prev => [newMemory, ...prev]);
      toast.success('Memory saved!');
    }
  };

  const deleteMemory = async (memoryId: string) => {
    if (!authUser) return;

    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', memoryId)
      .eq('user_id', authUser.id);

    if (error) {
      toast.error('Failed to delete memory');
      console.error(error);
      return;
    }

    setMemories(prev => prev.filter(m => m.id !== memoryId));
    toast.success('Memory deleted');
  };

  const addReaction = async (memoryId: string, emoji: string) => {
    if (!authUser) return;

    // Remove existing reaction first
    await supabase
      .from('memory_reactions')
      .delete()
      .eq('memory_id', memoryId)
      .eq('user_id', authUser.id);

    // Add new reaction
    const { error } = await supabase
      .from('memory_reactions')
      .insert({
        memory_id: memoryId,
        user_id: authUser.id,
        emoji,
      });

    if (error) {
      console.error(error);
      return;
    }

    setMemories(prev => prev.map(memory => {
      if (memory.id === memoryId) {
        const filtered = memory.reactions.filter(r => r.userId !== authUser.id);
        return {
          ...memory,
          reactions: [...filtered, { userId: authUser.id, emoji }],
        };
      }
      return memory;
    }));
  };

  const removeReaction = async (memoryId: string) => {
    if (!authUser) return;

    await supabase
      .from('memory_reactions')
      .delete()
      .eq('memory_id', memoryId)
      .eq('user_id', authUser.id);

    setMemories(prev => prev.map(memory => {
      if (memory.id === memoryId) {
        return {
          ...memory,
          reactions: memory.reactions.filter(r => r.userId !== authUser.id),
        };
      }
      return memory;
    }));
  };

  const addComment = async (memoryId: string, content: string) => {
    if (!authUser) return;

    const { data, error } = await supabase
      .from('memory_comments')
      .insert({
        memory_id: memoryId,
        user_id: authUser.id,
        author_name: user.name,
        content,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add comment');
      console.error(error);
      return;
    }

    if (data) {
      const newComment: MemoryComment = {
        id: data.id,
        authorId: authUser.id,
        authorName: user.name,
        content,
        createdAt: new Date(data.created_at),
      };

      setMemories(prev => prev.map(memory => {
        if (memory.id === memoryId) {
          return {
            ...memory,
            comments: [...memory.comments, newComment],
          };
        }
        return memory;
      }));
    }
  };

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder = { ...reminder, id: Date.now().toString() };
    setReminders(prev => [...prev, newReminder]);
  };

  const addFamilyPrompt = (prompt: Omit<FamilyPrompt, 'id' | 'createdAt' | 'respondedBy' | 'notificationSent'>) => {
    const newPrompt: FamilyPrompt = {
      ...prompt,
      id: Date.now().toString(),
      createdAt: new Date(),
      respondedBy: [],
      notificationSent: false,
    };
    setFamilyPrompts(prev => [newPrompt, ...prev]);
    toast.success('Prompt created!');
  };

  const addEvent = (event: Omit<FamilyEvent, 'id' | 'createdAt' | 'responses'>) => {
    const newEvent: FamilyEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date(),
      responses: {},
    };
    setEvents(prev => [newEvent, ...prev]);
    
    if (!event.isPersonalReminder && event.invitedMembers.length > 0) {
      toast.success('Event created!');
    }
  };

  const respondToInvitation = (eventId: string, status: EventInvitationStatus, message?: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          responses: {
            ...event.responses,
            [user.id]: { status, message },
          },
        };
      }
      return event;
    }));
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <FamilyContext.Provider
      value={{
        user,
        familyMembers,
        memories,
        reminders,
        prompts,
        familyPrompts,
        events,
        invitations,
        loading,
        addFamilyMember,
        updateFamilyMember,
        removeFamilyMember,
        addMemory,
        deleteMemory,
        addReaction,
        removeReaction,
        addComment,
        addReminder,
        addFamilyPrompt,
        addEvent,
        respondToInvitation,
        updateUser,
        refreshData,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
