import { connect, connection, disconnect } from "mongoose";
import { seedBundles } from "./bundle/seed-bundles";

async function collectionIsEmpty(name: string): Promise<boolean> {
  const count = await connection.collection(name).countDocuments();
  return count === 0;
}

async function runAllSeeds() {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/fibertime";
  await connect(mongoUri);

  if (await collectionIsEmpty("bundles")) {
    await seedBundles();
  }

  await disconnect();
}

runAllSeeds()
  .then(() => console.log("Seeding complete."))
  .catch(console.error);
