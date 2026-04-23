// assets/js/quiz.js — Handles data gate submission, quiz question rendering, scoring, and redirect

// Quiz state
let currentQuestionIndex = 0;
let answers = {};
let leadId = null;
let leadName = '';

// Quiz Questions Data (as specified in PRD 7.6)
const quizQuestions = [
  {
    question: "Who are you completing this assessment for?",
    options: [
      { text: "My spouse or partner", score: 3 },
      { text: "A parent or family member", score: 3 },
      { text: "Myself", score: 2 },
      { text: "Someone else I care about", score: 2 }
    ]
  },
  {
    question: "How long has the person been managing high blood pressure?",
    options: [
      { text: "Less than 6 months", score: 1 },
      { text: "6 months to 2 years", score: 2 },
      { text: "2 to 5 years", score: 3 },
      { text: "More than 5 years", score: 4 }
    ]
  },
  {
    question: "Are they currently on BP medication prescribed by a doctor?",
    options: [
      { text: "Yes, and it seems to be working well", score: 1 },
      { text: "Yes, but their readings are still not fully stable", score: 3 },
      { text: "Yes, but they don't take it consistently", score: 4 },
      { text: "No, they are managing without medication", score: 3 }
    ]
  },
  {
    question: "Which of these symptoms do they currently experience?",
    options: [
      { text: "Frequent headaches or dizziness", score: 2 },
      { text: "Fatigue or low energy most days", score: 2 },
      { text: "Both headaches and fatigue", score: 4 },
      { text: "None of the above — they feel generally fine", score: 1 }
    ]
  },
  {
    question: "How would you describe their stress and lifestyle?",
    options: [
      { text: "Very stressful — demanding work or family pressure", score: 4 },
      { text: "Moderately stressful — manageable most of the time", score: 2 },
      { text: "Low stress — they live a calm, balanced life", score: 1 },
      { text: "Retired or semi-retired", score: 1 }
    ]
  },
  {
    question: "Is there a family history of stroke or heart attack?",
    options: [
      { text: "Yes — a parent or sibling had a stroke or heart attack", score: 3 },
      { text: "Yes — a grandparent or extended family member", score: 2 },
      { text: "Not that we know of", score: 1 },
      { text: "Yes, and it was severe or fatal", score: 4 }
    ]
  },
  {
    question: "How often do they check their blood pressure?",
    options: [
      { text: "Daily or several times a week", score: 1 },
      { text: "Once a week or so", score: 2 },
      { text: "Only at the doctor's clinic", score: 3 },
      { text: "Rarely or never", score: 4 }
    ]
  },
  {
    question: "How concerned are you about their long-term heart health?",
    options: [
      { text: "Extremely worried — I think about it often", score: 4 },
      { text: "Quite worried — it's always in the back of my mind", score: 3 },
      { text: "Somewhat worried — but I feel things are under control", score: 2 },
      { text: "Not very worried — they are managing well", score: 1 }
    ]
  }
];

// Initialize event listeners when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  const gateSubmitBtn = document.getElementById('btn-gate-submit');
  if (gateSubmitBtn) {
    gateSubmitBtn.addEventListener('click', handleGateSubmit);
  }
});

