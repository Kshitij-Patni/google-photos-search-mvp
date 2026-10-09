/* =========================================================
   Application UI Logic for Realistic Google Photos MVP (Redesigned)
   ========================================================= */

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

let state = {
  route: 'photos',
  searchQuery: '',
  searchPersonContext: null,
  opens: 0
};

// --- Robust Routing ---
function handleRouting() {
  const hash = window.location.hash || '#/photos';
  const parts = hash.split('/');
  state.route = parts[1] || 'photos';
  
  if (state.route === 'person') {
    state.searchPersonContext = parts[2];
  } else {
    state.searchPersonContext = null;
  }

  if (state.route === 'photos') state.opens++;

  renderRoute();
}

function navigate(hash) {
  if (!hash) hash = '#/photos';
  if (window.location.hash === hash) {
    if (state.route === 'search') {
      const input = $('#search-input');
      if (input) {
        input.focus();
        const len = input.value.length;
        input.setSelectionRange(len, len);
        return;
      }
    }
    handleRouting();
  } else {
    window.location.hash = hash;
  }
}

window.addEventListener('hashchange', handleRouting);

function renderRoute() {
  if (!state.route) {
    const hash = window.location.hash || '#/photos';
    const parts = hash.split('/');
    state.route = parts[1] || 'photos';
  }

  $$('.nav-pill-item').forEach(btn => btn.classList.remove('active'));

  let activeNav = state.route;
  if (state.route === 'people' || state.route === 'person') activeNav = 'collections';
  
  const n = $(`#nav-${activeNav}`);
  if (n) n.classList.add('active');

  const bottomContainer = $('#bottomNavContainer');
  if (bottomContainer) {
    if (state.route === 'search' || state.route === 'person') {
      bottomContainer.style.display = 'none';
    } else {
      bottomContainer.style.display = 'flex';
    }
  }

  const root = $('#app-root');
  if (!root) return;

  if (state.route === 'search') {
    root.classList.add('search-active');
  } else {
    root.classList.remove('search-active');
  }

  try {
    if (state.route === 'photos') root.innerHTML = renderPhotos();
    else if (state.route === 'search') root.innerHTML = renderSearch();
    else if (state.route === 'collections') root.innerHTML = renderCollections();
    else if (state.route === 'create') root.innerHTML = renderCreate();
    else if (state.route === 'people') root.innerHTML = renderPeople();
    else if (state.route === 'person') root.innerHTML = renderPerson();
    else root.innerHTML = renderPhotos();
  } catch (err) {
    console.error("Error rendering route:", err);
    root.innerHTML = renderPhotos();
  }

  if (state.route === 'photos') {
    startTicker();
  } else {
    stopTicker();
  }

  if (state.route === 'search') attachSearchEvents();
}

// --- Screens ---

