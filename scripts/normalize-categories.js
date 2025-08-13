import { MongoClient } from 'mongodb';

const NAME_TO_SLUG = new Map([
  ["Water Supply & Sewerage", "water-supply"],
  ["Roads & Transportation", "road-transportation"],
  ["Electricity", "electricity"],
  ["Sanitation", "sanitation"],
  ["Street Lighting", "street-lighting"],
  ["Parks & Recreation", "parks-recreation"],
  ["Water Supply", "water-supply"],
  ["Road & Transportation", "road-transportation"],
]);

function toSlug(value) {
  if (!value) return value;
  if (NAME_TO_SLUG.has(value)) return NAME_TO_SLUG.get(value);
  // Best-effort normalization for stray values
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('municipal_complaints');

  // Normalize user.department (officials)
  const users = await db.collection('users').find({ role: 'official' }).toArray();
  let userUpdates = 0;
  for (const user of users) {
    if (user.department) {
      const slug = toSlug(user.department);
      if (slug !== user.department) {
        await db.collection('users').updateOne({ id: user.id }, { $set: { department: slug } });
        userUpdates += 1;
      }
    }
  }

  // Normalize complaint.category
  const complaints = await db.collection('complaints').find({}).toArray();
  let complaintUpdates = 0;
  for (const c of complaints) {
    if (c.category) {
      const slug = toSlug(c.category);
      if (slug !== c.category) {
        await db.collection('complaints').updateOne({ id: c.id }, { $set: { category: slug } });
        complaintUpdates += 1;
      }
    }
  }

  console.log(`Users normalized: ${userUpdates}`);
  console.log(`Complaints normalized: ${complaintUpdates}`);
  await client.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
