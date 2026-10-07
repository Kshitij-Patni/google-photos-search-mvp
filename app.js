/* =========================================================
   Application UI Logic for Realistic Google Photos MVP
   ========================================================= */

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

let state = {
  route: '',
  searchQuery: '',
  searchPersonContext: null,
  opens: 0
};

// --- Routing ---
function navigate(hash) {
  if (!hash) hash = '#/photos';
  window.location.hash = hash;
}

window.addEventListener('hashchange', () => {
  const hash = window.location.hash || '#/photos';
  const parts = hash.split('/');
  state.route = parts[1];
  
  if (state.route === 'person') {
    state.searchPersonContext = parts[2];
  } else {
    state.searchPersonContext = null;
  }

  if (state.route === 'photos') state.opens++;

  renderRoute();
});

function renderRoute() {
  $$('.nav-item').forEach(btn => btn.classList.remove('active'));

  let activeNav = state.route;
  if (state.route === 'people' || state.route === 'person') activeNav = 'collections';
  
  const n = $(`#nav-${activeNav}`);
  if (n) n.classList.add('active');

  const root = $('#app-root');

  if (state.route === 'photos') root.innerHTML = renderPhotos();
  else if (state.route === 'search') root.innerHTML = renderSearch();
  else if (state.route === 'collections') root.innerHTML = renderCollections();
  else if (state.route === 'people') root.innerHTML = renderPeople();
  else if (state.route === 'person') root.innerHTML = renderPerson();

  if (state.route === 'search') attachSearchEvents();
}

// --- Screens ---

