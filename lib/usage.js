// import { MongoClient } from 'mongodb';

// const MONGODB_URI = process.env.MONGODB_URI;

// let cachedDb = null;

// async function connectToDatabase() {
//   if (cachedDb) {
//     return cachedDb;
//   }

//   const client = await MongoClient.connect(MONGODB_URI);
//   const db = client.db(MONGODB_URI);
//   cachedDb = db;
//   return db;
// }

// export async function getUsageStats(apiName) {
//   const db = await connectToDatabase();
//   const today = new Date().toISOString().split('T')[0];
  
//   const usageCollection = db.collection('api_usage');
  
//   // Get or create today's usage record
//   const usage = await usageCollection.findOneAndUpdate(
//     { date: today, api: apiName },
//     { $inc: { count: 1 } },
//     { upsert: true, returnOriginal: false }
//   );
  
//   // Check if we're approaching limits
//   const dailyLimit = 1000; // Adjust based on your needs
//   if (usage.value && usage.value.count > dailyLimit * 0.8) {
//     console.warn(`Warning: ${apiName} API is approaching daily limit (${usage.value.count}/${dailyLimit})`);
//   }
  
//   return usage.value;
// }

// export async function getTotalUsage() {
//   const db = await connectToDatabase();
//   const usageCollection = db.collection('api_usage');
  
//   const today = new Date().toISOString().split('T')[0];
//   const totalUsage = await usageCollection.aggregate([
//     { $match: { date: today } },
//     { $group: { _id: null, total: { $sum: "$count" } } }
//   ]).toArray();
  
//   return totalUsage[0]?.total || 0;
// } 