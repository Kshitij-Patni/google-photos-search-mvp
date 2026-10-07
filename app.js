/* =========================================================
   Application UI Logic for Google Photos MVP
   ========================================================= */

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// Global State
let state = {
  route: '',
  searchQuery: '',
  searchPersonContext: null, // If searching inside a specific person's photos
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

  renderRoute();
});

function renderRoute() {
  // Hide all screens
  $$('.screen').forEach(s => s.classList.remove('active'));
  $$('.nav-item').forEach(btn => btn.classList.remove('active'));

  // Show active screen
  const s = $(`#s-${state.route}`);
  if (s) s.classList.add('active');

  // Activate nav button
  const n = $(`#nav-${state.route}`);
  if (n) n.classList.add('active');

  // Handle specific routes
  if (state.route === 'photos') renderPhotos();
  else if (state.route === 'search') renderSearch();
  else if (state.route === 'collections') renderCollections();
  else if (state.route === 'people') renderPeople();
  else if (state.route === 'person') renderPerson();

  // Highlight step in left pane
  $$('.step').forEach(btn => btn.classList.remove('active'));
  const stepBtn = $(`.step[data-href="${window.location.hash}"]`) || 
                  (state.route === 'person' ? $(`.step[data-href="#/person/ananya"]`) : null);
  if (stepBtn) stepBtn.classList.add('active');
}

// --- Screens ---

function renderPhotos() {
  const s = $('#s-photos');
  s.innerHTML = `
    <div class="top-bar">
      <div class="logo">Google Photos <span>MVP</span></div>
      <div class="avatar"><img src="assets/photos/aarav.jpg" alt="Me"></div>
    </div>
    
    <div class="home-search-nudge" data-action="go" data-href="#/search">
      <span class="ms pulse-icon">search</span>
      <div class="nudge-text">
        <b>Search your photos</b>
        <span class="nudge-tip">${OPEN_TIPS[state.opens % OPEN_TIPS.length].body}</span>
      </div>
    </div>
    
    <div class="memories">
      <div class="mem-card"><img src="assets/photos/wedding_bride.jpg"><span>1 year ago</span></div>
      <div class="mem-card"><img src="assets/photos/trek.jpg"><span>Manali memories</span></div>
      <div class="mem-card"><img src="assets/photos/goa_beach.jpg"><span>Recent highlights</span></div>
    </div>

    <div class="feed">
      ${PHOTOS.map(p => `<div class="p-thumb" style="background-image:url(${p.src})" data-action="view" data-id="${p.id}"></div>`).join('')}
    </div>
  `;
}

function renderCollections() {
  const s = $('#s-collections');
  s.innerHTML = `
    <div class="top-bar">
      <h2>Collections</h2>
    </div>
    <div class="albums">
      <div class="album-card" data-action="go" data-href="#/people">
        <div class="album-faces">
           <img src="${PEOPLE[1].face}">
           <img src="${PEOPLE[3].face}">
           <img src="${PEOPLE[4].face}">
           <img src="${PEOPLE[2].face}">
        </div>
        <b>People & Pets</b>
      </div>
      <div class="album-card" data-action="toast" data-msg="Places not implemented in this demo">
        <div class="album-cover" style="background-image:url(assets/photos/himalaya.jpg)"></div>
        <b>Places</b>
      </div>
    </div>
  `;
}

function renderPeople() {
  const s = $('#s-people');
  s.innerHTML = `
    <div class="top-bar">
      <button class="icon-btn" data-action="go" data-href="#/collections"><span class="ms">arrow_back</span></button>
      <h2>People</h2>
    </div>
    <div class="face-grid">
      ${PEOPLE.map(p => `
        <div class="face-item" data-action="go" data-href="#/person/${p.id}">
          <img src="${p.face}" alt="${p.name}">
          <span>${p.short}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPerson() {
  const s = $('#s-person');
  const person = PEOPLE.find(p => p.id === state.searchPersonContext);
  if (!person) return navigate('#/people');

  const personPhotos = PHOTOS.filter(p => p.people.includes(person.id));

  s.innerHTML = `
    <div class="top-bar">
      <button class="icon-btn" data-action="go" data-href="#/people"><span class="ms">arrow_back</span></button>
      <h2>${person.name}</h2>
    </div>
    
    <div class="person-header">
      <img src="${person.face}" class="person-hero-face">
      <div class="person-search-box" data-action="go" data-href="#/search">
        <span class="ms">search</span> Search inside ${person.short}'s photos...
      </div>
    </div>

    <div class="feed">
      ${personPhotos.map(p => `<div class="p-thumb" style="background-image:url(${p.src})" data-action="view" data-id="${p.id}"></div>`).join('')}
    </div>
  `;
}

function renderSearch() {
  const s = $('#s-search');
  const isPerson = state.searchPersonContext;
  const person = isPerson ? PEOPLE.find(p => p.id === isPerson) : null;
  const placeholder = isPerson ? `Search ${person.short}'s photos...` : 'Search for a memory...';

  s.innerHTML = `
    <div class="search-header">
      <button class="icon-btn" data-action="go" data-href="${isPerson ? '#/person/'+isPerson : '#/photos'}"><span class="ms">arrow_back</span></button>
      <div class="search-input-wrap">
        ${isPerson ? `<div class="search-chip-person"><img src="${person.face}"></div>` : ''}
        <input type="text" id="search-input" value="${state.searchQuery}" placeholder="${placeholder}" autocomplete="off" autofocus>
        ${state.searchQuery ? `<button class="icon-btn clear-btn" id="clear-search"><span class="ms">close</span></button>` : ''}
      </div>
    </div>
    <div id="search-body"></div>
  `;

  const input = $('#search-input');
  // Re-focus hack for iOS
  setTimeout(() => input.focus(), 100);

  input.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    updateSearchBody();
  });
  
  if ($('#clear-search')) {
      $('#clear-search').addEventListener('click', () => {
          state.searchQuery = '';
          input.value = '';
          updateSearchBody();
          input.focus();
      });
  }

  updateSearchBody();
}