function renderPhotos() {
  // Sort photos by date
  const sortedPhotos = [...PHOTOS].sort((a,b) => b.date.localeCompare(a.date));
  
  // Group by date
  const groups = {};
  sortedPhotos.forEach(p => {
    if(!groups[p.date]) groups[p.date] = [];
    groups[p.date].push(p);
  });

  return `
    <div class="top-bar">
      <div class="logo-area">
        <svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 4A10 10 0 0 0 24 24Z"/><path fill="#4285F4" d="M44 24A10 10 0 0 0 24 24Z"/><path fill="#34A853" d="M24 44A10 10 0 0 0 24 24Z"/><path fill="#FBBC04" d="M4 24A10 10 0 0 0 24 24Z"/></svg>
        Google Photos
      </div>
      <div class="top-actions">
        <img src="assets/photos/aarav.jpg" class="avatar" alt="Me" onclick="navigate('#/photos')">
      </div>
    </div>
    
    <div class="search-nudge" onclick="navigate('#/search')">
      <span class="ms">search</span>
      <div class="search-nudge-text">
        <strong>Search for a memory...</strong>
        ${OPEN_TIPS[state.opens % OPEN_TIPS.length].body}
      </div>
    </div>
    
    <div class="memories-carousel">
      <div class="memory-card"><img src="assets/photos/wedding_bride.jpg"><div class="title">1 year ago</div></div>
      <div class="memory-card"><img src="assets/photos/trek.jpg"><div class="title">Manali memories</div></div>
      <div class="memory-card"><img src="assets/photos/goa_beach.jpg"><div class="title">Recent highlights</div></div>
      <div class="memory-card"><img src="assets/photos/diwali.jpg"><div class="title">Diwali 2025</div></div>
    </div>

    <div class="feed">
      ${Object.keys(groups).map(date => `
        <div class="date-header">${new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}</div>
        <div class="grid">
          ${groups[date].map(p => `<div class="tile" onclick="openViewer('${p.id}')"><img src="${p.src}"></div>`).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

function renderCollections() {
  return `
    <div class="top-bar">
      <div class="logo-area" style="font-size: 22px;">Library</div>
      <div class="top-actions">
        <img src="assets/photos/aarav.jpg" class="avatar" alt="Me">
      </div>
    </div>
    <div class="collections-grid">
      <div class="album-card" onclick="navigate('#/people')">
        <div class="album-cover faces-grid">
           <img src="${PEOPLE[1].face}">
           <img src="${PEOPLE[3].face}">
           <img src="${PEOPLE[4].face}">
           <img src="${PEOPLE[2].face}">
        </div>
        <div class="album-title">People & Pets</div>
      </div>
      <div class="album-card">
        <div class="album-cover"><img src="assets/photos/himalaya.jpg"></div>
        <div class="album-title">Places</div>
      </div>
    </div>
  `;
}

function renderPeople() {
  return `
    <div class="top-bar">
      <div class="logo-area">
        <button onclick="navigate('#/collections')"><span class="ms">arrow_back</span></button>
        <span style="margin-left: 12px; font-size: 20px;">People</span>
      </div>
    </div>
    <div class="people-grid">
      ${PEOPLE.map(p => `
        <div class="person-item" onclick="navigate('#/person/${p.id}')">
          <img src="${p.face}" alt="${p.name}">
          <div class="person-name">${p.short}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPerson() {
  const person = PEOPLE.find(p => p.id === state.searchPersonContext);
  if (!person) { navigate('#/people'); return ''; }

  const personPhotos = PHOTOS.filter(p => p.people.includes(person.id));

  return `
    <div class="top-bar">
      <div class="logo-area">
        <button onclick="navigate('#/people')"><span class="ms">arrow_back</span></button>
      </div>
    </div>
    
    <div class="person-hero">
      <img src="${person.face}">
      <h2>${person.name}</h2>
      <button class="inside-search-btn" onclick="navigate('#/search')">
        <span class="ms">search</span> Search inside ${person.short}'s photos
      </button>
    </div>

    <div class="grid" style="padding-top: 16px;">
      ${personPhotos.map(p => `<div class="tile" onclick="openViewer('${p.id}')"><img src="${p.src}"></div>`).join('')}
    </div>
  `;
}

function renderSearch() {
  const isPerson = state.searchPersonContext;
  const person = isPerson ? PEOPLE.find(p => p.id === isPerson) : null;
  const placeholder = isPerson ? `Search ${person.short}'s photos...` : 'Search your photos';

  let q = state.searchQuery.trim();
  if (isPerson) q = appendClue(q, person.short);

  const parsed = parseQuery(q);
  const pool = isPerson ? PHOTOS.filter(p => p.people.includes(isPerson)) : PHOTOS;
  const res = runSearch(parsed, pool);
  
  const strength = searchStrength(parsed);
  const hint = searchHint(parsed);
  const chips = clueChips(parsed);
  const displayChips = chips.filter(c => !(isPerson && c.dim === 'who' && c.value === isPerson));

  let bodyHtml = '';

  if (!state.searchQuery.trim() && !isPerson) {
    bodyHtml = `
      <div class="black-screen">
        <div class="search-prompt">
          <h2>Try searching by what you remember</h2>
          <div class="prompt-grid">
            <div class="prompt-chip who">
              <span class="ms">person</span>
              <span class="label">Who was there?</span>
            </div>
            <div class="prompt-chip what">
              <span class="ms">celebration</span>
              <span class="label">What occasion?</span>
            </div>
            <div class="prompt-chip when">
              <span class="ms">calendar_month</span>
              <span class="label">Roughly when?</span>
            </div>
            <div class="prompt-chip where">
              <span class="ms">landscape</span>
              <span class="label">Where was it?</span>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    bodyHtml = `
      <div class="coaching-box">
        <div class="coaching-header">
          <span>Findability: ${strength.label}</span>
          <div class="meter-bar">
            <div class="meter-fill" style="width: ${strength.pct}%; background: ${strength.level >= 3 ? '#A8DAB5' : strength.level >= 2 ? '#FDE293' : '#F6AEA9'}"></div>
          </div>
        </div>
        <div class="coaching-text">${hint.html}</div>
      </div>
      
      ${displayChips.length > 0 ? `
        <div class="active-chips">
          ${displayChips.map(c => `
            <div class="filter-chip" data-remove="${c.dim}:${c.value}">
              ${c.label} <span class="ms">close</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${res.results.length > 0 ? `
        <div class="refinements-scroll">
          ${refinements(res.results, parsed, { exclude: isPerson }).map(r => `
            <button class="refine-btn" data-add="${r.text}">
              ${r.face ? `<img src="${r.face}">` : ''} + ${r.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
      
      ${res.lowConfidence ? `<div style="padding: 0 16px 16px; color: #d7aefb; font-size: 14px;">Showing results based on clothing. Accuracy may be lower.</div>` : ''}
      ${res.results.length === 0 ? `<div style="padding: 32px; text-align: center; color: var(--on-surface-variant);">No photos found</div>` : ''}
      
      <div class="grid">
        ${res.results.map(p => `<div class="tile" onclick="openViewer('${p.id}')"><img src="${p.src}"></div>`).join('')}
      </div>
    `;
  }

  return `
    <div class="top-bar search-mode">
      <button onclick="navigate('${isPerson ? '#/person/'+isPerson : '#/photos'}')"><span class="ms">arrow_back</span></button>
      <div class="search-input-wrapper">
        <input type="text" id="search-input" value="${state.searchQuery}" placeholder="${placeholder}" autocomplete="off" autofocus>
        ${state.searchQuery ? `<button id="clear-search"><span class="ms" style="font-size: 20px;">close</span></button>` : ''}
      </div>
    </div>
    <div id="search-body">
      ${bodyHtml}
    </div>
  `;
}

function attachSearchEvents() {
  const input = $('#search-input');
  if (!input) return;
  
  setTimeout(() => input.focus(), 100);

  input.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderRoute(); // re-render whole search screen
  });
  
  const clearBtn = $('#clear-search');
  if (clearBtn) {
      clearBtn.addEventListener('click', () => {
          state.searchQuery = '';
          renderRoute();
      });
  }

  $$('.filter-chip').forEach(el => el.addEventListener('click', (e) => {
    const [dim, val] = e.currentTarget.dataset.remove.split(':');
    let sq = removeClue(state.searchQuery, dim, val);
    state.searchQuery = sq;
    renderRoute();
  }));

  $$('.refine-btn').forEach(el => el.addEventListener('click', (e) => {
    state.searchQuery = appendClue(state.searchQuery, e.currentTarget.dataset.add);
    renderRoute();
  }));
}

// --- Interactions ---

function openViewer(id) {
  const p = PHOTOS.find(x => x.id === id);
  if (!p) return;
  const v = $('#viewer-root');
  v.innerHTML = `
    <div class="viewer-modal">
      <div class="viewer-top">
        <button onclick="document.getElementById('viewer-root').innerHTML=''"><span class="ms">arrow_back</span></button>
      </div>
      <div class="viewer-img">
        <img src="${p.src}">
      </div>
      <div class="viewer-bottom">
        <div class="date">${new Date(p.date).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'})}</div>
      </div>
    </div>
  `;
}

// Init
window.addEventListener('load', () => {
  const hash = window.location.hash || '#/photos';
  navigate(hash);
});
