import CollectionEditor, { type FieldSpec } from '../components/CollectionEditor'

const fields: FieldSpec[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'slug', label: 'Slug', type: 'text', hint: 'URL segment — /services/<slug>. Changing this breaks existing links.' },
  { key: 'n', label: 'Numeral', type: 'text', hint: 'Shown as the card index, e.g. 01' },
  { key: 'short', label: 'Short name', type: 'text', hint: 'Used where the full title will not fit' },
  { key: 'deva', label: 'Devanagari', type: 'text' },
  { key: 'lede', label: 'Lede', type: 'textarea', rows: 2, hint: 'One-line promise used on cards' },
  { key: 'intro', label: 'Intro', type: 'textarea', rows: 4, hint: 'Opening paragraph on the detail page' },
  { key: 'img', label: 'Card image path', type: 'text', hint: 'e.g. /img/svc-astrology.png' },
  { key: 'alt', label: 'Card image alt text', type: 'text' },
  { key: 'scene', label: 'Scene image path', type: 'text' },
  { key: 'sceneAlt', label: 'Scene image alt text', type: 'text' },
  { key: 'price', label: 'Price (₹)', type: 'number', hint: 'Zero shows as “On enquiry” rather than ₹0' },
  { key: 'duration', label: 'Duration (minutes)', type: 'number' },
  { key: 'questions', label: 'Questions visitors arrive with', type: 'stringList' },
  { key: 'items', label: 'Consultation list', type: 'stringList' },
]

const MeenakshiServices = () => (
  <CollectionEditor
    collection="services"
    title="Services"
    subtitle="The disciplines shown at /services and /services/:slug"
    fields={fields}
    listKeys={['title', 'lede']}
    emptyItem={{
      title: '', slug: '', n: '', short: '', deva: '', lede: '', intro: '',
      img: '', alt: '', scene: '', sceneAlt: '', questions: [], items: [],
      price: 0, duration: 60, isActive: true,
    }}
    labelOf={(s) => s.title}
  />
)

export default MeenakshiServices
