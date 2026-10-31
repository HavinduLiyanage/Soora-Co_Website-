import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { authOptions } from "../lib/server/auth-options.ts";
const {
  SOORA_OWNER_EMAIL: email,
  SOORA_OWNER_PASSWORD: password,
  SOORA_OWNER_NAME: name = "Store owner",
} = process.env;
if (!email || !password || password.length < 12)
  throw new Error(
    "Set owner email and a password of at least 12 characters in the local bootstrap environment. Never commit it.",
  );
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
try {
  const options = authOptions(pool);
  // This registration-enabled instance exists only in this local CLI, never in a route.
  const provisioning = betterAuth({
    ...options,
    emailAndPassword: { ...options.emailAndPassword, disableSignUp: false },
    rateLimit: { enabled: false },
  });
  const result = await provisioning.api.signUpEmail({
    body: { email, password, name },
  });
  await pool.query("insert into store_owners(user_id) values($1)", [
    result.user.id,
  ]);
  await pool.query('delete from session where "userId"=$1', [result.user.id]);
  console.log(
    "Owner created. Sign in at /admin/. No password is printed or stored in source.",
  );
} finally {
  await pool.end();
}
