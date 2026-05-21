const path = require('path');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in Render.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.static(path.join(__dirname)));

app.get('/api/players', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('ign, region, tiers');

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch player data' });
    }

    res.json(data || []);
  } catch (err) {
    console.error('Unexpected API error:', err);
    res.status(500).json({ error: 'Unexpected error fetching player data' });
  }
});

app.listen(port, () => {
  console.log(`Website server listening on port ${port}`);
});
