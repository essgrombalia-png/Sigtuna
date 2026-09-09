export interface MorningQuote {
  id: string;
  quote: string;
  author?: string;
}

export const MORNING_QUOTES: MorningQuote[] = [
  {
    id: 'q1',
    quote: 'Varje morgon ger oss nya möjligheter att göra skillnad och lyfta varandra.',
    author: 'Dagens morgonpepp'
  },
  {
    id: 'q2',
    quote: 'Ett gott samarbete börjar med ett varmt god morgon och en vilja att hjälpas åt.',
    author: 'Laganda & gemenskap'
  },
  {
    id: 'q3',
    quote: 'Energi är smittsamt – välj att sprida värme, omtanke och mod idag.',
    author: 'Positiv energi'
  },
  {
    id: 'q4',
    quote: 'Det är de små omtänksamma stegen vi tar varje dag som skapar de största framgångarna.',
    author: 'Mål & framåtanda'
  },
  {
    id: 'q5',
    quote: 'Ingen kan göra allt, men tillsammans gör vi fantastiska saker.',
    author: 'Starka tillsammans'
  },
  {
    id: 'q6',
    quote: 'Starta dagen med tacksamhet, fortsätt med fokus och avsluta med stolthet.',
    author: 'Dagens fokus'
  },
  {
    id: 'q7',
    quote: 'Ditt leende och din närvaro sätter tonen för hela arbetsplatsen idag!',
    author: 'Glädjespridare'
  },
  {
    id: 'q8',
    quote: 'Ett uppmuntrande ord till en kollega kan vara just det som lyfter hela dagen.',
    author: 'Omtanke i vardagen'
  },
  {
    id: 'q9',
    quote: 'Ha mod att tänka nytt och lita på din kompetens – du gör ett viktigt arbete!',
    author: 'Stolthet & utveckling'
  },
  {
    id: 'q10',
    quote: 'Bästa teamet skapas inte av slump, utan av laganda och gemensam glädje.',
    author: 'Teamkänsla'
  }
];