function updateSearchBody() {
  const body = $('#search-body');
  const isPerson = state.searchPersonContext;
  let q = state.searchQuery.trim();
  
  if (isPerson) {
      q = appendClue(q, PEOPLE.find(p => p.id === isPerson).short);
  }

  if (!state.searchQuery.trim() && !isPerson) {
    // Empty state
    body.innerHTML = `
      <div class="search-empty">
        <div class="recall-prompt">
          <h3>Try searching by what you remember</h3>
          <div class="dim"><span class="ms" style="color:var(--c-who)">person</span> Who was there?</div>
          <div class="dim"><span class="ms" style="color:var(--c-what)">celebration</span> What was the occasion?</div>
          <div class="dim"><span class="ms" style="color:var(--c-when)">calendar_month</span> Roughly when?</div>
          <div class="dim"><span class="ms" style="color:var(--c-where)">landscape</span> Where was it?</div>
        </div>
        <div class="examples">
          <h4>Examples</h4>
          ${HOME_EXAMPLES.map(ex => `<div class="ex-chip" data-q="${ex}">${ex}</div>`).join('')}
        </div>
      </div>
    `;
    
    $$('.ex-chip').forEach(el => el.addEventListener('click', (e) => {
      state.searchQuery = e.target.dataset.q;
      renderSearch();
    }));
    return;
  }

  // Active search
  const parsed = parseQuery(q);
  
  // If we are in a person context, the pool is pre-filtered
  const pool = isPerson ? PHOTOS.filter(p => p.people.includes(isPerson)) : PHOTOS;
  const res = runSearch(parsed, pool);
  
  const strength = searchStrength(parsed);
  const hint = searchHint(parsed);
  const chips = clueChips(parsed);
  
  // Don't show the person chip in the search input area if they are implicitly added by context
  const displayChips = chips.filter(c => !(isPerson && c.dim === 'who' && c.value === isPerson));

  body.innerHTML = `
    <div class="search-meta">
      <div class="strength-meter level-${strength.level}">
        <div class="bars"><i class="b1"></i><i class="b2"></i><i class="b3"></i><i class="b4"></i><i class="b5"></i></div>
        <span>${strength.label}</span>
      </div>
      <div class="coach-hint tone-${hint.tone}">
        <span class="ms">${hint.icon}</span> <span>${hint.html}</span>
      </div>
      
      ${displayChips.length > 0 ? `
        <div class="parsed-chips">
          ${displayChips.map(c => `
            <div class="clue-chip dim-${c.dim}" data-remove="${c.dim}:${c.value}">
              ${c.label} <span class="ms">close</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${res.results.length > 0 ? `
        <div class="refinements">
          ${refinements(res.results, parsed, { exclude: isPerson }).map(r => `
            <div class="ref-chip dim-${r.dim}" data-add="${r.text}">
              ${r.face ? `<img src="${r.face}">` : ''} + ${r.label}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    
    <div class="feed search-results">
      ${res.lowConfidence ? `<div class="warn-banner">Showing results based on clothing. Accuracy may be lower.</div>` : ''}
      ${res.results.length === 0 ? `<div class="no-results">No photos found</div>` : ''}
      ${res.results.map(p => `<div class="p-thumb" style="background-image:url(${p.src})" data-action="view" data-id="${p.id}"></div>`).join('')}
    </div>
  `;

  // Bind events
  $$('.clue-chip').forEach(el => el.addEventListener('click', (e) => {
    const [dim, val] = e.currentTarget.dataset.remove.split(':');
    let sq = removeClue(state.searchQuery, dim, val);
    if (isPerson && dim === 'who' && val === isPerson) {
        // trying to remove the context person? Not allowed in context search, just ignore
    } else {
        state.searchQuery = sq;
        renderSearch();
    }
  }));

  $$('.ref-chip').forEach(el => el.addEventListener('click', (e) => {
    state.searchQuery = appendClue(state.searchQuery, e.currentTarget.dataset.add);
    renderSearch();
  }));
}

// --- Interactions ---

document.body.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  
  const act = btn.dataset.action;
  
  if (act === 'go') {
    navigate(btn.dataset.href);
  }
  else if (act === 'toast') {
    showToast(btn.dataset.msg);
  }
  else if (act === 'view') {
    openViewer(btn.dataset.id);
  }
  else if (act === 'reopen') {
    state.opens++;
    state.route = 'photos';
    state.searchQuery = '';
    state.searchPersonContext = null;
    navigate('#/photos');
    showToast('Simulated app re-open');
  }
});

function openViewer(id) {
  const p = PHOTOS.find(x => x.id === id);
  if (!p) return;
  const v = $('#viewer');
  v.innerHTML = `
    <div class="v-top"><button class="icon-btn" onclick="document.getElementById('viewer').classList.add('hide')"><span class="ms">arrow_back</span></button></div>
    <div class="v-img"><img src="${p.src}"></div>
    <div class="v-bot">
      <b>${p.title}</b>
      <span>${new Date(p.date).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'})}</span>
    </div>
  `;
  v.classList.remove('hide');
}

function showToast(msg) {
  const t = $('#toast');
  t.innerText = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// Clock
setInterval(() => {
  const d = new Date();
  $('#clock').innerText = d.getHours() + ':' + d.getMinutes().toString().padStart(2, '0');
}, 1000);

// Init
window.addEventListener('load', () => {
  const hash = window.location.hash || '#/photos';
  navigate(hash);
});
