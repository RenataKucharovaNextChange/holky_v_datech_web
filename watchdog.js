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
  const NEAREST_LIMIT = 5;

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

  function renderNearestRow(item) {
    const row = el('div', 'digest-list-row');
    row.appendChild(el('strong', null, item.title + ' '));
    if (item.org) row.appendChild(pill(item.org));
    const meta = el('div', 'digest-meta', item.meta + ' ');
    appendLink(meta, item.url);
    row.appendChild(meta);
    return row;
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

  function renderCard(item) {
    const card = el('div', 'digest-card');
    const head = el('div');
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
    row.appendChild(el('strong', null, item.title));
    if (item.unverified) row.append(' ', pill('NEOVĚŘENO'));
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

    // "Nejbližší" — everything with a date, soonest first, regardless of category.
    const dated = active
      .filter(i => i.section !== 'alert' && (i.eventDate || i.deadlineDate))
      .sort((a, b) => {
        const da = a.deadlineDate || a.eventDate;
        const db = b.deadlineDate || b.eventDate;
        return da.localeCompare(db);
      })
      .slice(0, NEAREST_LIMIT);

    if (dated.length) {
      const header = el('div', 'digest-section-header');
      header.appendChild(pill('Nejbližší'));
      header.appendChild(el('h2', null, 'Deadliny a akce'));
      const list = el('div', 'digest-list');
      dated.forEach(item => list.appendChild(renderNearestRow(item)));
      mount.appendChild(buildSection(sectionToggle ? 'section--off' : '', [header, list]));
      sectionToggle = !sectionToggle;
    }

    // Proactive alerts, own featured section.
    const alerts = active.filter(i => i.section === 'alert');
    if (alerts.length) {
      mount.appendChild(buildSection(sectionToggle ? 'section--off' : '', alerts.map(renderAlertCard)));
      sectionToggle = !sectionToggle;
    }

    // Category sections: Holky / Data / AI, each split into Akce (cards) / Obsah (list rows).
    ['Holky', 'Data', 'AI'].forEach(category => {
      const items = active.filter(i => i.category === category && i.section !== 'alert');
      if (!items.length) return;

      const children = [el('div', 'digest-section-header', null)];
      children[0].appendChild(el('h2', null, category));

      const akce = items.filter(i => i.section === 'akce');
      if (akce.length) {
        children.push(el('h3', 'digest-subhead', 'Akce'));
        akce.forEach(item => children.push(renderCard(item)));
      }

      const obsah = items.filter(i => i.section === 'obsah');
      if (obsah.length) {
        children.push(el('h3', 'digest-subhead', 'Obsah'));
        const list = el('div', 'digest-list');
        obsah.forEach(item => list.appendChild(renderListRow(item)));
        children.push(list);
      }

      mount.appendChild(buildSection(sectionToggle ? 'section--off' : '', children));
      sectionToggle = !sectionToggle;
    });

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
