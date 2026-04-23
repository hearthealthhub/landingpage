// assets/js/whatsapp.js — WhatsApp URL builder and conversion tracking

document.addEventListener('DOMContentLoaded', () => {
  const whatsappBtn = document.getElementById('btn-whatsapp');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', handleWhatsAppClick);
  }
});

// Build the WhatsApp API URL with pre-filled message
function buildWhatsAppURL(name, score, city) {
  const phone = '2349063483741'; // Replace with Maryam's number

  const scoreLabels = {
    'high-risk': 'HIGH RISK',
    'moderate-risk': 'MODERATE RISK',
    'actively-managing': 'ACTIVELY MANAGING'
  };

  const scoreLabel = scoreLabels[score] || 'UNKNOWN';

  const message = `Hi Maryam, I just completed the BP Risk Assessment. My result was: ${scoreLabel}. My name is ${name} and I am in ${city}. I would like to learn more about the Heart Health Pack.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// Handle the WhatsApp CTA click: track conversion, build URL, clear session, and redirect
async function handleWhatsAppClick(e) {
  if (e) e.preventDefault();

  const btn = document.getElementById('btn-whatsapp');
  if (btn.disabled) return;

  btn.disabled = true;
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Opening WhatsApp...';

  // Read state from sessionStorage or globally scoped fallbacks
  const leadId = window._leadId || sessionStorage.getItem('bp_lead_id');
  const name = sessionStorage.getItem('bp_lead_name') || 'Friend';
  const score = sessionStorage.getItem('bp_lead_score') || 'unknown';
  const city = window._city || 'Nigeria';

  // Track conversion in Supabase
  try {
    if (leadId && typeof markLeadConverted === 'function') {
      await markLeadConverted(leadId);
    }
  } catch (error) {
    console.error('Failed to log conversion via Supabase', error);
  }

  if (window.HHTracking) {
    window.HHTracking.pushEvent('click_whatsapp', {
      lead_id: leadId,
      result_type: score,
      city,
      ...window.HHTracking.getAttribution()
    });
  }

  // Build URL and open in new tab
  const url = buildWhatsAppURL(name, score, city);
  window.open(url, '_blank');

  // Fulfill GEMINI.md sessionStorage contract
  sessionStorage.clear();

  // Reset button state
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }, 2000);
}
