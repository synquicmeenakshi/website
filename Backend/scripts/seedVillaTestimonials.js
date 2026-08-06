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

const villaTestimonials = [
  {
    name: 'Damian',
    role: 'Guest',
    text: 'The villa was perfect and was just what we wanted, location was fine. Could walk to the harbour in about 30 - 35 mins. If you need a taxi it was 4 - 6 euros.',
    rating: 5,
    propertyName: 'Villa Zen Your Life',
    category: 'rental',
    isActive: true,
    photo: 'profile1.png'
  },
  {
    name: 'Eden',
    role: 'Guest',
    text: 'Perfect stay for 4 adults and 2 children. Everything was even better than the pictures, a lovely villa with everything you would need. Host was lovely, left a gift in the cot for the baby and was on deck for any questions I had.',
    rating: 5,
    propertyName: 'Villa Zen Your Life',
    category: 'rental',
    isActive: true,
    photo: 'profile2.png'
  },
  {
    name: 'Les',
    role: 'Guest',
    text: "Firstly, the location was good. Very private and quiet. Everywhere was 25-30mins on foot or 4-5 euros in a taxi - and these were easy to obtain for most journeys. Villa is well equipped and is a real suntrap all day. Host was super-responsive and the welcome pack of drinks in the fridge was a lovely touch. Whilst we enjoyed the facilities of the resort, we had very enjoyable meals at the villa also.",
    rating: 5,
    propertyName: 'Villa Zen Your Life',
    category: 'rental',
    isActive: true,
    photo: 'profile3.png'
  },
  {
    name: 'Scott',
    role: 'Guest',
    text: "We arrived late on the first night and met Stan who was an excellent host. The villa has been clean and comfortable, and also a fantastic stay for 9 nights. Stan responded quickly to our questions/requests. Wi-Fi signal was excellent. The living room and the kitchen were good. Beds were comfortable in the master bedroom and in the second bedroom, both also spacious. The third bedroom with bunk beds were not used. An ensuite shower in the master bedroom and a bathroom were good. Loved our time a lot in the outdoor dining area where we enjoyed chilling out on the sofas. Private pool was very good with steps in one corner, and all sides were at least 1 metre deep, but we still loved the pool which was bigger than we thought! The villa is in the quiet area so a car was absolutely essential. We really recommend that you try Villa Zen Your Life!",
    rating: 5,
    propertyName: 'Villa Zen Your Life',
    category: 'rental',
    isActive: true,
    photo: 'profile4.png'
  },
  {
    name: 'Jens',
    role: 'Guest',
    text: 'Fabuleux',
    rating: 5,
    propertyName: 'Villa Zen Your Life',
    category: 'rental',
    isActive: true,
    photo: 'profile1.png'
  },
  {
    name: 'Danijel',
    role: 'Guest',
    text: "Beautiful villa and nice, just enough big pool. Stan made sure we had everything we needed and left us a nice welcome gift. The pool was cleaned prior to our arrival, but there is a big palm tree close to the pool, and when it is windy, leaves and some other dirt are falling into the pool. There was no net to take that out of the pool, but Stan brought a new one on a request, which made it easy to remove most of the dirt. A big plus for us was a bbq, and even though we ran out of the gas, Stan made sure it was refilled the next day. There was a coffee machine and some capsules, for a start, some basic spices in the kitchen, and a dishwasher tablet's, as it was some dishwasher soap and hand soap. The villa was nice and clean. Even if the villa needs some improvements, that would not stop up coming back.",
    rating: 5,
    propertyName: 'Villa Zen Your Life',
    category: 'rental',
    isActive: true,
    photo: 'profile2.png'
  },
  {
    name: 'Sarah',
    role: 'Guest',
    text: "Uns hat die Lage mit Parkplatz vor dem Haus sehr gefallen. Der Außensitzbereich und der Pool war sehr schön. Die Aufteilung und Gestaltung der Zimmer ist sehr ansprechend. Das Haus bietet mit 3 Schlafzimmern und 2 Bädern genug Platz um sich zu entfalten. Es gab einen Wohnbereich mit einer Essecke. Wir haben diese nicht genutzt, da der Außenbereich mit einem Esstisch ausgestattet war und draußen Frühstücken ein wunderbarer start in den Tag ist.",
    rating: 5,
    propertyName: 'Villa Zen Your Life',
    category: 'rental',
    isActive: true,
    photo: 'profile3.png'
  }
];

async function seedVillaTestimonials() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Add displayOrder based on index
    const testimonialsWithOrder = villaTestimonials.map((t, index) => ({
      ...t,
      displayOrder: index
    }));

    // Insert testimonials
    const result = await Testimonial.insertMany(testimonialsWithOrder);
    console.log(`Successfully added ${result.length} Villa Zen Your Life testimonials`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding testimonials:', error);
    process.exit(1);
  }
}

seedVillaTestimonials();
