// assets/js/results.js — Results page logic (name placeholder, city capture, UI reveal)

// Global variables for other scripts (whatsapp.js)
window._leadId = null;
window._city = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Read from sessionStorage (per updated GEMINI.md contract)
  const leadId = sessionStorage.getItem('bp_lead_id');
  const leadName = sessionStorage.getItem('bp_lead_name');
  
  if (leadId) {
    window._leadId = leadId;
  }
  
  // 2. Replace [NAME] placeholders with user's name or fallback
  const displayName = leadName ? leadName : 'Friend';
  replacePlaceholders(document.body, displayName);
  
  // 3. Setup city capture buttons
  setupCityCapture();
});

// Recursively replace [NAME] in text nodes
function replacePlaceholders(node, name) {
  if (node.nodeType === Node.TEXT_NODE) {
    node.textContent = node.textContent.replace(/\[NAME\]/g, name);
  } else {
    node.childNodes.forEach(child => replacePlaceholders(child, name));
  }
}

// Setup event listeners for city selection buttons
function setupCityCapture() {
  const cityButtons = document.querySelectorAll('.city-btn');
  const whatsappSection = document.getElementById('whatsapp-cta');
  
  if (!cityButtons.length) return;

  cityButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      // Prevent double clicks
      if (btn.disabled) return;
      
      const city = btn.textContent.replace('📍', '').trim();
      
      // Update UI state for all buttons to standard
      cityButtons.forEach(b => {
        b.classList.remove('border-[#2D6A4F]', 'bg-[#2D6A4F]', 'text-white');
        b.classList.add('bg-white', 'text-[#1A1A1A]', 'hover:bg-[#D8F3DC]');
        b.disabled = true; // Disable all temporarily while saving
      });
      
      // Highlight selected button
      btn.classList.remove('bg-white', 'text-[#1A1A1A]', 'hover:bg-[#D8F3DC]');
      btn.classList.add('border-[#2D6A4F]', 'bg-[#2D6A4F]', 'text-white');
      
      const originalText = btn.textContent;
      btn.textContent = 'Saving...';
      
      // Call Supabase update function if we have lead ID
      try {
        if (window._leadId && typeof updateLeadCity === 'function') {
          await updateLeadCity(window._leadId, city);
        }
      } catch (e) {
        console.error('Failed to update city', e);
      }
      
      // Keep selected state and update text
      window._city = city;
      btn.textContent = originalText + ' (Selected)';
      
      // Reveal WhatsApp CTA section and scroll smoothly
      if (whatsappSection) {
        whatsappSection.classList.remove('hidden');
        whatsappSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
