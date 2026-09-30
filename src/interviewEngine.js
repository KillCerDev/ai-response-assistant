const rules = [
  {
    match: ['tell me about yourself', 'introduce yourself', 'about yourself'],
    translation: 'Háblame de ti.',
    answer:
      "My name is Angel Martinez. I'm a Systems Engineering student and I'm building my experience in software development and QA. I have worked with Python, JavaScript, React, SQL and testing tools like Playwright, and I'm looking for an opportunity where I can learn and grow with a team.",
    tip: 'Habla 30–45 segundos: presente, habilidades y objetivo.'
  },
  {
    match: ['why are you interested', 'why do you want', 'why this position', 'why this role'],
    translation: '¿Por qué te interesa este puesto?',
    answer:
      "I'm interested in this position because it matches what I'm learning and the direction I want for my career. I already have experience with personal projects and testing, and I want to keep learning in a real team environment.",
    tip: 'Conecta el puesto con lo que ya sabes y con lo que quieres aprender.'
  },
  {
    match: ['why should we hire you', 'why should we choose you'],
    translation: '¿Por qué deberíamos contratarte?',
    answer:
      "I think I can bring a good learning attitude, attention to detail and technical foundations. I may still be early in my career, but I learn fast, I like investigating problems and I'm comfortable asking questions when I need context.",
    tip: 'No exageres experiencia. Enfatiza aprendizaje, detalle y fundamentos.'
  },
  {
    match: ['strength', 'strong point'],
    translation: '¿Cuál es tu principal fortaleza?',
    answer:
      "One of my strengths is that I like understanding why something fails instead of only fixing the visible problem. I usually test different cases, read the code and try to reproduce the issue before making a conclusion.",
    tip: 'Da una fortaleza y un ejemplo corto.'
  },
  {
    match: ['weakness', 'weak point'],
    translation: '¿Cuál es una de tus debilidades?',
    answer:
      "Sometimes I spend too much time trying to solve a problem by myself. I'm improving that by setting a limit, documenting what I already tried and asking for help with better context when I'm blocked.",
    tip: 'Menciona algo real y explica cómo lo estás mejorando.'
  },
  {
    match: ['bug', 'defect', 'testing'],
    translation: 'Pregunta relacionada con pruebas o detección de errores.',
    answer:
      "In my projects I start by reproducing the problem and checking the exact steps that cause it. Then I compare the expected and actual result, test nearby cases and document enough information so the issue can be understood and verified after the fix.",
    tip: 'Piensa: reproducir → aislar → documentar → verificar.'
  },
  {
    match: ['salary', 'compensation', 'expected salary'],
    translation: '¿Cuál es tu expectativa salarial?',
    answer:
      "I'm open to discussing compensation based on the responsibilities of the role and the complete offer. My main priority right now is finding a position where I can contribute, learn and grow professionally.",
    tip: 'Si te exigen una cifra, investiga primero el rango del puesto.'
  }
]

export function analyzeInterviewQuestion(rawText) {
  const text = rawText.trim()
  const lower = text.toLowerCase()
  const found = rules.find(rule => rule.match.some(fragment => lower.includes(fragment)))

  if (found) return found

  return {
    translation: 'No tengo una traducción local exacta para esta pregunta.',
    answer:
      "I would take a moment to understand the question and answer with a clear example from my studies or personal projects. I would focus on what I did, why I did it and what I learned from the result.",
    tip: 'Modo demo: conecta una API de IA para traducción y respuestas libres.'
  }
}
