export interface DayGreeting {
  dayName: string;
  badge: string;
  headline: string;
  subtext: string;
  iconType: 'sparkles' | 'coffee' | 'sun' | 'party' | 'rocket' | 'heart' | 'smile';
}

export const DAILY_GREETINGS: Record<number, DayGreeting> = {
  // 0: Söndag
  0: {
    dayName: 'Söndag',
    badge: 'Skön söndag',
    headline: 'Njut av söndagen och ladda batterierna! 🌿',
    subtext: 'Ta det lugnt och samla ny energi inför den kommande veckan.',
    iconType: 'heart',
  },
  // 1: Måndag
  1: {
    dayName: 'Måndag',
    badge: 'Måndagspepp',
    headline: 'Ny vecka, ny energi – nu kör vi igång! 🚀',
    subtext: 'Tillsammans sätter vi en fantastisk ton för hela veckan.',
    iconType: 'rocket',
  },
  // 2: Tisdag
  2: {
    dayName: 'Tisdag',
    badge: 'Fartfylld tisdag',
    headline: 'Härlig tisdag – full fart framåt i teamet! ⚡',
    subtext: 'Tempot är igång och vi gör värdefull skillnad varje dag.',
    iconType: 'sun',
  },
  // 3: Onsdag
  3: {
    dayName: 'Onsdag',
    badge: 'Lillördag',
    headline: 'Glad onsdag – halvvägs mot helgen med fin energi! 🐪✨',
    subtext: 'Fira lillördag med en extra god kaffekopp och ett leende till kollegan.',
    iconType: 'coffee',
  },
  // 4: Torsdag
  4: {
    dayName: 'Torsdag',
    badge: 'Snart helg',
    headline: 'Trevlig torsdag – fredagen är bara ett stenkast bort! 🌟',
    subtext: 'Håll i den goda energin, vi närmar oss helgen med stormsteg.',
    iconType: 'sparkles',
  },
  // 5: Fredag
  5: {
    dayName: 'Fredag',
    badge: 'Fredagskänsla',
    headline: 'Yay fredaaaag, snart är helg! 🎉🥳',
    subtext: 'Sprid fredagsglädje, fira veckans framgångar och ha en underbar dag!',
    iconType: 'party',
  },
  // 6: Lördag
  6: {
    dayName: 'Lördag',
    badge: 'Trevlig helg',
    headline: 'Härlig lördag – njut av en välförtjänt ledighet! 🛋️✨',
    subtext: 'Slappna av, umgås och gör precis det du mår bäst av idag.',
    iconType: 'smile',
  },
};

export function getTodayGreeting(date: Date = new Date()): DayGreeting {
  const dayOfWeek = date.getDay(); // 0 - 6
  return DAILY_GREETINGS[dayOfWeek] || DAILY_GREETINGS[1];
}
