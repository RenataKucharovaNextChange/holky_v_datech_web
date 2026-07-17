// Renders "Co nás čeká" / "Co jsme už zažily" from events.json.
// Past/future split is a plain string compare on ISO dates (YYYY-MM-DD sorts
// lexicographically), so no timezone-sensitive Date math is needed for it.
(function () {
  const UPCOMING_CONTAINER_ID = 'events-upcoming';
  const HISTORY_LIST_ID = 'history-list';

  const TYPE_LABELS = { meetup: 'Meetup', mastermind: 'Mastermind', masterclass: 'Masterclass', webinar: 'Webinář' };
  const MONTHS_SHORT = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];

  function pad(n) { return String(n).padStart(2, '0'); }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function formatCzDate(dateStr) {
    const [y, m, d] = dateStr.split('-');
    return `${d}. ${m}. ${y}`;
  }

  // Google Calendar / ICS need UTC instants. Parsing "date+time" without a
  // zone makes JS treat it as the visitor's local time — correct enough
  // since this is a Czech community site whose visitors are in Europe/Prague.
  function parseEventStart(ev) {
    return new Date(`${ev.date}T${ev.time || '00:00'}:00`);
  }

  function toUTCStamp(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  function googleCalendarUrl(ev) {
    const start = parseEventStart(ev);
    const end = new Date(start.getTime() + (ev.durationMinutes || 60) * 60000);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: ev.title,
      dates: `${toUTCStamp(start)}/${toUTCStamp(end)}`,
      details: ev.description || '',
      location: ev.location || ''
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
  }

  function icsEscape(str) {
    return String(str || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  }

  function buildICS(ev) {
    const start = parseEventStart(ev);
    const end = new Date(start.getTime() + (ev.durationMinutes || 60) * 60000);
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//holky_v_datech//events//CS',
      'BEGIN:VEVENT',
      `UID:${ev.id}@holkyvdatech.cz`,
      `DTSTAMP:${toUTCStamp(new Date())}`,
      `DTSTART:${toUTCStamp(start)}`,
      `DTEND:${toUTCStamp(end)}`,
      `SUMMARY:${icsEscape(ev.title)}`,
      `DESCRIPTION:${icsEscape(ev.description)}`,
      `LOCATION:${icsEscape(ev.location)}`,
      ev.registrationUrl ? `URL:${icsEscape(ev.registrationUrl)}` : null,
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
  }

  function downloadICS(ev) {
    const blob = new Blob([buildICS(ev)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ev.id}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function renderUpcomingCard(ev, isFeatured) {
    const article = document.createElement('article');
    article.className = 'event-card'
      + (isFeatured ? ' event-card--featured' : '')
      + (ev.status === 'tba' || ev.status === 'planning' ? ' event-card--tba' : '');

    const dateEl = document.createElement('div');
    dateEl.className = 'event-card__date';
    if (ev.date) {
      const [, month, day] = ev.date.split('-');
      dateEl.innerHTML = `<span class="event-card__day">${day}</span><span class="event-card__month">${MONTHS_SHORT[parseInt(month, 10) - 1]}</span>`;
    } else {
      dateEl.classList.add('event-card__date--tbd');
      dateEl.innerHTML = `<span class="event-card__day">?</span><span class="event-card__month">Plánujeme</span>`;
    }

    const body = document.createElement('div');
    body.className = 'event-card__body';

    if (isFeatured) {
      const badge = document.createElement('span');
      badge.className = 'event-card__badge';
      badge.textContent = 'Už brzy';
      body.appendChild(badge);
    }

    const metaPill = document.createElement('span');
    metaPill.className = 'pill pill--sm';
    metaPill.textContent = ev.time ? `${ev.format} · ${ev.time}` : ev.format;
    body.appendChild(metaPill);

    const h3 = document.createElement('h3');
    const descP = document.createElement('p');

    if (ev.status === 'planning') {
      h3.textContent = `Připravujeme další ${(TYPE_LABELS[ev.type] || ev.type).toLowerCase()}`;
      descP.textContent = ev.description;
      body.append(h3, descP);

      const cta = document.createElement('a');
      cta.className = 'btn btn--sm';
      cta.href = ev.ctaHref || 'index.html#kontakt';
      cta.textContent = ev.ctaLabel || 'Napsat nám tip';
      if (/^https?:/.test(ev.ctaHref || '')) { cta.target = '_blank'; cta.rel = 'noopener'; }
      body.appendChild(cta);
    } else if (ev.status === 'tba') {
      h3.textContent = `${TYPE_LABELS[ev.type] || ev.type} – termín potvrzen`;
      descP.textContent = 'Téma upřesníme.';
      body.append(h3, descP);

      const cta = document.createElement('a');
      cta.className = 'btn btn--sm';
      cta.href = 'index.html#kontakt';
      cta.textContent = 'Chci upozornění';
      body.appendChild(cta);
    } else {
      h3.textContent = ev.title;
      body.appendChild(h3);

      if (ev.topic) {
        const topicP = document.createElement('p');
        topicP.className = 'event-card__topic';
        topicP.textContent = ev.topic;
        body.appendChild(topicP);
      }

      descP.textContent = ev.description;
      body.appendChild(descP);

      const actions = document.createElement('div');
      actions.className = 'event-card__actions';
      const cta = document.createElement('a');
      cta.className = 'btn btn--sm';
      cta.href = ev.registrationUrl;
      cta.textContent = 'Přihlásit se';
      if (/^https?:/.test(ev.registrationUrl || '')) { cta.target = '_blank'; cta.rel = 'noopener'; }
      actions.appendChild(cta);
      body.appendChild(actions);

      const calRow = document.createElement('div');
      calRow.className = 'event-card__calendar';

      const gcal = document.createElement('a');
      gcal.href = googleCalendarUrl(ev);
      gcal.target = '_blank';
      gcal.rel = 'noopener';
      gcal.className = 'event-card__cal-link';
      gcal.textContent = 'Google Kalendář';
      calRow.appendChild(gcal);

      const icsBtn = document.createElement('button');
      icsBtn.type = 'button';
      icsBtn.className = 'event-card__cal-link';
      icsBtn.textContent = 'Stáhnout .ics';
      icsBtn.addEventListener('click', () => downloadICS(ev));
      calRow.appendChild(icsBtn);

      body.appendChild(calRow);
    }

    article.append(dateEl, body);
    return article;
  }

  function renderHistoryItem(ev) {
    const a = document.createElement('a');
    a.className = 'history-item';
    a.href = ev.archiveSlug ? `archiv.html#${ev.archiveSlug}` : 'archiv.html';

    const dateSpan = document.createElement('span');
    dateSpan.className = 'history-item__date';
    dateSpan.textContent = formatCzDate(ev.date);

    const typeSpan = document.createElement('span');
    typeSpan.className = 'history-item__type' + (ev.format === 'Online' ? ' history-item__type--online' : '');
    typeSpan.textContent = ev.format;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'history-item__name';
    nameSpan.textContent = ev.title;

    const arrow = document.createElement('span');
    arrow.className = 'history-item__arrow';
    arrow.textContent = '→';

    a.append(dateSpan, typeSpan, nameSpan, arrow);
    return a;
  }

  // Mirrors the scroll-in fade used for statically-rendered cards in script.js,
  // since cards inserted after DOMContentLoaded miss that observer's initial pass.
  function fadeIn(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    const observer = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    }), { threshold: 0.1 });
    observer.observe(el);
  }

  async function init() {
    const upcomingContainer = document.getElementById(UPCOMING_CONTAINER_ID);
    const historyContainer = document.getElementById(HISTORY_LIST_ID);
    if (!upcomingContainer && !historyContainer) return;

    let events;
    try {
      const res = await fetch('events.json');
      events = await res.json();
    } catch (err) {
      console.error('Nepodařilo se načíst events.json', err);
      return;
    }

    const today = todayISO();
    const dated = events.filter(e => e.date);
    const undated = events.filter(e => !e.date);
    const upcoming = dated
      .filter(e => e.date >= today)
      .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
    const past = dated
      .filter(e => e.date < today)
      .sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));
    // Undated (still-being-planned) events have no natural sort position, so they
    // always trail the dated upcoming ones instead of competing with them.
    const upcomingAll = upcoming.concat(undated);

    if (upcomingContainer) {
      upcomingContainer.innerHTML = '';
      if (!upcomingAll.length) {
        const p = document.createElement('p');
        p.textContent = 'Právě nemáme naplánovanou žádnou akci. Sleduj nás, ať ti nic neuteče.';
        upcomingContainer.appendChild(p);
      } else {
        upcomingAll.forEach((ev, i) => {
          const card = renderUpcomingCard(ev, i === 0 && Boolean(ev.date));
          upcomingContainer.appendChild(card);
          fadeIn(card);
        });
      }
    }

    if (historyContainer) {
      historyContainer.innerHTML = '';
      past.forEach(ev => historyContainer.appendChild(renderHistoryItem(ev)));
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
