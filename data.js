/* =========================================================
   Dummy library for the Google Photos retrieval MVP.
   All photos are AI-generated, fictional people.
   ========================================================= */

// Fixed "today" so relative dates ("last year") stay deterministic in the demo
const DEMO_NOW = new Date('2026-10-07T10:00:00');

const IMG = (f) => `assets/photos/${f}.jpg`;

const PEOPLE = [
  { id: 'aarav',  name: 'Aarav Mehta',  short: 'Aarav',  face: IMG('aarav'),  aliases: ['aarav', 'me', 'myself'] },
  { id: 'ananya', name: 'Ananya Mehta', short: 'Ananya', face: IMG('ananya'), aliases: ['ananya', 'sister', 'didi', 'sis', 'bride'] },
  { id: 'rohan',  name: 'Rohan Kapoor', short: 'Rohan',  face: IMG('rohan'),  aliases: ['rohan'] },
  { id: 'priya',  name: 'Priya Sharma', short: 'Priya',  face: IMG('priya'),  aliases: ['priya'] },
  { id: 'mom',    name: 'Mom',          short: 'Mom',    face: IMG('mom'),    aliases: ['mom', 'mother', 'maa', 'mummy', 'mum', 'mumma'] },
  { id: 'dad',    name: 'Dad',          short: 'Dad',    face: IMG('dad'),    aliases: ['dad', 'father', 'papa', 'daddy'] },
];

const EVENTS = {
  wedding:     { label: 'Wedding',     icon: 'favorite',      aliases: ['wedding', 'shaadi', 'shadi', 'marriage', 'sangeet', 'reception', 'mandap'] },
  birthday:    { label: 'Birthday',    icon: 'cake',          aliases: ['birthday', 'bday', 'b day', 'party', 'cake cutting'] },
  diwali:      { label: 'Diwali',      icon: 'local_fire_department', aliases: ['diwali', 'deepavali', 'festival', 'diya', 'diyas'] },
  goa_trip:    { label: 'Goa trip',    icon: 'beach_access',  aliases: ['trip', 'vacation', 'holiday', 'goa trip'] },
  trek:        { label: 'Trek',        icon: 'hiking',        aliases: ['trek', 'trekking', 'hike', 'hiking'] },
  convocation: { label: 'Convocation', icon: 'school',        aliases: ['convocation', 'graduation', 'graduated', 'degree'] },
};

// where = places + background visuals (both recalled by 100% of interviewees)
const WHERE_WORDS = {
  goa: ['goa'], manali: ['manali', 'himachal'], mumbai: ['mumbai', 'bombay'], indore: ['indore'],
  bengaluru: ['bengaluru', 'bangalore'], pune: ['pune'],
  beach: ['beach', 'sea', 'ocean', 'shore', 'waves'], sunset: ['sunset', 'golden hour', 'evening sky'],
  boats: ['boat', 'boats'], mountains: ['mountain', 'mountains', 'hills', 'himalaya', 'himalayas', 'peaks'],
  snow: ['snow', 'snowy'], home: ['home', 'house', 'living room'], cafe: ['cafe', 'café', 'coffee shop', 'coffee'],
  campus: ['campus', 'college', 'university'], street: ['street', 'road', 'market'], city: ['city'],
  garden: ['garden', 'park', 'flowers'], night: ['night', 'lights', 'fairy lights'], balcony: ['balcony', 'terrace'],
  marigold: ['marigold', 'genda'], rangoli: ['rangoli'], cake: ['cake', 'candles'], balloons: ['balloons', 'balloon'],
  plants: ['plants'], indoor: ['indoor', 'inside'],
};

