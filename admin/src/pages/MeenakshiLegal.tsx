import CollectionEditor, { type FieldSpec } from '../components/CollectionEditor'

const fields: FieldSpec[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'slug', label: 'Slug', type: 'text', hint: 'URL segment — /legal/<slug>. Changing this breaks existing links.' },
  { key: 'lede', label: 'Lede', type: 'textarea', rows: 2 },
  { key: 'updated', label: 'Applies-to note', type: 'text', hint: 'The line under the lede, e.g. “Applies to this website and all consultations booked through it.”' },
  { key: 'sections', label: 'Sections', type: 'sectionList', hint: 'Each section is a heading followed by one or more paragraphs' },
]

const MeenakshiLegal = () => (
  <CollectionEditor
    collection="legal"
    title="Legal Pages"
    subtitle="Privacy, terms, refunds, ethics and disclaimer"
    fields={fields}
    listKeys={['title', 'lede']}
    emptyItem={{ title: '', slug: '', lede: '', updated: '', sections: [], isActive: true }}
    labelOf={(p) => p.title}
  />
)

export default MeenakshiLegal
