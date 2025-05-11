import { connection } from "mongoose";

export async function seedBundles() {
  const bundles = [
    {
      name: "Starter Bundle",
      description: "Basic internet package for new users",
      duration_days: 30,
      price: 29.99,
      subscriptionData: 5000,
    },
    {
      name: "Family Bundle",
      description: "Perfect for families needing more data and reliability",
      duration_days: 30,
      price: 59.99,
      subscriptionData: 20000,
    },
    {
      name: "Annual Bundle",
      description: "Best for heavy users; discounted yearly subscription",
      duration_days: 365,
      price: 499.99,
      subscriptionData: 100000,
    },
    {
      name: "Student Bundle",
      description: "Affordable plan for students with moderate data needs",
      duration_days: 30,
      price: 19.99,
      subscriptionData: 3000,
    },
    {
      name: "Weekend Warrior",
      description: "Short-term bundle for weekend binge sessions",
      duration_days: 7,
      price: 9.99,
      subscriptionData: 1500,
    },
    {
      name: "Night Owl Bundle",
      description: "Extra data for night-time streaming and downloads",
      duration_days: 30,
      price: 24.99,
      subscriptionData: 7000,
    },
    {
      name: "Business Pro",
      description: "Reliable, high-capacity bundle for small businesses",
      duration_days: 30,
      price: 129.99,
      subscriptionData: 50000,
    },
    {
      name: "Holiday Bundle",
      description: "Perfect for holidays and travel, short-term high data",
      duration_days: 14,
      price: 39.99,
      subscriptionData: 10000,
    },
    {
      name: "Lite Bundle",
      description: "Entry-level bundle for light users",
      duration_days: 30,
      price: 14.99,
      subscriptionData: 1500,
    },
    {
      name: "Power User Bundle",
      description: "For users who never want to run out of data",
      duration_days: 30,
      price: 199.99,
      subscriptionData: 100000,
    },
    {
      name: "Quarterly Bundle",
      description: "Three months of steady, reliable internet",
      duration_days: 90,
      price: 139.99,
      subscriptionData: 35000,
    },
    {
      name: "Kids Safe Bundle",
      description: "Safe and limited data for kids' devices",
      duration_days: 30,
      price: 12.99,
      subscriptionData: 1000,
    },
  ];

  for (const bundle of bundles) {
    await connection
      .collection("bundles")
      .updateOne({ name: bundle.name }, { $set: bundle }, { upsert: true });
  }

  console.log("Bundles seeded!");
}
