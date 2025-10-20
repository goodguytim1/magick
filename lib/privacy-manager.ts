import { supabase } from './supabase';

export async function exportUserData(userId: string): Promise<object> {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Get consent logs
    const { data: consentLogs, error: consentError } = await supabase
      .from('consent_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (consentError) {
      throw consentError;
    }

    // Get user events (if they exist in the future)
    const { data: events, error: eventsError } = await supabase
      .from('user_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (eventsError) {
      console.warn('Events table not found or error:', eventsError);
    }

    // Get offer redemptions (if they exist in the future)
    const { data: redemptions, error: redemptionsError } = await supabase
      .from('offer_redemptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (redemptionsError) {
      console.warn('Redemptions table not found or error:', redemptionsError);
    }

    const exportData = {
      export_date: new Date().toISOString(),
      user_profile: profile,
      consent_logs: consentLogs || [],
      user_events: events || [],
      offer_redemptions: redemptions || [],
    };

    return exportData;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
}

export async function deleteUserData(userId: string): Promise<void> {
  try {
    // Try the Edge Function first (this will completely delete the user)
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.warn('Edge Function not available, falling back to client-side deletion:', error);
        throw error; // This will trigger the fallback
      }

      if (data?.error) {
        console.warn('Edge Function error, falling back to client-side deletion:', data.error);
        throw new Error(data.error); // This will trigger the fallback
      }

      console.log('User completely deleted via Edge Function');
      return;
    } catch (edgeFunctionError) {
      console.log('Edge Function failed, using fallback method');
      
      // Fallback: Delete database data only (auth user will remain)
      await deleteUserDataFallback(userId);
    }
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}

async function deleteUserDataFallback(userId: string): Promise<void> {
  try {
    // Delete consent logs first (foreign key constraint)
    const { error: consentError } = await supabase
      .from('consent_logs')
      .delete()
      .eq('user_id', userId);

    if (consentError) {
      console.warn('Error deleting consent logs:', consentError);
    }

    // Delete user events (if they exist)
    const { error: eventsError } = await supabase
      .from('user_events')
      .delete()
      .eq('user_id', userId);

    if (eventsError) {
      console.warn('Error deleting user events:', eventsError);
    }

    // Delete offer redemptions (if they exist)
    const { error: redemptionsError } = await supabase
      .from('offer_redemptions')
      .delete()
      .eq('user_id', userId);

    if (redemptionsError) {
      console.warn('Error deleting offer redemptions:', redemptionsError);
    }

    // Delete user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.warn('Error deleting user profile:', profileError);
    }

    console.log('User data deleted successfully (fallback method). Auth user remains in Supabase Auth.');
  } catch (error) {
    console.error('Error in fallback delete:', error);
    throw error;
  }
}

export async function anonymizeUserData(userId: string): Promise<void> {
  try {
    // Anonymize user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        email: `deleted_${Date.now()}@anonymized.com`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) {
      throw profileError;
    }

    // Anonymize consent logs
    const { error: consentError } = await supabase
      .from('consent_logs')
      .update({
        user_id: `anonymized_${Date.now()}`,
      })
      .eq('user_id', userId);

    if (consentError) {
      console.warn('Error anonymizing consent logs:', consentError);
    }

    // Anonymize user events (if they exist)
    const { error: eventsError } = await supabase
      .from('user_events')
      .update({
        user_id: `anonymized_${Date.now()}`,
      })
      .eq('user_id', userId);

    if (eventsError) {
      console.warn('Error anonymizing user events:', eventsError);
    }

    // Anonymize offer redemptions (if they exist)
    const { error: redemptionsError } = await supabase
      .from('offer_redemptions')
      .update({
        user_id: `anonymized_${Date.now()}`,
      })
      .eq('user_id', userId);

    if (redemptionsError) {
      console.warn('Error anonymizing offer redemptions:', redemptionsError);
    }
  } catch (error) {
    console.error('Error anonymizing user data:', error);
    throw error;
  }
}

export function downloadUserData(data: object, filename: string = 'user-data-export.json'): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading user data:', error);
    throw error;
  }
}
