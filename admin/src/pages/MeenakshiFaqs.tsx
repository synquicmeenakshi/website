import CollectionEditor, { type FieldSpec } from '../components/CollectionEditor'

const fields: FieldSpec[] = [
  { key: 'q', label: 'Question', type: 'textarea', rows: 2 },
  { key: 'a', label: 'Answer', type: 'textarea', rows: 5 },
  {
    key: 'placement', label: 'Placement', type: 'select', options: ['faq', 'book'],
    hint: '“faq” = the grouped FAQ section · “book” = the four shown beside the booking form',
  },
  { key: 'group', label: 'Group heading', type: 'text', hint: 'Only used for “faq” placement, e.g. “Before you book”' },
  { key: 'groupOrder', label: 'Group order', type: 'number', hint: 'Which group this belongs to, counting from 0' },
  { key: 'showOnHome', label: 'Show in home-page accordion', type: 'boolean' },
  { key: 'homeOrder', label: 'Home-page order', type: 'number' },
]

const MeenakshiFaqs = () => (
  <CollectionEditor
    collection="faqs"
    title="FAQ"
    subtitle="Grouped questions, the shorter home-page set, and the booking-page four"
    fields={fields}
    listKeys={['q', 'a']}
    groupKey="group"
    emptyItem={{
      q: '', a: '', placement: 'faq', group: '', groupOrder: 0,
      showOnHome: false, homeOrder: 0, isActive: true,
    }}
    labelOf={(f) => f.q}
  />
)

export default MeenakshiFaqs
