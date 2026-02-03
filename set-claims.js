/**
 * Usage:
 *   Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.
 *   Run: node set-claims.js <uid> [role]
 *   Example: node set-claims.js abc123 admin
 */
const admin = require('firebase-admin');

function ensureCreds() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('ERROR: Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.');
    process.exit(1);
  }
}

async function main() {
  ensureCreds();
  const [uid, roleArg] = process.argv.slice(2);
  const role = roleArg || 'admin';
  if (!uid) {
    console.error('Usage: node set-claims.js <uid> [role]');
    process.exit(1);
  }

  admin.initializeApp({ credential: admin.credential.applicationDefault() });
  await admin.auth().setCustomUserClaims(uid, { role });
  console.log(`Custom claim set: { role: '${role}' } for uid: ${uid}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
