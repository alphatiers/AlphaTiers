# UltraTiers Website

This website displays all players and their tiers from the `players` table in Supabase.

## Setup

1. Open `website/config.js`.
2. Set `SUPABASE_URL` to your Supabase project URL.
3. Set `SUPABASE_ANON_KEY` to your Supabase anon/public key.

## Run locally

You can host the website with any static server.

Example using Python:

```bash
cd website
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Notes

- The app fetches from `players` and expects the table to have `ign`, `region`, `tiers`, and `last_tested` fields.
- Filtering is available by IGN, region, and mode.