function renderPhotos() {
  const photoList = (typeof PHOTOS !== 'undefined' && Array.isArray(PHOTOS)) ? PHOTOS : [];
  const sortedPhotos = [...photoList].sort((a,b) => b.date.localeCompare(a.date));
  
  // Group by date
  const groups = {};
  sortedPhotos.forEach(p => {
    if(!groups[p.date]) groups[p.date] = [];
    groups[p.date].push(p);
  });

  return `
    <!-- Top Action Bar (Matching Official Redesign) -->
    <div class="top-bar">
      <!-- Backup complete pill button -->
      <div class="backup-pill" title="Backup Complete">
        <span>Backup complete</span>
      </div>
      <!-- Right Action Cluster: Add, Notifications, Avatar K -->
      <div class="top-actions">
        <div class="action-icon" title="Add" onclick="navigate('#/create')">
          <span class="ms">add</span>
          <div class="red-dot"></div>
        </div>
        <div class="action-icon" title="Notifications" onclick="alert('No new notifications')">
          <span class="ms">notifications</span>
        </div>
        <div class="profile-avatar" title="Account">
          k
        </div>
      </div>
    </div>

    <!-- Creative AI Keyword Discovery Hero Card -->
    <div class="ai-discovery-card" id="aiDiscoveryCard">
      <div class="discovery-header">
        <div class="discovery-badge">
          <span class="ms" style="font-size:16px; color:#A8C7FA;">auto_awesome</span>
          <span>KEYWORD SEARCH</span>
        </div>
        <button class="discovery-info-btn" onclick="openSearchHelpModal()" title="How it works">
          <span class="ms" style="font-size:18px;">help_outline</span>
        </button>
      </div>

      <div class="discovery-title">Find photos by what you remember</div>
      <div class="discovery-desc">
        Type any clues — <b>who</b> was there, <b>what</b> event, <b>where</b>, or rough <b>year</b>:
      </div>

      <!-- Live Animated Ticker Demonstration -->
      <div class="keyword-simulator-box" onclick="navigate('#/search')">
        <div class="simulator-input">
          <span class="ms" style="font-size:18px; color:#A8C7FA;">search</span>
          <span class="simulated-text" id="simulatedTicker">"Ananya wedding Feb 2026"</span>
          <span class="ticker-cursor">|</span>
        </div>
        <div class="simulator-tags" id="simulatorTags">
          <span class="sim-tag who">Ananya</span>
          <span class="sim-tag what">Wedding</span>
          <span class="sim-tag when">Feb 2026</span>
        </div>
      </div>

      <!-- Quick Interactive Keyword Pills -->
      <div class="discovery-chips-row">
        <button class="discovery-pill" onclick="setSearchText('Ananya wedding Feb 2026')">
          <span>💍 Ananya wedding</span>
        </button>
        <button class="discovery-pill" onclick="setSearchText('Goa beach sunset last winter')">
          <span>🏖️ Goa beach sunset</span>
        </button>
        <button class="discovery-pill" onclick="setSearchText('Diwali 2025 with Mom')">
          <span>🪔 Diwali with Mom</span>
        </button>
        <button class="discovery-pill" onclick="setSearchText('Rohan in the mountains')">
          <span>⛰️ Rohan mountains</span>
        </button>
      </div>

      <div class="discovery-footer">
        <button class="how-it-works-btn" onclick="openSearchHelpModal()">
          <span>Learn 4-clue recall</span>
        </button>
        <button class="try-search-cta" onclick="navigate('#/search')">
          <span>Open Search</span> <span class="ms" style="font-size:16px;">arrow_forward</span>
        </button>
      </div>
    </div>
    
    <div class="memories-carousel">
      <div class="memory-card" onclick="openViewer('p11')"><img src="assets/photos/wedding_bride.jpg"><div class="title">1 year ago</div></div>
      <div class="memory-card" onclick="openViewer('p24')"><img src="assets/photos/trek.jpg"><div class="title">Manali memories</div></div>
      <div class="memory-card" onclick="openViewer('p16')"><img src="assets/photos/goa_beach.jpg"><div class="title">Recent highlights</div></div>
      <div class="memory-card" onclick="openViewer('p18')"><img src="assets/photos/diwali.jpg"><div class="title">Diwali 2025</div></div>
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
      <div class="backup-pill" style="border:none; background:transparent; padding:0;">
        <span style="font-family:var(--font-brand); font-size:22px; font-weight:500;">Collections</span>
      </div>
      <div class="top-actions">
        <div class="profile-avatar">k</div>
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
        <div class="album-title">People & Pets (6)</div>
      </div>
      <div class="album-card" onclick="navigate('#/search'); setTimeout(()=>{state.searchQuery='mountains'; renderRoute();}, 50);">
        <div class="album-cover"><img src="assets/photos/himalaya.jpg"></div>
        <div class="album-title">Places: Mountains & Goa</div>
      </div>
      <div class="album-card" onclick="navigate('#/search'); setTimeout(()=>{state.searchQuery='wedding'; renderRoute();}, 50);">
        <div class="album-cover"><img src="assets/photos/wedding_family.jpg"></div>
        <div class="album-title">Weddings & Ceremonies</div>
      </div>
      <div class="album-card" onclick="navigate('#/search'); setTimeout(()=>{state.searchQuery='diwali'; renderRoute();}, 50);">
        <div class="album-cover"><img src="assets/photos/rangoli.jpg"></div>
        <div class="album-title">Festivals: Diwali</div>
      </div>
    </div>
  `;
}

