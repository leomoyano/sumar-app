import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_TAGS } from '@/types';

export interface Tag {
  id: string;
  name: string;
  isCustom: boolean;
}

export const useTags = (userId: string | undefined) => {
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Combine default tags with custom tags
  const allTags: Tag[] = [
    ...DEFAULT_TAGS.map(name => ({ id: name, name, isCustom: false })),
    ...customTags.map(name => ({ id: `custom-${name}`, name, isCustom: true })),
  ];

  const loadTags = useCallback(async () => {
    if (!userId) {
      setCustomTags([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('tags')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      setCustomTags(data?.tags || []);
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

    const newTags = [...customTags, name];

    const { error } = await supabase
      .from('profiles')
      .update({ tags: newTags })
      .eq('user_id', userId);

    if (error) {
      console.error('Error adding tag:', error);
      throw error;
    }

    setCustomTags(newTags);
    
    return {
      id: `custom-${name}`,
      name,
      isCustom: true,
    };
  }, [userId, allTags, customTags]);

  const deleteTag = useCallback(async (tagName: string) => {
    if (!userId) throw new Error('Usuario no autenticado');

    const newTags = customTags.filter(t => t !== tagName);

    const { error } = await supabase
      .from('profiles')
      .update({ tags: newTags })
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }

    setCustomTags(newTags);
  }, [userId, customTags]);

  return {
    tags: allTags,
    customTags: customTags.map(name => ({ id: `custom-${name}`, name, isCustom: true })),
    isLoading,
    addTag,
    deleteTag,
    refreshTags: loadTags,
  };
};