// Validate gate form, submit lead, and transition to quiz state
async function handleGateSubmit() {
  const nameInput = document.getElementById('input-name');
  const whatsappInput = document.getElementById('input-whatsapp');
  const errorMsg = document.getElementById('gate-error');
  const submitBtn = document.getElementById('btn-gate-submit');
  
  const name = nameInput.value.trim();
  const whatsapp = whatsappInput.value.trim();
  
  if (!name || whatsapp.length < 10) {
    errorMsg.classList.remove('hidden');
    return;
  }
  
  errorMsg.classList.add('hidden');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Please wait...';
  
  try {
    const result = await insertLead(name, whatsapp);
    if (result.error) {
      errorMsg.textContent = result.error;
      errorMsg.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Get My Results →';
      return;
    }
    
    leadId = result.leadId;
    leadName = name;

    if (window.HHTracking) {
      window.HHTracking.pushEvent('submit_gate_form', {
        lead_id: leadId,
        ...window.HHTracking.getAttribution()
      });
    }
    
    // Switch state from gate to quiz
    document.getElementById('state-gate').classList.add('hidden');
    document.getElementById('state-quiz').classList.remove('hidden');
    document.getElementById('q-counter').parentElement.classList.remove('hidden'); 
    
    renderQuestion();
    updateProgress();
    
  } catch (error) {
    console.error('Submission error:', error);
    errorMsg.textContent = 'An unexpected error occurred. Please try again.';
    errorMsg.classList.remove('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Get My Results →';
  }
}

// Render the current question card
function renderQuestion() {
  const quizContainer = document.getElementById('state-quiz');
  const currentQ = quizQuestions[currentQuestionIndex];
  
  quizContainer.innerHTML = `
    <div class="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] max-w-lg mx-auto mt-8">
      <p class="text-[#6B7280] font-inter text-sm mb-3">Question ${currentQuestionIndex + 1} of 8</p>
      <h2 class="text-[#1A1A1A] font-poppins font-semibold text-xl mb-6">${currentQ.question}</h2>
      <div class="flex flex-col gap-3">
        ${currentQ.options.map((opt, idx) => `
          <button 
            type="button"
            class="quiz-btn w-full text-left bg-white border-2 border-[#E5E7EB] text-[#1A1A1A] py-3 px-5 rounded-xl font-inter text-base hover:border-[#2D6A4F] hover:bg-[#D8F3DC] transition-all duration-150"
            data-score="${opt.score}"
            onclick="handleAnswer(this, ${opt.score})"
          >
            ${opt.text}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

// Handle an answer selection, save score, and auto-advance
function handleAnswer(buttonEl, score) {
  // Disable all buttons to prevent double click
  const allButtons = document.querySelectorAll('.quiz-btn');
  allButtons.forEach(btn => btn.disabled = true);
  
  // Highlight selected button
  buttonEl.classList.remove('border-[#E5E7EB]', 'hover:bg-[#D8F3DC]', 'bg-white', 'text-[#1A1A1A]');
  buttonEl.classList.add('border-[#2D6A4F]', 'bg-[#2D6A4F]', 'text-white');
  
  // Save answer
  answers[\`q\${currentQuestionIndex + 1}\`] = score;
  
  // Advance after 300ms
  setTimeout(() => {
    currentQuestionIndex++;
    updateProgress();
    
    if (currentQuestionIndex < quizQuestions.length) {
      renderQuestion();
    } else {
      processResults();
    }
  }, 300);
}

// Update the progress bar and counter in the header
function updateProgress() {
  const total = quizQuestions.length;
  // Progress is 0 before first question is answered.
  const progressPercent = (currentQuestionIndex / total) * 100;
  
  const fillEl = document.getElementById('progress-fill');
  const counterEl = document.getElementById('q-counter');
  
  if (fillEl) fillEl.style.width = \`\${progressPercent}%\`;
  
  // Counter should show current question number (cap at total)
  if (counterEl) {
    const qNum = currentQuestionIndex < total ? currentQuestionIndex + 1 : total;
    counterEl.textContent = \`\${qNum} / \${total}\`;
  }
}

// Calculate final score string based on answers
function calculateScore(answersObj) {
  const total = Object.values(answersObj).reduce((sum, val) => sum + val, 0);
  if (total >= 22) return 'high-risk';
  if (total >= 14) return 'moderate-risk';
  return 'actively-managing';
}

// Handle transition to loading state and redirect to results
async function processResults() {
  // Hide quiz, show loading
  document.getElementById('state-quiz').classList.add('hidden');
  document.getElementById('state-loading').classList.remove('hidden');
  
  const score = calculateScore(answers);
  const startTime = Date.now();
  
  try {
    await updateLeadScore(leadId, score, answers);

    if (window.HHTracking) {
      window.HHTracking.pushEvent('complete_quiz', {
        lead_id: leadId,
        result_type: score,
        ...window.HHTracking.getAttribution()
      });
    }
    
    // Follow the updated GEMINI.md sessionStorage contract
    sessionStorage.setItem('bp_lead_id', leadId);
    sessionStorage.setItem('bp_lead_name', leadName);
    sessionStorage.setItem('bp_lead_score', score);
    
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, 2000 - elapsedTime);
    
    setTimeout(() => {
      window.location.href = \`../results/\${score}.html\`;
    }, remainingTime);
    
  } catch (error) {
    console.error('Error during result processing:', error);
    
    // Provide fallback and redirect anyway if DB fails
    sessionStorage.setItem('bp_lead_id', leadId || '');
    sessionStorage.setItem('bp_lead_name', leadName);
    sessionStorage.setItem('bp_lead_score', score);
    
    setTimeout(() => {
      window.location.href = \`../results/\${score}.html\`;
    }, 2000);
  }
}
