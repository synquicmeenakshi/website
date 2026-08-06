import CollectionEditor, { type FieldSpec } from '../components/CollectionEditor'

const fields: FieldSpec[] = [
  { key: 'name', label: 'Name', type: 'text', hint: 'Shortened at the client’s request, as stated on the page' },
  { key: 'short', label: 'Short quote', type: 'textarea', rows: 2, hint: 'Used in the home-page constellation, where a full paragraph will not fit' },
  { key: 'quote', label: 'Full quote', type: 'textarea', rows: 4 },
  { key: 'cat', label: 'Category', type: 'text', hint: 'e.g. Entrepreneur, Business Owner, Individual' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'service', label: 'Service', type: 'text' },
  { key: 'isFeatured', label: 'Featured quote', type: 'boolean', hint: 'The single highlighted testimonial. Only one should be set.' },
]

const MeenakshiTestimonials = () => (
  <CollectionEditor
    collection="testimonials"
    title="Testimonials"
    subtitle="Client quotes shown across the site"
    fields={fields}
    listKeys={['name', 'short']}
    emptyItem={{
      name: '', short: '', quote: '', cat: '', city: '', service: '',
      isFeatured: false, isActive: true,
    }}
    labelOf={(t) => t.name}
  />
)

export default MeenakshiTestimonials
