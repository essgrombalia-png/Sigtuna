export interface MorningQuote {
  id: string;
  quote: string;
  author?: string;
  category?: string;
}

export const MORNING_QUOTES: MorningQuote[] = [
  {
    id: 'q1',
    quote: 'Varje morgon ger oss nya möjligheter att göra skillnad och lyfta varandra.',
    author: 'Dagens morgonpepp',
    category: 'Möjligheter'
  },
  {
    id: 'q2',
    quote: 'Ett gott samarbete börjar med ett varmt god morgon och en vilja att hjälpas åt.',
    author: 'Laganda & gemenskap',
    category: 'Samarbete'
  },
  {
    id: 'q3',
    quote: 'Energi är smittsamt – välj att sprida värme, omtanke och mod idag.',
    author: 'Positiv energi',
    category: 'Glädje'
  },
  {
    id: 'q4',
    quote: 'Det är de små omtänksamma stegen vi tar varje dag som skapar de största framgångarna.',
    author: 'Mål & framåtanda',
    category: 'Utveckling'
  },
  {
    id: 'q5',
    quote: 'Ingen kan göra allt, men tillsammans i teamet gör vi fantastiska saker.',
    author: 'Starka tillsammans',
    category: 'Teamkänsla'
  },
  {
    id: 'q6',
    quote: 'Starta dagen med tacksamhet, fortsätt med fokus och avsluta med stolthet.',
    author: 'Dagens fokus',
    category: 'Mindset'
  },
  {
    id: 'q7',
    quote: 'Ditt leende och din närvaro sätter tonen för hela arbetsplatsen idag!',
    author: 'Glädjespridare',
    category: 'Närvaro'
  },
  {
    id: 'q8',
    quote: 'Ett uppmuntrande ord till en kollega kan vara just det som lyfter hela dagen.',
    author: 'Omtanke i vardagen',
    category: 'Omtanke'
  },
  {
    id: 'q9',
    quote: 'Ha mod att tänka nytt och lita på din kompetens – du gör ett viktigt och meningsfullt arbete!',
    author: 'Stolthet & utveckling',
    category: 'Yrkesstolthet'
  },
  {
    id: 'q10',
    quote: 'Bästa teamet skapas inte av slump, utan av laganda, lyhördhet och gemensam glädje.',
    author: 'Teamkänsla',
    category: 'Gemenskap'
  },
  {
    id: 'q11',
    quote: 'När vi lyssnar med nyfikenhet och bemöter varandra med respekt öppnas dörrar för nya idéer.',
    author: 'Dialog & samverkan',
    category: 'Inkludering'
  },
  {
    id: 'q12',
    quote: 'Att ge någon beröm för sitt arbete kostar ingenting men är värt otroligt mycket.',
    author: 'Uppskattning',
    category: 'Feedback'
  },
  {
    id: 'q13',
    quote: 'Ta en djup inandning, känn morgonens lugn och ladda med ny positiv kraft inför dagen.',
    author: 'Återhämtning & balans',
    category: 'Balans'
  },
  {
    id: 'q14',
    quote: 'Goda idéer växer när vi delar dem med varandra – våga fråga, våga bidra!',
    author: 'Kreativitet',
    category: 'Innovation'
  }
];

export function getDailyQuote(dayOffset = 0): MorningQuote {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + dayOffset;
  const index = Math.abs(dayOfYear) % MORNING_QUOTES.length;
  return MORNING_QUOTES[index];
}