function renderCreate() {
  return `
    <div class="top-bar">
      <div class="backup-pill" style="border:none; background:transparent; padding:0;">
        <span style="font-family:var(--font-brand); font-size:22px; font-weight:500;">Create</span>
      </div>
      <div class="top-actions">
        <div class="profile-avatar">k</div>
      </div>
    </div>
    <div class="collections-grid">
      <div class="album-card" onclick="alert('✨ Generating Highlight Reel from your top photos!')">
        <div class="album-cover" style="display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #1a73e8, #7b1fa2);">
          <span class="ms" style="font-size:42px; color:#fff;">movie</span>
        </div>
        <div class="album-title">Highlight Video</div>
      </div>
      <div class="album-card" onclick="alert('📸 3D Cinematic Photo generator ready!')">
        <div class="album-cover" style="display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #2e7d32, #f57f17);">
          <span class="ms" style="font-size:42px; color:#fff;">auto_awesome</span>
        </div>
        <div class="album-title">Cinematic Photo</div>
      </div>
      <div class="album-card" onclick="alert('🎨 Collage generator opened!')">
        <div class="album-cover" style="display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #c2185b, #e65100);">
          <span class="ms" style="font-size:42px; color:#fff;">grid_view</span>
        </div>
        <div class="album-title">Photo Collage</div>
      </div>
      <div class="album-card" onclick="alert('🎞️ Animation creator ready!')">
        <div class="album-cover" style="display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg, #00838f, #0277bd);">
          <span class="ms" style="font-size:42px; color:#fff;">animation</span>
        </div>
        <div class="album-title">Animation</div>
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

function getSearchBodyHtml() {
  const isPerson = state.searchPersonContext;
  let q = state.searchQuery.trim();
  if (isPerson) {
    const person = PEOPLE.find(p => p.id === isPerson);
    if (person) q = appendClue(q, person.short);
  }

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
          <h2>Try searching what you remember</h2>
          
          <!-- Suggested Quick Queries -->
          <div class="quick-suggest-row">
            ${HOME_EXAMPLES.map(ex => `
              <div class="quick-chip" onclick="setSearchText('${ex.replace(/'/g, "\\'")}')">
                ✨ ${ex}
              </div>
            `).join('')}
          </div>

          <div class="prompt-grid">
            <div class="prompt-chip who" onclick="setSearchText('Aarav and Mom')">
              <span class="ms">person</span>
              <span class="label">Who was there?</span>
            </div>
            <div class="prompt-chip what" onclick="setSearchText('Wedding')">
              <span class="ms">celebration</span>
              <span class="label">What occasion?</span>
            </div>
            <div class="prompt-chip when" onclick="setSearchText('Last winter')">
              <span class="ms">calendar_month</span>
              <span class="label">Roughly when?</span>
            </div>
            <div class="prompt-chip where" onclick="setSearchText('Goa beach')">
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
      
      ${res.lowConfidence ? `<div style="padding: 0 16px 12px; color: #d7aefb; font-size: 13.5px;">Showing results based on clothing. Accuracy may be lower.</div>` : ''}
      ${res.results.length === 0 ? `<div style="padding: 32px; text-align: center; color: var(--on-surface-variant);">No photos found. Try a person, place, or rough year.</div>` : ''}
      
      <div class="grid">
        ${res.results.map(p => `<div class="tile" onclick="openViewer('${p.id}')"><img src="${p.src}"></div>`).join('')}
      </div>
    `;
  }
  return bodyHtml;
}

function renderSearch() {
  const isPerson = state.searchPersonContext;
  const person = isPerson ? PEOPLE.find(p => p.id === isPerson) : null;
  const placeholder = isPerson ? `Search ${person.short}'s photos...` : 'Search your photos by who, what, when, where...';

  return `
    <div class="top-bar search-mode">
      <button onclick="navigate('${isPerson ? '#/person/'+isPerson : '#/photos'}')"><span class="ms">arrow_back</span></button>
      <div class="search-input-wrapper">
        <input type="text" id="search-input" value="${state.searchQuery || ''}" placeholder="${placeholder}" autocomplete="off">
        <button id="clear-search" style="visibility: ${state.searchQuery ? 'visible' : 'hidden'};"><span class="ms" style="font-size: 20px;">close</span></button>
      </div>
    </div>
    <div id="search-body">
      ${getSearchBodyHtml()}
    </div>
  `;
}

function setSearchText(text) {
  state.searchQuery = text;
  if (state.route === 'search') {
    const input = $('#search-input');
    if (input) {
      input.value = text;
      input.focus();
      const len = text.length;
      input.setSelectionRange(len, len);
    }
    const clearBtn = $('#clear-search');
    if (clearBtn) clearBtn.style.visibility = text ? 'visible' : 'hidden';
    updateSearchBodyOnly();
  } else {
    navigate('#/search');
  }
}

let searchDebounceTimer = null;

function attachSearchEvents() {
  const input = $('#search-input');
  if (!input) return;

  // Focus safely and place cursor at end if text exists
  input.focus();
  const len = input.value.length;
  input.setSelectionRange(len, len);

  let isComposing = false;
  input.addEventListener('compositionstart', () => { isComposing = true; });
  input.addEventListener('compositionend', (e) => {
    isComposing = false;
    state.searchQuery = e.target.value;
    clearTimeout(searchDebounceTimer);
    updateSearchBodyOnly();
  });

  input.addEventListener('input', (e) => {
    if (isComposing) return;
    state.searchQuery = e.target.value;

    const clearBtn = $('#clear-search');
    if (clearBtn) {
      clearBtn.style.visibility = state.searchQuery ? 'visible' : 'hidden';
    }

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      updateSearchBodyOnly();
    }, 180);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(searchDebounceTimer);
      updateSearchBodyOnly();
      input.blur();
    }
  });

  const clearBtn = $('#clear-search');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.searchQuery = '';
      input.value = '';
      clearBtn.style.visibility = 'hidden';
      input.focus();
      updateSearchBodyOnly();
    });
  }

  attachSearchBodyEvents();
}

