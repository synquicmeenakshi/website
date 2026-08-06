import CollectionEditor, { type FieldSpec } from '../components/CollectionEditor'

const fields: FieldSpec[] = [
  { key: 'n', label: 'Step number', type: 'text', hint: 'e.g. 01' },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'body', label: 'Body', type: 'textarea', rows: 3 },
  { key: 'aside', label: 'Aside', type: 'textarea', rows: 2, hint: 'The detail a visitor asks about once they have read the step' },
]

const MeenakshiJourney = () => (
  <CollectionEditor
    collection="journey"
    title="Journey"
    subtitle="The steps of a consultation, shown on /journey and the home-page strip"
    fields={fields}
    listKeys={['title', 'body']}
    emptyItem={{ n: '', title: '', body: '', aside: '', isActive: true }}
    labelOf={(j) => `${j.n} ${j.title}`}
  />
)

export default MeenakshiJourney
