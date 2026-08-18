// Renders the Watchdog digest from watchdog-items.json.
//
// The old flow regenerated watchdog.html from scratch on every run, so an
// item that wasn't "new" today (but was still perfectly current — an event
// that hasn't happened yet, a podcast with no newer episode) silently
// disappeared. This flow inverts that: watchdog-items.json is a persistent,
// append/upsert-only store (see 04_Research_agent instructions), and every
// item that hasn't expired renders here regardless of which run found it.
//
// Expiry rules (mirrors the auto-archive logic in events.js):
//  - items with an eventDate: active while eventDate >= today, same
//    lexicographic ISO-string compare as events.js (no Date math needed).
//  - items without an eventDate (recurring content/podcasts): active until
//    the ingestion step marks them status: "archived" because a newer item
//    with the same id-prefix/series superseded them.
//  - "status" is the ultimate gate either way — archived/resolved items
//    stay in the JSON for history/dedup but never render.
(function () {
  const MOUNT_ID = 'watchdog-content';
  const META_ID = 'digest-meta';

  function pad(n) { return String(n).padStart(2, '0'); }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function formatCzDate(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${parseInt(d, 10)}. ${parseInt(m, 10)}. ${y}`;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function pill(text, variant) {
    return el('span', variant ? `pill ${variant}` : 'pill', text);
  }

  function appendLink(container, url, label) {
    if (!url) return;
    container.append(' · ');
    const a = el('a', null, label || 'odkaz →');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    container.appendChild(a);
  }

  function isActive(item, today) {
    if (item.status !== 'active') return false;
    if (item.eventDate && item.eventDate < today) return false;
    return true;
  }

  function renderAlertCard(item) {
    const card = el('div', 'digest-card digest-card--featured');
    const head = el('div');
    head.appendChild(pill('Proaktivní upozornění'));
    card.appendChild(head);
    card.appendChild(el('h3', null, item.title));
    card.appendChild(el('div', 'digest-meta', item.meta));
    card.appendChild(el('div', null, item.note));
    return card;
  }

  // Alerts and unverified items are real but not load-bearing for a visitor's
  // first glance, so they're tucked behind a native <details> toggle at the
  // bottom of the page instead of competing with the clear category content.
  function renderUnclearSection(items) {
    const details = document.createElement('details');
    details.className = 'digest-unclear';
    const summary = document.createElement('summary');
    summary.className = 'digest-unclear__summary';
    summary.textContent = `Co ještě není jisté nebo si žádá pozornost (${items.length})`;
    details.appendChild(summary);

    const body = el('div', 'digest-unclear__body');
    items.forEach(item => body.appendChild(item.section === 'alert' ? renderAlertCard(item) : renderCard(item)));
    details.appendChild(body);
    return details;
  }

  // Category pill: Holky / Data / AI — shown on every card and list row so
  // items are identifiable at a glance now that Akce/Obsah span categories
  // instead of being grouped by them.
  function categoryPill(category) {
    return pill(category, 'pill--dark');
  }

  function renderCard(item) {
    const card = el('div', 'digest-card');
    const head = el('div');
    if (item.category) head.appendChild(categoryPill(item.category));
    if (item.format) head.appendChild(pill(item.format));
    if (item.updated) head.appendChild(pill('Aktualizace'));
    if (item.unverified) head.appendChild(pill('NEOVĚŘENO'));
    if (head.childNodes.length) card.appendChild(head);
    card.appendChild(el('h3', null, item.title));
    card.appendChild(el('div', 'digest-meta', item.org ? `${item.meta} · ${item.org}` : item.meta));
    if (item.note) card.appendChild(el('div', null, item.note));
    if (item.url) {
      const cta = el('a', 'btn btn--sm btn--ghost', 'Zjistit víc →');
      cta.href = item.url;
      cta.target = '_blank';
      cta.rel = 'noopener';
      card.appendChild(cta);
    }
    return card;
  }

  function renderListRow(item) {
    const row = el('div', 'digest-list-row');
    const head = el('div', null, null);
    head.style.marginBottom = '6px';
    if (item.category) head.appendChild(categoryPill(item.category));
    if (item.unverified) head.append(' ', pill('NEOVĚŘENO'));
    row.appendChild(head);
    row.appendChild(el('strong', null, item.title));
    const meta = el('div', 'digest-meta');
    meta.textContent = item.meta;
    appendLink(meta, item.url);
    row.appendChild(meta);
    if (item.note) row.appendChild(el('div', null, item.note));
    return row;
  }

  function buildSection(className, children) {
    const section = el('section', `section ${className}`.trim());
    const container = el('div', 'container container--narrow');
    children.forEach(c => container.appendChild(c));
    section.appendChild(container);
    return section;
  }

  function render(data) {
    const mount = document.getElementById(MOUNT_ID);
    const metaEl = document.getElementById(META_ID);
    if (!mount) return;

    const today = todayISO();
    const active = data.items.filter(item => isActive(item, today));

    if (metaEl) {
      metaEl.textContent = data.nextDiscoveryRun
        ? `Poslední aktualizace: ${formatCzDate(data.lastRun)} · Příští Discovery běh: ${formatCzDate(data.nextDiscoveryRun)}`
        : `Poslední aktualizace: ${formatCzDate(data.lastRun)}`;
    }

    mount.innerHTML = '';
    let sectionToggle = true; // alternate section / section--off like the static original

    // Akce / Obsah sections span all categories (Holky/Data/AI) — each item
    // carries its own category pill (and, for events, a format pill:
    // Online / Offline · město) instead of being grouped under a category
    // heading. Alerts and unverified items are excluded here — they render
    // in the collapsed "unclear" section at the bottom instead.
    const visible = active.filter(i => i.section !== 'alert' && !i.unverified);

    const akce = visible
      .filter(i => i.section === 'akce')
      .sort((a, b) => {
        if (!a.eventDate && !b.eventDate) return 0;
        if (!a.eventDate) return 1;
        if (!b.eventDate) return -1;
        return a.eventDate < b.eventDate ? -1 : a.eventDate > b.eventDate ? 1 : 0;
      });
    if (akce.length) {
      const children = [el('div', 'digest-section-header', null)];
      children[0].appendChild(el('h2', null, 'Akce'));
      akce.forEach(item => children.push(renderCard(item)));
      mount.appendChild(buildSection(sectionToggle ? 'section--off' : '', children));
      sectionToggle = !sectionToggle;
    }

    const obsah = visible.filter(i => i.section === 'obsah');
    if (obsah.length) {
      const children = [el('div', 'digest-section-header', null)];
      children[0].appendChild(el('h2', null, 'Obsah'));
      const list = el('div', 'digest-list');
      obsah.forEach(item => list.appendChild(renderListRow(item)));
      children.push(list);
      mount.appendChild(buildSection(sectionToggle ? 'section--off' : '', children));
      sectionToggle = !sectionToggle;
    }

    // Footer notes — entities actively watched with nothing new to show right now.
    if (data.notes && data.notes.length) {
      const header = el('div', 'digest-section-header');
      header.appendChild(el('h2', null, 'Sledováno, beze změny'));
      const notesEl = el('p', 'digest-empty');
      data.notes.forEach((note, i) => {
        if (i > 0) notesEl.appendChild(el('br'));
        notesEl.appendChild(document.createTextNode(note));
      });
      mount.appendChild(buildSection(sectionToggle ? 'section--off' : '', [header, notesEl]));
      sectionToggle = !sectionToggle;
    }

    // Alerts + unverified items, collapsed at the very bottom of the page.
    const unclear = active.filter(i => i.section === 'alert' || i.unverified);
    if (unclear.length) {
      mount.appendChild(buildSection(sectionToggle ? 'section--off' : '', [renderUnclearSection(unclear)]));
    }
  }

  async function init() {
    if (!document.getElementById(MOUNT_ID)) return;
    let data;
    try {
      const res = await fetch('watchdog-items.json');
      data = await res.json();
    } catch (err) {
      console.error('Nepodařilo se načíst watchdog-items.json', err);
      return;
    }
    render(data);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
