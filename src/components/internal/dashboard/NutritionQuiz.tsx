import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface Question { id: string; question: string; questionType: string; scaleOptions: string[]; }
interface NutritionResult {
  score: number; maxScore: number; label: string;
  categories: { name: string; emoji: string; pct: number }[];
  recommendations: string[];
  assessment: string;
}

const STEPS = [
  { key: 'SCALE', label: 'You', emoji: '👋', title: "Let's get to know you!", subtitle: 'Tell us a bit about yourself' },
  { key: 'NUTRITION_STEP_2_PROTEIN', label: 'Protein', emoji: '💪', title: 'Protein Power', subtitle: 'How much protein do you get daily?' },
  { key: 'NUTRITION_STEP_3_FRUITS_VEGGIES', label: 'Fruits', emoji: '🥗', title: 'Fruits & Veggies', subtitle: 'How colorful is your plate?' },
  { key: 'NUTRITION_STEP_4_MEALS', label: 'Meals', emoji: '🍽️', title: 'Meal Habits', subtitle: 'How regular are your meals?' },
  { key: 'NUTRITION_STEP_5_HABITS', label: 'Habits', emoji: '🏠', title: 'Eating Style', subtitle: 'Home-cooked or eating out?' },
  { key: 'NUTRITION_STEP_6_ENERGY', label: 'Energy', emoji: '💧', title: 'Hydration & Energy', subtitle: 'Water and energy go hand in hand' },
];

const ACCENT = '#2D9F83';
const BG = '#0F1A15';
const CARD = '#1A2E25';
const CARD_LIGHT = '#223D32';

const PROTEIN_EMOJIS: Record<string, string> = { 'Meat': '🥩', 'Fish': '🐟', 'Eggs': '🥚', 'Dairy': '🧀', 'Beans/Lentils': '🫘', 'Nuts/Seeds': '🥜', 'Tofu/Soy': '🍢', 'Protein Bars': '🍫' };
const MEAL_FREQ_EMOJIS = ['✅', '👍', '👋', '😐', '❌'];
const MEAL_LABELS = ['Breakfast', 'Lunch', 'Dinner'];
const MEAL_EMOJIS = ['🍳', '🌟', '🌙'];
const EATING_OUT_EMOJIS = ['🍔', '📦', '🍱', '🏠', '👨‍🍳'];
const SNACK_EMOJIS = ['🍎', '🔄', '🍕', '🚫'];
const ENERGY_EMOJIS = ['🥱', '😣', '😐', '😊', '⚡'];
const SLEEP_EMOJIS = ['😴', '🛌', '😪', '😫'];

interface Props {
  questions: Question[];
  onSubmit: (answers: { question: string; answer: string }[], onResult: (r: NutritionResult) => void) => void;
  onClose: () => void;
}

