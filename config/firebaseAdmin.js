import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Format private key properly
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.slice(1, -1);
}
// Replace escaped newlines
privateKey = privateKey.replace(/\\n/g, '\n');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
  console.error('💡 Check your Firebase service account credentials');
  process.exit(1);
}

export const auth = admin.auth();