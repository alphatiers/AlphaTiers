import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase-es.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const statusEl = document.getElementById('status');
const tableBody = document.querySelector('#players-table tbody');
const testersTableBody = document.querySelector('#testers-table tbody');
const searchInput = document.getElementById('search');
const regionSelect = document.getElementById('region');
const modeSelect = document.getElementById('mode');
const refreshButton = document.getElementById('refresh');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let players = [];
let testers = [];

function formatDate(value) {
  if (!value) return 'Unknown';
  const date = new Date(value);
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function createTierBadges(tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return '<span class="badge badge-tier">No tiers</span>';
  return tiers.map(item => {
    const mode = item.gamemode || 'Unknown';
    const tier = item.tier || 'Unknown';
    return `<span class="badge badge-tier">${mode}: ${tier}</span>`;
  }).join(' ');
}

function renderPlayers() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const regionValue = regionSelect.value;
  const modeValue = modeSelect.value;

  const filtered = players.filter(player => {
    const matchesSearch = !searchValue || player.ign.toLowerCase().includes(searchValue);
    const matchesRegion = !regionValue || player.region === regionValue;
    const matchesMode = !modeValue || (Array.isArray(player.tiers) && player.tiers.some(t => t.gamemode === modeValue));
    return matchesSearch && matchesRegion && matchesMode;
  });

  tableBody.innerHTML = filtered.map(player => `
    <tr>
      <td>${player.ign || 'Unknown'}</td>
      <td>${player.region || 'Unknown'}</td>
      <td>${createTierBadges(player.tiers)}</td>
      <td>${formatDate(player.last_tested)}</td>
    </tr>
  `).join('');

  statusEl.textContent = `Showing ${filtered.length} of ${players.length} players.`;
}

function renderTesters() {
  testersTableBody.innerHTML = testers.map(tester => `
    <tr>
      <td>${tester.ign || 'Unknown'}</td>
      <td>${tester.discord_id || 'N/A'}</td>
      <td>${tester.role || 'tester'}</td>
      <td>${formatDate(tester.joined_date)}</td>
    </tr>
  `).join('');
}

async function loadPlayers() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('YOUR_') || SUPABASE_ANON_KEY.includes('YOUR_')) {
    statusEl.textContent = 'Please configure SUPABASE_URL and SUPABASE_ANON_KEY in config.js.';
    return;
  }

  statusEl.textContent = 'Loading players...';

  const { data, error } = await supabase
    .from('players')
    .select('uuid, ign, region, tiers, last_tested')
    .order('ign', { ascending: true });

  if (error) {
    statusEl.textContent = `Failed to load players: ${error.message}`;
    console.error(error);
    return;
  }

  players = Array.isArray(data) ? data : [];
  renderPlayers();
  await loadTesters();
}

async function loadTesters() {
  const { data, error } = await supabase
    .from('testers')
    .select('id, ign, discord_id, role, joined_date')
    .order('joined_date', { ascending: false });

  if (error) {
    console.error('Failed to load testers:', error);
    return;
  }

  testers = Array.isArray(data) ? data : [];
  renderTesters();
}

searchInput.addEventListener('input', renderPlayers);
regionSelect.addEventListener('change', renderPlayers);
modeSelect.addEventListener('change', renderPlayers);
refreshButton.addEventListener('click', loadPlayers);

loadPlayers();
