try {
  process.loadEnvFile()
} catch {
  // no .env file present (e.g. CI sets vars directly) — fine
}
