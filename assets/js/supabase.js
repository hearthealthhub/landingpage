// assets/js/supabase.js — Supabase client configuration and database functions

// As per Supabase documentation for client-side static apps, 
// these keys are safe to expose. Security is enforced via RLS policies.
const SUPABASE_URL = 'https://shtqiwmwplinwnktmysi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNodHFpd213cGxpbndua3RteXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDc2MzMsImV4cCI6MjA4OTY4MzYzM30.EIKvQIyKjlJsZajYg9yfq09ELFc4yYD5ArC-o1A2UgI';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// FUNCTION 1: Insert lead at data gate (before quiz)
// Returns: { leadId: string } | { error: string }
async function insertLead(name, whatsapp, source = 'organic') {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([{ name, whatsapp, source }])
      .select('id')
      .single();
      
    if (error) throw error;
    return { leadId: data.id };
  } catch (error) {
    console.error('Error inserting lead:', error);
    return { error: 'Failed to save your details. Please try again.' };
  }
}

// FUNCTION 2: Update lead with score and answers (on results page load)
// Returns: { success: true } | { error: string }
async function updateLeadScore(leadId, score, answers) {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ score, answers })
      .eq('id', leadId);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating score:', error);
    return { error: 'Failed to update score. Please try again.' };
  }
}

// FUNCTION 3: Update lead with city (on city selection)
// Returns: { success: true } | { error: string }
async function updateLeadCity(leadId, city) {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ city })
      .eq('id', leadId);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating city:', error);
    return { error: 'Failed to update city. Please try again.' };
  }
}

// FUNCTION 4: Mark lead as converted (on WhatsApp CTA click)
// Returns: { success: true } | { error: string }
async function markLeadConverted(leadId) {
  try {
    const { error } = await supabase
      .from('leads')
      .update({ converted: true })
      .eq('id', leadId);
      
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error converting lead:', error);
    return { error: 'Failed to log conversion.' };
  }
}
