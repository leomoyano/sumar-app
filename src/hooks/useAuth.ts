import { useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '@/types';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from '@/lib/storage';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setAuthState({
      user,
      isAuthenticated: !!user,
    });
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // Mock password validation (en producción usar hash)
    const storedPassword = localStorage.getItem(`password_${user.id}`);
    if (storedPassword !== password) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    setCurrentUser(user);
    setAuthState({ user, isAuthenticated: true });
    return { success: true };
  }, []);

  const register = useCallback((email: string, password: string, name: string): { success: boolean; error?: string } => {
    const users = getUsers();
    
    if (users.some(u => u.email === email)) {
      return { success: false, error: 'El email ya está registrado' };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    saveUsers([...users, newUser]);
    localStorage.setItem(`password_${newUser.id}`, password);
    setCurrentUser(newUser);
    setAuthState({ user: newUser, isAuthenticated: true });
    
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setAuthState({ user: null, isAuthenticated: false });
  }, []);

  return {
    ...authState,
    isLoading,
    login,
    register,
    logout,
  };
};