export default function NutritionQuiz({ questions, onSubmit, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [fruits, setFruits] = useState(1);
  const [veggies, setVeggies] = useState(1);
  const [water, setWater] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const grouped = STEPS.map(s => ({
    ...s,
    questions: s.key === 'SCALE'
      ? questions.filter(q => q.questionType === 'SCALE')
      : questions.filter(q => q.questionType === s.key),
  }));

  const current = grouped[step];
  const isLast = step === STEPS.length - 1;

  const setAnswer = (qId: string, val: string) => setAnswers(p => ({ ...p, [qId]: val }));
  const toggleMulti = (qId: string, val: string) => {
    const curr = (answers[qId] || '').split(',').filter(Boolean);
    const next = curr.includes(val) ? curr.filter(v => v !== val) : [...curr, val];
    setAnswer(qId, next.join(','));
  };

  const canNext = current.questions.every(q => answers[q.id]);

  const handleSubmit = () => {
    setSubmitting(true);
    const formatted = questions.filter(q => q.questionType !== 'INACTIVE').map(q => ({
      question: q.question,
      answer: answers[q.id] || '',
    }));
    onSubmit(formatted, (r) => { setResult(r); setSubmitting(false); });
  };

  // ── Loading Screen ──
  if (submitting) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center font-['Poppins']" style={{ background: '#0F1A15' }}>
        <div className="text-6xl mb-6">🥑</div>
        <div className="w-10 h-10 border-3 border-white/20 border-t-[#2D9F83] rounded-full animate-spin mb-4" />
        <p className="text-white text-lg font-semibold">Analyzing your nutrition...</p>
        <p className="text-white/50 text-sm mt-2">This takes a few seconds</p>
      </div>
    );
  }

  // ── Results Screen ──
  if (result) {
    const scoreLabel = result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Good' : result.score >= 40 ? 'Fair' : result.score >= 20 ? 'Needs Work' : 'Poor';
    const pct = result.maxScore > 0 ? result.score / result.maxScore : 0;
    const r = 55; const circ = 2 * Math.PI * r;
    // Semi-circle gauge (matching app's 270° arc)
    const gaugeTotal = circ * 0.75; // 270 degrees
    const gaugeOffset = gaugeTotal * (1 - Math.min(pct, 1));

    return (
      <div className="fixed inset-0 z-[60] overflow-y-auto font-['Poppins']" style={{ background: BG }}>
        <div className="max-w-lg mx-auto px-4 py-8 pb-24">
          {/* Header card with score */}
          <div className="rounded-[24px] p-6 sm:p-8 mb-5 flex flex-col items-center" style={{ background: 'linear-gradient(135deg, #2D9F83, #1B7A5A)' }}>
            <h1 className="text-2xl font-bold text-white mb-1">🥗 Nutrition Results</h1>
            <p className="text-sm text-white/70 mb-5">Here's your nutritional health snapshot</p>
            <svg width="170" height="170" className="mb-3">
              <circle cx="85" cy="85" r={r} stroke="rgba(255,255,255,0.25)" strokeWidth="12" fill="none"
                strokeLinecap="round" strokeDasharray={gaugeTotal} strokeDashoffset={0}
                transform="rotate(135 85 85)" />
              <circle cx="85" cy="85" r={r} stroke="white" strokeWidth="12" fill="none"
                strokeLinecap="round" strokeDasharray={gaugeTotal} strokeDashoffset={gaugeOffset}
                transform="rotate(135 85 85)" className="transition-all duration-1000" />
              <text x="50%" y="50%" textAnchor="middle" dy=".35em" fontSize="42" fill="white" fontWeight="bold">{Math.round(pct * 100)}</text>
            </svg>
            <span className="px-4 py-1.5 rounded-full text-white text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.2)' }}>{scoreLabel}</span>
            {result.assessment && (
              <p className="text-white/90 text-sm text-center mt-3 font-medium">{result.assessment}</p>
            )}
          </div>

          {/* Category Breakdown */}
          {result.categories.length > 0 && (
            <div className="rounded-[20px] p-5 mb-4" style={{ background: CARD }}>
              <h3 className="font-bold text-white mb-4">📊 Category Breakdown</h3>
              <div className="space-y-4">
                {result.categories.map(cat => (
                  <div key={cat.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-white font-medium">{cat.emoji} {cat.name}</span>
                      <span className="text-sm font-semibold" style={{ color: ACCENT }}>{cat.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: CARD_LIGHT }}>
                      <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${cat.pct}%`, background: ACCENT }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="rounded-[20px] p-5 mb-6" style={{ background: CARD }}>
              <h3 className="font-bold text-white mb-3">💡 Recommendations</h3>
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div className="w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: CARD_LIGHT }}>
                    <span className="text-xs font-bold" style={{ color: ACCENT }}>→</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => onClose()} className="w-full py-4 rounded-2xl text-white font-semibold text-[17px]" style={{ background: 'linear-gradient(135deg, #2D9F83, #1B7A5A)' }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto font-['Poppins']" style={{ background: BG }}>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {/* Close button */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <span className="text-xs text-gray-500 px-3 py-1 rounded-full" style={{ background: CARD }}>{step + 1} / {STEPS.length}</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'text-white' : i === step ? 'text-white' : 'text-gray-500'}`}
                style={{ background: i < step ? ACCENT : i === step ? CARD_LIGHT : CARD, border: i === step ? `2px solid ${ACCENT}` : '2px solid transparent' }}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className="w-6 sm:w-10 h-0.5" style={{ background: i < step ? ACCENT : CARD }} />}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-6" style={{ background: CARD }}>
          <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: `linear-gradient(90deg, ${ACCENT}, #1A7A63)` }} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-1 text-white">{current.emoji} {current.title}</h2>
        <p className="text-sm text-gray-400 text-center mb-8">{current.subtitle}</p>

        {/* Step content */}
        <div className="space-y-4">
          {/* Step 1: You */}
          {step === 0 && current.questions.map(q => (
            <div key={q.id} className="rounded-2xl p-4" style={{ background: CARD }}>
              <p className="font-medium mb-3 text-white text-sm">{q.question}</p>
              {q.question.toLowerCase().includes('old') ? (
                <div>
                  <div className="flex items-center gap-3">
                    <input type="range" min={8} max={25} value={answers[q.id] || '14'} onChange={e => setAnswer(q.id, e.target.value)}
                      className="flex-1 h-2 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, ${ACCENT} ${((+(answers[q.id] || 14) - 8) / 17) * 100}%, ${CARD_LIGHT} ${((+(answers[q.id] || 14) - 8) / 17) * 100}%)`, accentColor: ACCENT }} />
                    <span className="text-2xl font-bold w-10 text-right" style={{ color: ACCENT }}>{answers[q.id] || 14}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {q.scaleOptions.map(opt => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className="py-4 rounded-xl text-center transition-all"
                      style={{ background: answers[q.id] === opt ? ACCENT : CARD_LIGHT, color: 'white', border: answers[q.id] === opt ? `2px solid ${ACCENT}` : '2px solid transparent' }}>
                      <div className="text-2xl mb-1">{opt === 'Male' ? '🧑' : opt === 'Female' ? '👩' : '🧑‍🤝‍🧑'}</div>
                      <div className="text-sm">{opt}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Step 2: Protein */}
          {step === 1 && current.questions.map(q => (
            <div key={q.id} className="rounded-2xl p-4" style={{ background: CARD }}>
              <p className="font-medium mb-3 text-white text-sm">{q.question}</p>
              {q.question.includes('servings') ? (
                <div className="flex gap-2">
                  {q.scaleOptions.map(opt => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className="w-12 h-12 rounded-full text-lg font-bold transition-all"
                      style={{ background: answers[q.id] === opt ? ACCENT : CARD_LIGHT, color: 'white' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {q.scaleOptions.map(opt => {
                    const selected = (answers[q.id] || '').split(',').includes(opt);
                    return (
                      <button key={opt} onClick={() => toggleMulti(q.id, opt)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                        style={{ background: selected ? ACCENT : CARD_LIGHT, color: 'white', border: selected ? `2px solid ${ACCENT}` : '2px solid transparent' }}>
                        <span className="text-lg">{PROTEIN_EMOJIS[opt] || '🍖'}</span>
                        <span className="text-sm">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Step 3: Fruits & Veggies */}
          {step === 2 && current.questions.map(q => (
            <div key={q.id} className="grid grid-cols-2 gap-3">
              {[{ label: 'Fruits', emoji: '🍎', val: fruits, set: setFruits }, { label: 'Vegetables', emoji: '🥦', val: veggies, set: setVeggies }].map(item => (
                <div key={item.label} className="rounded-2xl p-4" style={{ background: CARD }}>
                  <div className="flex items-center gap-2 mb-1"><span className="text-lg">{item.emoji}</span><span className="font-bold text-white text-sm">{item.label}</span></div>
                  <p className="text-[10px] text-gray-500 mb-3">Servings/day (1 ≈ 1 cup)</p>
                  <div className="flex items-center justify-between">
                    <button onClick={() => { item.set(Math.max(0, item.val - 1)); setAnswer(q.id, `${item.label === 'Fruits' ? Math.max(0, item.val - 1) : fruits},${item.label === 'Vegetables' ? Math.max(0, item.val - 1) : veggies}`); }}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-lg text-white" style={{ background: CARD_LIGHT }}>−</button>
                    <span className="text-3xl font-bold" style={{ color: ACCENT }}>{item.val}</span>
                    <button onClick={() => { item.set(item.val + 1); setAnswer(q.id, `${item.label === 'Fruits' ? item.val + 1 : fruits},${item.label === 'Vegetables' ? item.val + 1 : veggies}`); }}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-lg text-white" style={{ background: ACCENT }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Step 4: Meals */}
          {step === 3 && current.questions.map((q, qi) => (
            <div key={q.id} className="rounded-2xl p-4" style={{ background: CARD }}>
              <div className="flex items-center gap-2 mb-3"><span className="text-lg">{MEAL_EMOJIS[qi]}</span><span className="font-bold text-white text-sm">{MEAL_LABELS[qi]}</span></div>
              <div className="flex flex-wrap gap-2">
                {q.scaleOptions.map((opt, oi) => (
                  <button key={opt} onClick={() => setAnswer(q.id, opt)}
                    className="px-3 py-1.5 rounded-full text-sm transition-all"
                    style={{ background: answers[q.id] === opt ? ACCENT : CARD_LIGHT, color: answers[q.id] === opt ? 'white' : '#9CA3AF' }}>
                    {MEAL_FREQ_EMOJIS[oi]} {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Step 5: Habits */}
          {step === 4 && current.questions.map(q => (
            <div key={q.id} className="rounded-2xl p-4" style={{ background: CARD }}>
              <p className="font-medium mb-3 text-white text-sm">{q.question}</p>
              {q.question.includes('eat out') ? (
                <div className="space-y-2">
                  {q.scaleOptions.map((opt, i) => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                      style={{ background: answers[q.id] === opt ? ACCENT : CARD_LIGHT, color: 'white' }}>
                      <span className="text-lg">{EATING_OUT_EMOJIS[i]}</span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {q.scaleOptions.map((opt, i) => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className="flex flex-col items-center py-4 rounded-xl transition-all"
                      style={{ background: answers[q.id] === opt ? ACCENT : CARD_LIGHT, color: 'white' }}>
                      <span className="text-2xl mb-1">{SNACK_EMOJIS[i]}</span>
                      <span className="text-xs text-center px-2">{opt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Step 6: Energy */}
          {step === 5 && current.questions.map(q => (
            <div key={q.id} className="rounded-2xl p-4" style={{ background: CARD }}>
              <p className="font-medium mb-3 text-white text-sm">
                {q.question.includes('water') ? '💧 ' : q.question.includes('energy') ? '⚡ ' : '🌙 '}{q.question}
              </p>
              {q.question.includes('water') ? (
                <div>
                  <p className="text-[10px] text-gray-500 mb-3">How many glasses (~250ml) per day?</p>
                  <div className="flex flex-wrap gap-2">
                    {q.scaleOptions.map(opt => (
                      <button key={opt} onClick={() => { setWater(+opt); setAnswer(q.id, opt); }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all"
                        style={{ background: +opt <= water && water > 0 ? `${ACCENT}33` : CARD_LIGHT }}>
                        💧
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{water} glasses</p>
                </div>
              ) : q.question.includes('energy') ? (
                <div className="flex gap-2">
                  {q.scaleOptions.map((opt, i) => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className="flex-1 flex flex-col items-center py-3 rounded-xl transition-all"
                      style={{ background: answers[q.id] === opt ? ACCENT : CARD_LIGHT, color: 'white' }}>
                      <span className="text-2xl">{ENERGY_EMOJIS[i]}</span>
                      <span className="text-[10px] mt-1">{opt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {q.scaleOptions.map((opt, i) => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className="flex flex-col items-center py-4 rounded-xl transition-all"
                      style={{ background: answers[q.id] === opt ? ACCENT : CARD_LIGHT, color: 'white' }}>
                      <span className="text-2xl mb-1">{SLEEP_EMOJIS[i]}</span>
                      <span className="text-xs text-center">{opt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-sm text-gray-400"
            style={{ background: CARD }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={() => isLast ? handleSubmit() : setStep(step + 1)}
            disabled={!canNext && step !== 2}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #1A7A63)` }}>
            {isLast ? 'See Results' : 'Next'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
