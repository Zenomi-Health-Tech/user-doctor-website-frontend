import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface Question { id: string; question: string; questionType: string; scaleOptions: string[]; }
interface NutritionResult {
  score: number; maxScore: number; label: string;
  categories: { name: string; emoji: string; pct: number }[];
  recommendations: string[];
}

const STEPS = [
  { key: 'SCALE', label: 'You', emoji: '👋', title: "Let's get to know you!", subtitle: 'Tell us a bit about yourself' },
  { key: 'NUTRITION_STEP_2_PROTEIN', label: 'Protein', emoji: '💪', title: 'Protein Power', subtitle: 'How much protein do you get daily?' },
  { key: 'NUTRITION_STEP_3_FRUITS_VEGGIES', label: 'Fruits', emoji: '🥗', title: 'Fruits & Veggies', subtitle: 'How colorful is your plate?' },
  { key: 'NUTRITION_STEP_4_MEALS', label: 'Meals', emoji: '🍽️', title: 'Meal Habits', subtitle: 'How regular are your meals?' },
  { key: 'NUTRITION_STEP_5_HABITS', label: 'Habits', emoji: '🏠', title: 'Eating Style', subtitle: 'Home-cooked or eating out?' },
  { key: 'NUTRITION_STEP_6_ENERGY', label: 'Energy', emoji: '💧', title: 'Hydration & Energy', subtitle: 'Water and energy go hand in hand' },
];

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

  // Group questions by step
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
    const formatted = questions.filter(q => q.questionType !== 'INACTIVE').map(q => ({
      question: q.question,
      answer: answers[q.id] || '',
    }));
    onSubmit(formatted, (r) => setResult(r));
  };

  // ── Results Screen ──
  if (result) {
    const scoreLabel = result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Good' : result.score >= 40 ? 'Fair' : 'Needs Work';
    const scoreColor = result.score >= 60 ? '#2D9F83' : result.score >= 40 ? '#F59E0B' : '#EF4444';
    const pct = result.score / (result.maxScore || 100);
    const r = 70; const circ = 2 * Math.PI * r;

    return (
      <div className="fixed inset-0 z-[60] bg-white overflow-y-auto font-['Poppins']">
        <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
          <h1 className="text-2xl font-bold text-center mb-1">Your Results ⚡</h1>
          <p className="text-sm text-gray-500 text-center mb-8">Here's your nutritional health snapshot</p>

          {/* Score circle */}
          <div className="flex justify-center mb-8">
            <svg width="180" height="180">
              <circle cx="90" cy="90" r={r} stroke="#e5e7eb" strokeWidth="12" fill="none" />
              <circle cx="90" cy="90" r={r} stroke={scoreColor} strokeWidth="12" fill="none"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
                transform="rotate(-90 90 90)" className="transition-all duration-1000" />
              <text x="90" y="85" textAnchor="middle" fontSize="36" fontWeight="bold" fill="black">{result.score}</text>
              <text x="90" y="108" textAnchor="middle" fontSize="14" fill={scoreColor}>{scoreLabel}</text>
            </svg>
          </div>

          {/* Category Breakdown */}
          <div className="border border-gray-200 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-lg mb-4">Category Breakdown</h3>
            <div className="space-y-4">
              {result.categories.map(cat => (
                <div key={cat.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{cat.emoji} {cat.name}</span>
                    <span className="text-sm font-bold" style={{ color: '#2D9F83' }}>{cat.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${cat.pct}%`, background: '#2D9F83' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="border border-gray-200 rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-lg mb-3">💡 Recommendations</h3>
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="text-[#2D9F83] mt-0.5">→</span>
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          )}

          <button onClick={onClose} className="w-full py-3.5 rounded-xl text-white font-semibold" style={{ background: '#2D9F83' }}>
            🔄 Take Assessment Again
          </button>
        </div>
      </div>
    );
  }

  // Special state for fruits/veggies counters
  const [fruits, setFruits] = useState(1);
  const [veggies, setVeggies] = useState(1);
  // Water glasses
  const [water, setWater] = useState(0);

  return (
    <div className="fixed inset-0 z-[60] bg-white overflow-y-auto font-['Poppins']">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-6">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${i < step ? 'bg-[#2D9F83] border-[#2D9F83] text-white' : i === step ? 'border-[#2D9F83] text-[#2D9F83] bg-white' : 'border-gray-300 text-gray-400'}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-8 sm:w-12 h-0.5 ${i < step ? 'bg-[#2D9F83]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between px-1 mb-6 text-[10px] text-gray-500">
          {STEPS.map(s => <span key={s.key} className="w-9 text-center">{s.label}</span>)}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-1">{current.title} {current.emoji}</h2>
        <p className="text-sm text-gray-500 text-center mb-8">{current.subtitle}</p>

        {/* Step content */}
        <div className="space-y-6">
          {/* Step 1: You */}
          {step === 0 && current.questions.map(q => (
            <div key={q.id}>
              <p className="font-medium mb-3">{q.question}</p>
              {q.question.toLowerCase().includes('old') ? (
                <div>
                  <div className="flex items-center gap-3">
                    <input type="range" min={8} max={25} value={answers[q.id] || '14'} onChange={e => setAnswer(q.id, e.target.value)}
                      className="flex-1 h-2 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #2D9F83 ${((+(answers[q.id] || 14) - 8) / 17) * 100}%, #e5e7eb ${((+(answers[q.id] || 14) - 8) / 17) * 100}%)`, accentColor: '#2D9F83' }} />
                    <span className="text-2xl font-bold text-[#2D9F83] w-10 text-right">{answers[q.id] || 14}</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {q.scaleOptions.map(opt => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className={`py-4 rounded-xl border-2 text-center transition ${answers[q.id] === opt ? 'border-[#2D9F83] bg-[#2D9F83]/10' : 'border-gray-200'}`}>
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
            <div key={q.id}>
              <p className="font-medium mb-3">{q.question}</p>
              {q.question.includes('servings') ? (
                <div className="flex gap-2">
                  {q.scaleOptions.map(opt => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className={`w-12 h-12 rounded-full border-2 text-lg font-bold transition ${answers[q.id] === opt ? 'bg-[#2D9F83] text-white border-[#2D9F83]' : 'border-gray-200'}`}>
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition ${selected ? 'border-[#2D9F83] bg-[#2D9F83]/10' : 'border-gray-200'}`}>
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
            <div key={q.id} className="grid grid-cols-2 gap-4">
              {[{ label: 'Fruits', emoji: '🍎', val: fruits, set: setFruits }, { label: 'Vegetables', emoji: '🥦', val: veggies, set: setVeggies }].map(item => (
                <div key={item.label} className="border-2 border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1"><span className="text-lg">{item.emoji}</span><span className="font-bold">{item.label}</span></div>
                  <p className="text-xs text-gray-500 mb-3">Servings per day (1 serving ≈ 1 cup)</p>
                  <div className="flex items-center justify-between">
                    <button onClick={() => { item.set(Math.max(0, item.val - 1)); setAnswer(q.id, `${item.label === 'Fruits' ? Math.max(0, item.val - 1) : fruits},${item.label === 'Vegetables' ? Math.max(0, item.val - 1) : veggies}`); }}
                      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl">−</button>
                    <span className="text-3xl font-bold text-[#2D9F83]">{item.val}</span>
                    <button onClick={() => { item.set(item.val + 1); setAnswer(q.id, `${item.label === 'Fruits' ? item.val + 1 : fruits},${item.label === 'Vegetables' ? item.val + 1 : veggies}`); }}
                      className="w-10 h-10 rounded-full bg-[#2D9F83] text-white flex items-center justify-center text-xl">+</button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Step 4: Meals */}
          {step === 3 && current.questions.map((q, qi) => (
            <div key={q.id} className="border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3"><span className="text-lg">{MEAL_EMOJIS[qi]}</span><span className="font-bold">{MEAL_LABELS[qi]}</span></div>
              <div className="flex flex-wrap gap-2">
                {q.scaleOptions.map((opt, oi) => (
                  <button key={opt} onClick={() => setAnswer(q.id, opt)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${answers[q.id] === opt ? 'bg-[#2D9F83]/10 border-[#2D9F83]' : 'border-gray-200'}`}>
                    {MEAL_FREQ_EMOJIS[oi]} {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Step 5: Habits */}
          {step === 4 && current.questions.map(q => (
            <div key={q.id}>
              <p className="font-medium mb-3">{q.question}</p>
              {q.question.includes('eat out') ? (
                <div className="space-y-2">
                  {q.scaleOptions.map((opt, i) => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition ${answers[q.id] === opt ? 'border-[#2D9F83] bg-[#2D9F83]/10' : 'border-gray-200'}`}>
                      <span className="text-lg">{EATING_OUT_EMOJIS[i]}</span>
                      <span className="text-sm">{opt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {q.scaleOptions.map((opt, i) => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className={`flex flex-col items-center py-4 rounded-xl border-2 transition ${answers[q.id] === opt ? 'border-[#2D9F83] bg-[#2D9F83]/10' : 'border-gray-200'}`}>
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
            <div key={q.id} className="border-2 border-gray-200 rounded-xl p-4">
              <p className="font-medium mb-3">
                {q.question.includes('water') ? '💧 ' : q.question.includes('energy') ? '⚡ ' : '🌙 '}{q.question}
              </p>
              {q.question.includes('water') ? (
                <div>
                  <p className="text-xs text-gray-500 mb-3">How many glasses (~250ml) per day?</p>
                  <div className="flex flex-wrap gap-2">
                    {q.scaleOptions.map(opt => (
                      <button key={opt} onClick={() => { setWater(+opt); setAnswer(q.id, opt); }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition ${+opt <= water && water > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        💧
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{water} glasses</p>
                </div>
              ) : q.question.includes('energy') ? (
                <div className="flex gap-2">
                  {q.scaleOptions.map((opt, i) => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className={`flex-1 flex flex-col items-center py-3 rounded-xl border-2 transition ${answers[q.id] === opt ? 'border-[#2D9F83] bg-blue-50' : 'border-gray-200'}`}>
                      <span className="text-2xl">{ENERGY_EMOJIS[i]}</span>
                      <span className="text-[10px] mt-1">{opt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {q.scaleOptions.map((opt, i) => (
                    <button key={opt} onClick={() => setAnswer(q.id, opt)}
                      className={`flex flex-col items-center py-4 rounded-xl border-2 transition ${answers[q.id] === opt ? 'border-[#2D9F83] bg-blue-50' : 'border-gray-200'}`}>
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
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-sm text-gray-400">{step + 1} / {STEPS.length}</span>
          <button onClick={() => isLast ? handleSubmit() : setStep(step + 1)}
            disabled={!canNext && step !== 2}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: '#2D9F83' }}>
            {isLast ? 'See Results' : 'Next'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
