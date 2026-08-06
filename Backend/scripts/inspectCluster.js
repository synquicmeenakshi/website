/**
 * List databases and collection counts on the configured cluster.
 * Read-only. Useful before pointing the app at a new MONGODB_URI.
 *
 *   node scripts/inspectCluster.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
  const client = mongoose.connection.getClient();
  const { databases } = await mongoose.connection.db.admin().listDatabases();

  console.log('Connected to:', mongoose.connection.host);
  console.log('Default DB from URI:', mongoose.connection.name || '(none specified)');
  console.log('\nDATABASES');

  for (const d of databases) {
    console.log(`  ${d.name}  (${(d.sizeOnDisk / 1024).toFixed(1)} KB)`);
    if (['admin', 'local', 'config'].includes(d.name)) continue;
    const cols = await client.db(d.name).listCollections().toArray();
    if (!cols.length) console.log('      (no collections)');
    for (const c of cols) {
      const n = await client.db(d.name).collection(c.name).countDocuments();
      console.log(`      - ${c.name}: ${n} docs`);
    }
  }

  await mongoose.connection.close();
  process.exit(0);
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