const CLOTHING_WORDS = {
  red: ['red'], pink: ['pink'], green: ['green'], yellow: ['yellow'], mustard: ['mustard'], blue: ['blue'],
  purple: ['purple'], white: ['white'], black: ['black'], grey: ['grey', 'gray'], cream: ['cream'], floral: ['floral', 'flowery', 'printed'],
  denim: ['denim'], checked: ['checked', 'checks', 'check'],
  lehenga: ['lehenga', 'lehnga', 'ghagra', 'dress'], saree: ['saree', 'sari'], kurta: ['kurta'], sherwani: ['sherwani'],
  jacket: ['jacket', 'puffer', 'hoodie'], shirt: ['shirt'], tshirt: ['t shirt', 'tshirt', 'tee'], shorts: ['shorts'],
  gown: ['gown', 'robe'], jewellery: ['jewellery', 'jewelry', 'necklace'], glasses: ['glasses', 'specs', 'spectacles'],
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_FULL = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const SEASONS = { winter: [12, 1, 2], summer: [4, 5, 6], monsoon: [7, 8, 9], spring: [3, 4], autumn: [10, 11] };

const PHOTOS = [
  { id: 'p01', src: IMG('aarav'),          date: '2026-09-28', people: ['aarav'],                 event: null,          where: ['pune', 'home', 'indoor'],            wear: ['grey', 'tshirt', 'glasses'],             title: 'Sunday at home' },
  { id: 'p02', src: IMG('priya'),          date: '2026-08-14', people: ['priya'],                 event: null,          where: ['bengaluru', 'cafe', 'indoor'],       wear: ['white', 'shirt'],                        title: 'Coffee catch-up' },
  { id: 'p03', src: IMG('coffee'),         date: '2026-08-14', people: [],                        event: null,          where: ['bengaluru', 'cafe'],                 wear: [],                                        title: 'Cappuccino' },
  { id: 'p04', src: IMG('rohan'),          date: '2026-07-02', people: ['rohan'],                 event: null,          where: ['mumbai', 'street', 'city', 'sunset'], wear: ['denim', 'jacket'],                      title: 'Rohan in Colaba' },
  { id: 'p05', src: IMG('mumbai_street'),  date: '2026-07-02', people: [],                        event: null,          where: ['mumbai', 'street', 'city'],          wear: [],                                        title: 'Mumbai streets' },
  { id: 'p06', src: IMG('graduation'),     date: '2026-04-12', people: ['aarav'],                 event: 'convocation', where: ['indore', 'campus'],                  wear: ['black', 'gown', 'glasses'],              title: 'Convocation day' },
  { id: 'p07', src: IMG('campus'),         date: '2026-04-12', people: [],                        event: 'convocation', where: ['indore', 'campus'],                  wear: [],                                        title: 'Campus arches' },
  { id: 'p08', src: IMG('mom'),            date: '2026-03-08', people: ['mom'],                   event: null,          where: ['pune', 'home', 'indoor', 'plants'],  wear: ['green', 'saree'],                        title: "Mom, Women's Day" },
  { id: 'p09', src: IMG('dad'),            date: '2026-03-08', people: ['dad'],                   event: null,          where: ['pune', 'home', 'balcony', 'plants'], wear: ['cream', 'checked', 'shirt', 'glasses'],  title: 'Dad on the balcony' },
  { id: 'p10', src: IMG('wedding_family'), date: '2026-02-14', people: ['aarav', 'ananya', 'mom'], event: 'wedding',    where: ['indore', 'night', 'marigold'],       wear: ['cream', 'sherwani', 'red', 'lehenga', 'pink', 'saree', 'jewellery', 'glasses'], title: "Ananya's wedding" },
  { id: 'p11', src: IMG('wedding_bride'),  date: '2026-02-14', people: ['ananya'],                event: 'wedding',     where: ['indore', 'night', 'marigold'],       wear: ['red', 'lehenga', 'jewellery'],           title: 'The bride' },
  { id: 'p12', src: IMG('bride_closeup'),  date: '2026-02-14', people: ['ananya'],                event: 'wedding',     where: ['indore', 'night'],                   wear: ['red', 'lehenga', 'jewellery'],           title: 'Bridal look' },
  { id: 'p13', src: IMG('mom_wedding'),    date: '2026-02-14', people: ['mom'],                   event: 'wedding',     where: ['indore', 'night', 'marigold'],       wear: ['pink', 'saree', 'jewellery'],            title: 'Mom at the wedding' },
  { id: 'p14', src: IMG('mandap'),         date: '2026-02-14', people: [],                        event: 'wedding',     where: ['indore', 'night', 'marigold'],       wear: [],                                        title: 'Mandap' },
  { id: 'p15', src: IMG('wedding_decor'),  date: '2026-02-13', people: [],                        event: 'wedding',     where: ['indore', 'night', 'marigold'],       wear: [],                                        title: 'Sangeet decor' },
  { id: 'p16', src: IMG('goa_beach'),      date: '2025-12-27', people: ['aarav'],                 event: 'goa_trip',    where: ['goa', 'beach', 'sunset', 'boats'],   wear: ['black', 'floral', 'shirt', 'shorts', 'glasses'], title: 'At the beach' },
  { id: 'p17', src: IMG('goa_boats'),      date: '2025-12-27', people: [],                        event: 'goa_trip',    where: ['goa', 'beach', 'sunset', 'boats'],   wear: [],                                        title: 'Fishing boats, Goa' },
  { id: 'p18', src: IMG('diwali'),         date: '2025-10-20', people: ['aarav', 'mom', 'dad'],   event: 'diwali',      where: ['pune', 'home', 'night', 'rangoli'],  wear: ['mustard', 'kurta', 'purple', 'saree', 'white', 'glasses'], title: 'Diwali at home' },
  { id: 'p19', src: IMG('rangoli'),        date: '2025-10-20', people: [],                        event: 'diwali',      where: ['pune', 'home', 'rangoli', 'night'],  wear: [],                                        title: 'Rangoli & diyas' },
  { id: 'p20', src: IMG('aarav_diwali'),   date: '2025-10-20', people: ['aarav'],                 event: 'diwali',      where: ['pune', 'home', 'night'],             wear: ['mustard', 'kurta'],                      title: 'Lighting diyas' },
  { id: 'p21', src: IMG('birthday'),       date: '2025-08-09', people: ['priya', 'aarav'],        event: 'birthday',    where: ['bengaluru', 'home', 'night', 'cake', 'balloons', 'indoor'], wear: ['blue', 'kurta', 'grey', 'tshirt', 'glasses'], title: "Priya's birthday" },
  { id: 'p22', src: IMG('cake'),           date: '2025-08-09', people: [],                        event: 'birthday',    where: ['bengaluru', 'cake', 'indoor'],       wear: [],                                        title: 'Chocolate cake' },
  { id: 'p23', src: IMG('ananya'),         date: '2025-03-16', people: ['ananya'],                event: null,          where: ['pune', 'garden'],                    wear: ['mustard', 'kurta'],                      title: 'Ananya in the garden' },
  { id: 'p24', src: IMG('trek'),           date: '2024-05-18', people: ['aarav', 'rohan'],        event: 'trek',        where: ['manali', 'mountains', 'snow'],       wear: ['yellow', 'jacket', 'green', 'glasses'],  title: 'Manali trek' },
  { id: 'p25', src: IMG('himalaya'),       date: '2024-05-18', people: [],                        event: 'trek',        where: ['manali', 'mountains', 'snow'],       wear: [],                                        title: 'Himalayan peaks' },
];

const PLACE_LABEL = { goa: 'Goa', manali: 'Manali', mumbai: 'Mumbai', indore: 'Indore', bengaluru: 'Bengaluru', pune: 'Pune' };

// Coach-mark tips — rotate on every app open
const OPEN_TIPS = [
  { title: 'Find any photo in seconds', body: 'Describe <b>who</b>, <b>what</b>, <b>when</b> & <b>where</b> — just like you remember it.', ex: "Ananya's wedding Feb 2026" },
  { title: 'Remember the occasion?', body: 'Occasion + a rough date is the fastest way to a photo.', ex: 'Diwali 2025 with Mom' },
  { title: 'Faces + places work great', body: 'Combine the people you were with and where you were.', ex: 'Me and Rohan in the mountains' },
  { title: 'A rough date is enough', body: '“Last winter” or “2024” narrows thousands of photos instantly.', ex: 'Goa beach last winter' },
  { title: "Search inside someone's photos", body: 'New: open People → tap a face → search within their photos.', ex: "Priya's birthday cake" },
];

const HOME_EXAMPLES = [
  "Ananya's wedding, Feb 2026",
  'Me and Rohan in the mountains',
  'Diwali 2025 with Mom and Dad',
  'Goa beach sunset last winter',
  "Priya's birthday cake",
];
