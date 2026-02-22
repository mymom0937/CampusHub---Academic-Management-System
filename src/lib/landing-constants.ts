/** Image paths - all images from public/Images/ */
export const LANDING_IMAGES = {
  hero: ['/Images/hero-1.jpg', '/Images/hero-2.jpg', '/Images/hero-3.jpg'],
  campusLife: ['/Images/campus-life-1.jpg', '/Images/campus-life-2.jpg', '/Images/campus-life-3.jpg'],
  campuses: ['/Images/campus-1.jpg', '/Images/campus-2.jpg', '/Images/campus-3.jpg'],
  news: '/Images/news-placeholder.jpg',
  partners: ['/Images/partner-1.png', '/Images/partner-2.png', '/Images/partner-3.png'],
} as const

/** Hero carousel slides - images from public/Images/ */
export const HERO_SLIDES = [
  {
    image: '/Images/hero-1.jpg',
    title: 'Seek Wisdom, Elevate Your Intellect and Serve Humanity',
    description:
      'CampusHub, an institution of educational excellence, empowers students to achieve their academic goals and prepares them for a successful future.',
    cta: 'Portal',
    ctaSecondary: 'Study at CampusHub',
  },
  {
    image: '/Images/hero-2.jpg',
    title: 'Excellence in Education, Innovation in Learning',
    description:
      'Join a community of scholars dedicated to academic excellence, research, and lifelong learning.',
    cta: 'Portal',
    ctaSecondary: 'Explore Programs',
  },
  {
    image: '/Images/hero-3.jpg',
    title: 'Your Journey to Success Starts Here',
    description:
      'From enrollment to graduation, CampusHub supports every step of your academic journey with modern tools and dedicated support.',
    cta: 'Portal',
    ctaSecondary: 'Get Started',
  },
]

/** Impact stats */
export const IMPACT_STATS = [
  { value: '10K+', label: 'Active Students', description: 'Enrolled across programs' },
  { value: '#1', label: 'Top Rated', description: 'Academic management platform' },
  { value: '500+', label: 'Courses', description: 'Wide range of programs' },
  { value: '98%', label: 'Satisfaction', description: 'Student & faculty rated' },
]

/** Campus life content */
export const CAMPUS_LIFE_SLIDES = [
  {
    image: '/Images/campus-life-1.jpg',
    title: 'Explore Life at CampusHub',
    subtitle: 'Events and Activities',
    description:
      'From orientation to graduation ceremonies, discover a vibrant campus community with clubs, workshops, and cultural events.',
  },
  {
    image: '/Images/campus-life-2.jpg',
    title: 'Learning Beyond the Classroom',
    subtitle: 'Labs & Research',
    description:
      'State-of-the-art facilities and research opportunities that complement your academic journey.',
  },
  {
    image: '/Images/campus-life-3.jpg',
    title: 'Connect and Grow',
    subtitle: 'Community',
    description:
      'Build lasting connections with peers, mentors, and industry partners throughout your studies.',
  },
]

/** Campus explore */
export const CAMPUS_SLIDES = [
  { image: '/Images/campus-1.jpg', name: 'Main Campus', description: 'Central hub for academics and administration' },
  { image: '/Images/campus-2.jpg', name: 'Science Complex', description: 'Labs, research centers, and innovation spaces' },
  { image: '/Images/campus-3.jpg', name: 'Student Center', description: 'Library, cafeteria, and student services' },
]
