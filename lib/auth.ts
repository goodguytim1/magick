import { AuthUser } from '../types/user';
import { createUserProfile, isUserDeleted, softDeleteUser } from './consent-manager';
import { supabase } from './supabase';

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // If user signed in successfully, check if their account is soft deleted
    if (data.user) {
      const isDeleted = await isUserDeleted(data.user.id);
      if (isDeleted) {
        // Sign out the user immediately if their account is deleted
        await supabase.auth.signOut();
        throw new Error('This account has been deleted. Please contact support if you believe this is an error.');
      }

      try {
        await createUserProfile(data.user.id, email);
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't throw here - the user signed in successfully, profile creation is secondary
      }
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // If user was created successfully, create their profile
    if (data.user) {
      try {
        await createUserProfile(data.user.id, email);
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't throw here - the user was created successfully, profile creation is secondary
      }
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }

    if (!user) {
      return null;
    }

    // Check if the user's account is soft deleted
    const isDeleted = await isUserDeleted(user.id);
    if (isDeleted) {
      // Sign out the user if their account is deleted
      await supabase.auth.signOut();
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      created_at: user.created_at,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'magick://reset-password',
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
}

export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }

    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

export async function deleteAccount(): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Soft delete the user profile
    await softDeleteUser(user.id);

    // Sign out the user after soft deletion
    await signOut();

    console.log('Account deleted successfully');
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
}
