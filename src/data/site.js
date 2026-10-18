export const business = {
  name: 'Gentleman Gym',
  shortName: 'Gentleman',
  type: 'Professional Multi-Gym & Fitness Centre',
  address: {
    line1: 'Thellukuzhi',
    line2: 'Perumkidavila P.O.',
    region: 'Kerala, India',
    full: 'Thellukuzhi, Perumkidavila P.O., Kerala, India',
  },
  phones: [
    { label: '9895979950', display: '98959 79950', tel: '+919895979950', digits: '9895979950' },
    { label: '9895100630', display: '98951 00630', tel: '+919895100630', digits: '9895100630' },
  ],
}

export const navLinks = [
  { label: 'Home', href: '/', id: 'home' },
  { label: 'About Us', href: '/about', id: 'about' },
  { label: 'Facilities', href: '/facilities', id: 'facilities' },
  { label: 'Ladies & Gents', href: '/ladies-gents', id: 'ladies-gents' },
  { label: 'Trainer', href: '/trainer', id: 'trainers' },
  { label: 'Gallery', href: '/gallery', id: 'gallery' },
  { label: 'Membership', href: '/membership', id: 'membership' },
  { label: 'Contact', href: '/contact', id: 'contact' },
]

export const facilities = [
  {
    title: 'Strength Training',
    description:
      'Compound lifts and progressive strength work, coached with an emphasis on safe technique.',
    image: '/images/facility-strength.jpg',
    alt: 'Member carrying a weight plate across the training floor at Gentleman Gym',
  },
  {
    title: 'Weight Training',
    description:
      'Dumbbell and free-weight training for balanced, full-body development at your own pace.',
    image: '/images/facility-weights.jpg',
    alt: 'Close-up of a member performing a dumbbell curl in the gym',
  },
  {
    title: 'Cardio Workouts',
    description:
      'Conditioning sessions that build stamina, support heart health and keep your training varied.',
    image: '/images/facility-cardio.jpg',
    alt: 'Member working out with battle ropes during a conditioning session',
  },
  {
    title: 'Muscle Building',
    description:
      'Structured hypertrophy programmes built around controlled reps, recovery and consistency.',
    image: '/images/facility-muscle.jpg',
    alt: 'Athlete performing a pull-up in a dark gym',
  },
  {
    title: 'Personal Fitness Training',
    description:
      'One-to-one guidance from a certified trainer, with a plan shaped around your goals.',
    image: '/images/facility-pt.jpg',
    alt: 'Certified trainer guiding a member through an exercise on the gym floor',
  },
  {
    title: 'General Fitness & Conditioning',
    description:
      'Approachable full-body sessions for beginners and regulars who want to feel better, move better and stay consistent.',
    image: '/images/facility-general.jpg',
    alt: 'Members training together with barbells in a group conditioning class',
  },
]

export const benefits = [
  {
    icon: 'Dumbbell',
    title: 'Professional Multi-Gym Environment',
    description:
      'A dedicated training space with the energy, equipment and focus of a professional gym.',
  },
  {
    icon: 'Users',
    title: 'Training for Ladies and Gents',
    description:
      'A welcoming fitness centre where men and women train with the same support and respect.',
  },
  {
    icon: 'BadgeCheck',
    title: 'Certified Trainer Guidance',
    description:
      'Work with certified trainers who help you train safely and with clear direction.',
  },
  {
    icon: 'Target',
    title: 'Fitness Goals for Every Level',
    description:
      'From your first session to your next milestone, training is adapted to where you are today.',
  },
  {
    icon: 'HeartHandshake',
    title: 'Supportive Training Community',
    description:
      'A motivating environment built on encouragement, consistency and respect for every member.',
  },
  {
    icon: 'MapPin',
    title: 'Convenient Local Location',
    description:
      "Right in Thellukuzhi, Perumkidavila P.O. — easy to reach and simple to make part of your routine.",
  },
]

// One featured trainer, using the real portrait supplied by the gym.
export const trainers = [
  {
    name: 'Head Trainer',
    title: 'Personal Training & Bodybuilding',
    description:
      'Personal guidance for strength, technique and consistent progress, backed by real bodybuilding competition experience.',
    image: '/images/trainer-owner.jpg',
    alt: 'Gentleman Gym head trainer wearing a grey suit at an event',
  },
]

export const gallery = [
  {
    image: '/images/gym-reception.jpg',
    alt: 'Reception desk and branded interior at Gentleman Gym',
    title: 'Our Gym',
    category: 'Facilities',
  },
  {
    image: '/images/champion-trophy.jpg',
    alt: 'Bodybuilding champion posing with a trophy inside the gym',
    title: 'Hard Work, Real Results',
    category: 'Achievement',
  },
  {
    image: '/images/competition-team.jpg',
    alt: 'Bodybuilding competition stage and trophy presentation',
    title: 'Competition Day',
    category: 'Competition',
  },
  {
    image: '/images/competition-stage.jpg',
    alt: 'Bodybuilding competitors on stage at a physique competition',
    title: 'On the Stage',
    category: 'Competition',
  },
  {
    image: '/images/champion-pose.jpg',
    alt: 'Bodybuilding competitor posing beside awards',
    title: 'Discipline in Action',
    category: 'Training',
  },
  {
    image: '/images/medal-achievement.jpg',
    alt: 'Bodybuilding competitor displaying a medal after a competition',
    title: 'Every Rep Counts',
    category: 'Achievement',
  },
]

export const fitnessGoals = [
  'General fitness',
  'Weight loss',
  'Muscle building',
  'Strength training',
  'Personal training',
  'Not sure yet — guide me',
]
