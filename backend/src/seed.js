import Destination from './models/Destination.js';

const destinations = [
  {
    name: 'Paris',
    country: 'France',
    description: 'The City of Light — art, cuisine, and iconic landmarks.',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
    tags: ['culture', 'food', 'romance'],
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    description: 'A vibrant blend of tradition and cutting-edge technology.',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    tags: ['culture', 'food', 'technology'],
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    description: 'Gaudí architecture, beaches, and tapas culture.',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400',
    tags: ['beach', 'architecture', 'food'],
  },
  {
    name: 'New York',
    country: 'USA',
    description: 'The city that never sleeps — Broadway, museums, and skyline views.',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
    tags: ['city', 'culture', 'shopping'],
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    description: 'Tropical paradise with temples, rice terraces, and beaches.',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-d657df628baf?w=400',
    tags: ['beach', 'nature', 'wellness'],
  },
  {
    name: 'Rome',
    country: 'Italy',
    description: 'Ancient history meets modern Italian life.',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400',
    tags: ['history', 'food', 'culture'],
  },
];

export async function seedDestinations() {
  const count = await Destination.countDocuments();
  if (count === 0) {
    await Destination.insertMany(destinations);
    console.log(`Seeded ${destinations.length} destinations`);
  }
}