function updateSearchBodyOnly() {
  const searchBody = $('#search-body');
  if (searchBody) {
    searchBody.innerHTML = getSearchBodyHtml();
    attachSearchBodyEvents();
  }
}

function attachSearchBodyEvents() {
  $$('.filter-chip').forEach(el => el.addEventListener('click', (e) => {
    const [dim, val] = e.currentTarget.dataset.remove.split(':');
    let sq = removeClue(state.searchQuery, dim, val);
    state.searchQuery = sq;
    const input = $('#search-input');
    if (input) {
      input.value = sq;
      input.focus();
      const len = sq.length;
      input.setSelectionRange(len, len);
    }
    const clearBtn = $('#clear-search');
    if (clearBtn) clearBtn.style.visibility = sq ? 'visible' : 'hidden';
    updateSearchBodyOnly();
  }));

  $$('.refine-btn').forEach(el => el.addEventListener('click', (e) => {
    state.searchQuery = appendClue(state.searchQuery, e.currentTarget.dataset.add);
    const input = $('#search-input');
    if (input) {
      input.value = state.searchQuery;
      input.focus();
      const len = state.searchQuery.length;
      input.setSelectionRange(len, len);
    }
    const clearBtn = $('#clear-search');
    if (clearBtn) clearBtn.style.visibility = state.searchQuery ? 'visible' : 'hidden';
    updateSearchBodyOnly();
  }));
}

// --- Dynamic Ticker & Discovery Logic ---

const TICKER_SAMPLES = [
  { text: '"Ananya wedding Feb 2026"', tags: [{label:'Ananya', dim:'who'}, {label:'Wedding', dim:'what'}, {label:'Feb 2026', dim:'when'}] },
  { text: '"Me and Rohan in mountains"', tags: [{label:'Rohan', dim:'who'}, {label:'Mountains', dim:'where'}, {label:'Trek', dim:'what'}] },
  { text: '"Diwali 2025 with Mom and Dad"', tags: [{label:'Mom & Dad', dim:'who'}, {label:'Diwali', dim:'what'}, {label:'2025', dim:'when'}] },
  { text: '"Goa beach sunset last winter"', tags: [{label:'Goa Beach', dim:'where'}, {label:'Sunset', dim:'where'}, {label:'Winter', dim:'when'}] }
];

let tickerIdx = 0;
let tickerTimer = null;

function startTicker() {
  stopTicker();
  tickerTimer = setInterval(() => {
    tickerIdx = (tickerIdx + 1) % TICKER_SAMPLES.length;
    const item = TICKER_SAMPLES[tickerIdx];
    const textEl = document.getElementById('simulatedTicker');
    const tagsEl = document.getElementById('simulatorTags');
    if (textEl && tagsEl) {
      textEl.style.opacity = '0';
      tagsEl.style.opacity = '0';
      setTimeout(() => {
        const tEl = document.getElementById('simulatedTicker');
        const gEl = document.getElementById('simulatorTags');
        if (tEl && gEl) {
          tEl.textContent = item.text;
          gEl.innerHTML = item.tags.map(t => `<span class="sim-tag ${t.dim}">${t.label}</span>`).join('');
          tEl.style.opacity = '1';
          gEl.style.opacity = '1';
        }
      }, 200);
    }
  }, 3400);
}

function stopTicker() {
  if (tickerTimer) {
    clearInterval(tickerTimer);
    tickerTimer = null;
  }
}

function dismissCoachmark(e) {
  if (e) e.stopPropagation();
  const el = document.getElementById('searchCoachmark');
  if (el) el.style.display = 'none';
}

function openSearchHelpModal() {
  const el = document.getElementById('searchHelpModal');
  if (el) el.classList.add('open');
}

function closeSearchHelpModal(e) {
  const el = document.getElementById('searchHelpModal');
  if (el) el.classList.remove('open');
}

// --- Interactions ---

function openViewer(id) {
  const photoList = (typeof PHOTOS !== 'undefined' && Array.isArray(PHOTOS)) ? PHOTOS : [];
  const p = photoList.find(x => x.id === id);
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
        <div style="font-size: 15px; font-weight: 500; margin-bottom: 4px;">${p.title}</div>
        <div class="date">${new Date(p.date).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'})}</div>
      </div>
    </div>
  `;
}

// Safe single initialization
let appInitialized = false;
function initApp() {
  if (appInitialized) return;
  appInitialized = true;
  handleRouting();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
