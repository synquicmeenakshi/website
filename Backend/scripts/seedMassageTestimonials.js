const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zenyourlife';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, trim: true, default: '' },
  text: { type: String, required: true, trim: true },
  translations: {
    fr: { text: String, role: String },
    de: { text: String, role: String },
    nl: { text: String, role: String }
  },
  photo: { type: String, default: 'profile1.png' },
  photoUrl: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', default: null },
  propertyName: { type: String, default: '', trim: true },
  category: { type: String, enum: ['massage', 'rental'], default: 'massage' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

const massageTestimonials = [
  {
    name: 'Vanessa Van Hese',
    role: 'Client',
    text: 'Love it! Lovely staff, great massage, perfect for romantic date!',
    rating: 5,
    propertyName: '',
    category: 'massage',
    isActive: true,
    photo: 'profile1.png'
  },
  {
    name: 'Olle Borg',
    role: 'Client',
    text: 'By far, the best place to sleep over in that part of Brussels.',
    rating: 5,
    propertyName: '',
    category: 'massage',
    isActive: true,
    photo: 'profile2.png'
  },
  {
    name: 'Marc Vettori',
    role: 'Client',
    text: 'Top zen your life massage.',
    rating: 5,
    propertyName: '',
    category: 'massage',
    isActive: true,
    photo: 'profile3.png'
  },
  {
    name: 'Tamer Ahmed',
    role: 'Client',
    text: 'Very quiet',
    rating: 5,
    propertyName: '',
    category: 'massage',
    isActive: true,
    photo: 'profile4.png'
  },
  {
    name: 'Peter',
    role: 'Client',
    text: 'Ik ben sinds kort terug rustig beginnen sporten na het laten plaatsen van 2 stents verleden zomer. Dergelijke massage doet wonderen. Ik slaap de nacht erop als een marmot. Enorme aanrader!',
    rating: 5,
    propertyName: '',
    category: 'massage',
    isActive: true,
    photo: 'profile1.png'
  },
  {
    name: 'Hulusi',
    role: 'Client',
    text: 'Zeer tevreden, ik het aan!',
    rating: 5,
    propertyName: '',
    category: 'massage',
    isActive: true,
    photo: 'profile2.png'
  },
  {
    name: 'Iris',
    role: 'Client',
    text: "Nadia doet het geweldig: aangename en geruststellende persoonlijkheid, professioneel en to-the-point. Mooie praktijkruimte en omgeving, ook. Een aanrader om even de stress te laten lopen. I'll be back!",
    rating: 5,
    propertyName: '',
    category: 'massage',
    isActive: true,
    photo: 'profile3.png'
  },
  {
    name: 'Mario van den hoof',
    role: 'Client',
    text: 'Heel ontspannend en zeer tevreden',
    rating: 5,
    propertyName: '',
    category: 'massage',
    isActive: true,
    photo: 'profile4.png'
  },
  {
    name: 'Magali',
    role: 'Client',
    text: 'Juste la perfection avec Nadia :) je recommande vivement!',
    rating: 5,
    propertyName: '',
    category: 'massage',
    isActive: true,
    photo: 'profile1.png'
  },
  {
    name: 'Fatti Ombr',
    role: 'Client',
    text: "Un'esperienza unica. Discreto, pulito, immerso nella natura. Si possono fare massaggi e scegliere percorsi ben precisi per la cura del corpo e dell'anima. Ottimo per chi vuole evadere dalla routine noiosa e stancante della vita quotidiana.",
    rating: 5,
    propertyName: '',
    category: 'massage',
    isActive: true,
    photo: 'profile2.png'
  },
  {
    name: 'Bart Kegeleers',
    role: 'Client',
    text: 'Eerste keer hier en echt een geweldig en sfeervolle massage gehad. Ik was even helemaal van de wereld verdwenen en ben helemaal ontstrest! Dankuwel Nadia',
    rating: 5,
    propertyName: '',
    category: 'massage',
    isActive: true,
    photo: 'profile3.png'
  },
  {
    name: 'Blue',
    role: 'Client',
    text: "J'y suis allée pour un massage aux pierres chaude... Tellement relaxant. J'ai passer 1h de pure bonheur et détente. Merci",
    rating: 5,
    propertyName: '',
    category: 'massage',
    isActive: true,
    photo: 'profile4.png'
  }
];

async function seedMassageTestimonials() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Add displayOrder based on index
    const testimonialsWithOrder = massageTestimonials.map((t, index) => ({
      ...t,
      displayOrder: index
    }));

    // Insert testimonials
    const result = await Testimonial.insertMany(testimonialsWithOrder);
    console.log(`Successfully added ${result.length} massage testimonials`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding testimonials:', error);
    process.exit(1);
  }
}

seedMassageTestimonials();
