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

const casaTestimonials = [
  {
    name: 'Elisabeth',
    role: 'Guest',
    text: "The accommodation is certainly true to the description. Caroline is very friendly and gave us some fantastic recommendations, both to visit and to go to eat or have a drink. Communication was very good. I wouldn't hesitate to recommend the place.",
    rating: 5,
    propertyName: 'Casa Artevista',
    category: 'rental',
    isActive: true,
    photo: 'profile1.png'
  },
  {
    name: 'Aurelie',
    role: 'Guest',
    text: "We had a pleasant stay at Caroline's. The accommodation is perfectly equipped and located in a quiet environment, close to small heavenly corners. Enjoyable Jacuzzi after a day of trudging. Caroline is a warm host, always ready to offer excellent advice to make your stay unforgettable.",
    rating: 5,
    propertyName: 'Casa Artevista',
    category: 'rental',
    isActive: true,
    photo: 'profile2.png'
  },
  {
    name: 'Angela',
    role: 'Guest',
    text: "Had a few nights here to finish our stay in Lanzarote and it was perfect. Villa even better in reality, absolutely lush design, bigger than expected too, with a lovely large terrace and BBQ area. Wonderful place to sit in the evening and enjoy the glow of the villa. Caroline, a perfect and attentive host, even offering to find us fans and fix us up with some air conditioning units, as it was so hot. Absolutely spotless. A real treat. Hard recommend!",
    rating: 5,
    propertyName: 'Casa Artevista',
    category: 'rental',
    isActive: true,
    photo: 'profile3.png'
  },
  {
    name: 'Sarah',
    role: 'Guest',
    text: "Lovely little house in a peaceful location. Walk to a sandy beach right next to a great little restaurant. Caroline and Richard were perfect hosts……actually the nicest hosts I've ever stayed with on Air BnB! Super helpful and kind. So many recommendations they know Lanzarote really well. Would definitely stay with them again.",
    rating: 5,
    propertyName: 'Casa Artevista',
    category: 'rental',
    isActive: true,
    photo: 'profile4.png'
  },
  {
    name: 'Christophe',
    role: 'Guest',
    text: 'Nice apartment in a good location, well-equipped and very nicely decorated. The rooftop terrace with sea view, the jacuzzi is perfect. Caroline was a perfect host, nice and available. We had a great week.',
    rating: 5,
    propertyName: 'Casa Artevista',
    category: 'rental',
    isActive: true,
    photo: 'profile1.png'
  },
  {
    name: 'Zbaraski',
    role: 'Guest',
    text: "Very cool, well communicating host. Everything worked smooth, needed no time to establish in the flat. Beautiful flat, very nice design and a lot of space. The area is very calm and relaxing. There are no shops in the village, however, you can get everything within a 10min drive. Amazing to sit in the jacuzzi while watching stars! Great location if you want to travel the entire island. The north and south ends are within 30 min drive from the flat, which enabled us to see the entire island in 4 days. Shoutout to the host: provided us with a long list of must-see on the island as well as some good restaurants! Very helpful",
    rating: 5,
    propertyName: 'Casa Artevista',
    category: 'rental',
    isActive: true,
    photo: 'profile2.png'
  },
  {
    name: 'Elke',
    role: 'Guest',
    text: "Sehr schönes Haus mit vielen netten Details eingerichtet. Eine windgeschützte Terrasse mit Whirlpool und eine Sonnenterrasse auf dem Dach, wo wir wunderbar gefrühstückt haben. Sehr netter und guter Verwalter des Hauses: der Whirlpol wurde nicht heiß und er ist am nächsten Tag sofort vorbeigekommen. Ein Whirlpool ist auf Lanzarote viel besser, als ein Swimmingpool - in unserem 2. Haus hatten wir einen Pool und dort war das Wasser so kalt, dass wir ihn nicht nutzen konnten. Uns hat die Lage sehr gut gefallen, um den Norden zu entdecken.",
    rating: 5,
    propertyName: 'Casa Artevista',
    category: 'rental',
    isActive: true,
    photo: 'profile3.png'
  }
];

async function seedCasaTestimonials() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Add displayOrder based on index
    const testimonialsWithOrder = casaTestimonials.map((t, index) => ({
      ...t,
      displayOrder: index
    }));

    // Insert testimonials
    const result = await Testimonial.insertMany(testimonialsWithOrder);
    console.log(`Successfully added ${result.length} Casa Artevista testimonials`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding testimonials:', error);
    process.exit(1);
  }
}

seedCasaTestimonials();
