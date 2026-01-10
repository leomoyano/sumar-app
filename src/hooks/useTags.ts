import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_TAGS } from '@/types';

export interface Tag {
  id: string;
  name: string;
  isCustom: boolean;
}

export const useTags = (userId: string | undefined) => {
  const [customTags, setCustomTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Combine default tags with custom tags
  const allTags: Tag[] = [
    ...DEFAULT_TAGS.map(name => ({ id: name, name, isCustom: false })),
    ...customTags,
  ];

  const loadTags = useCallback(async () => {
    if (!userId) {
      setCustomTags([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;

      setCustomTags((data || []).map(tag => ({
        id: tag.id,
        name: tag.name,
        isCustom: true,
      })));
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const addTag = useCallback(async (name: string): Promise<Tag | null> => {
    if (!userId) throw new Error('Usuario no autenticado');
    
    // Check if tag already exists (default or custom)
    if (allTags.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      return null;
    }

    const { data, error } = await supabase
      .from('tags')
      .insert({ name, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('Error adding tag:', error);
      throw error;
    }

    const newTag: Tag = {
      id: data.id,
      name: data.name,
      isCustom: true,
    };

    setCustomTags(prev => [...prev, newTag]);
    return newTag;
  }, [userId, allTags]);

  const deleteTag = useCallback(async (tagId: string) => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }

    setCustomTags(prev => prev.filter(t => t.id !== tagId));
  }, []);

  return {
    tags: allTags,
    customTags,
    isLoading,
    addTag,
    deleteTag,
    refreshTags: loadTags,
  };
};
