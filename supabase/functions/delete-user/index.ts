import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const userId = user.id

    // Delete consent logs first (foreign key constraint)
    const { error: consentError } = await supabaseClient
      .from('consent_logs')
      .delete()
      .eq('user_id', userId)

    if (consentError) {
      console.warn('Error deleting consent logs:', consentError)
    }

    // Delete user events (if they exist)
    const { error: eventsError } = await supabaseClient
      .from('user_events')
      .delete()
      .eq('user_id', userId)

    if (eventsError) {
      console.warn('Error deleting user events:', eventsError)
    }

    // Delete offer redemptions (if they exist)
    const { error: redemptionsError } = await supabaseClient
      .from('offer_redemptions')
      .delete()
      .eq('user_id', userId)

    if (redemptionsError) {
      console.warn('Error deleting offer redemptions:', redemptionsError)
    }

    // Delete user profile
    const { error: profileError } = await supabaseClient
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.warn('Error deleting user profile:', profileError)
    }

    // Create admin client to delete auth user
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete the auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete auth user', details: authError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User completely deleted' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in delete-user function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})



