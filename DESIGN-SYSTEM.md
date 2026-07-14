# Holky v datech – Design System

Referenční dokument vizuálního stylu webu. Použij pro jakýkoliv další projekt komunity.

---

## Fonty

| Použití | Font | Zdroj |
|---|---|---|
| Tělo textu, UI | **Open Sans** | Google Fonts |
| Nadpisy (H1–H2) | **Raleway** | Google Fonts |

### Google Fonts import
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Raleway:wght@600;700;800&display=swap" rel="stylesheet" />
```

### Pravidla
- Kurzíva se **nepoužívá** nikdy
- Nadpisy: Raleway 700–800
- Perex / důraz: Open Sans 600
- Běžný text: Open Sans 400

---

## Barvy

| Název | Hex | Použití |
|---|---|---|
| **Zelená (primary)** | `#2a7a4b` | Tlačítka, akcenty, ikonky |
| **Tmavá zelená** | `#1a5233` | Hover stavy, tmavé akcenty |
| **Světlá zelená** | `#e8f5ee` | Pozadí karet, pills, hover |
| **Střední zelená** | `#c6e8d4` | Orámování, oddělovače |
| **Ink (text)** | `#111b14` | Hlavní text |
| **Ink soft (sekundární text)** | `#4a5e52` | Popisky, metadata |
| **Bílá** | `#ffffff` | Pozadí, text na zelené |
| **Off-white** | `#f7fbf8` | Alternativní sekce, formuláře |

### CSS proměnné (zkopíruj do nového projektu)
```css
:root {
  --green:       #2a7a4b;
  --green-light: #e8f5ee;
  --green-mid:   #c6e8d4;
  --green-dark:  #1a5233;
  --ink:         #111b14;
  --ink-soft:    #4a5e52;
  --white:       #ffffff;
  --off-white:   #f7fbf8;
}
```

---

## Tvary a stíny

| Vlastnost | Hodnota |
|---|---|
| Zaoblení (velké) | `16px` |
| Zaoblení (malé) | `8px` |
| Zaoblení (pill/badge) | `100px` |
| Stín (normální) | `0 4px 24px rgba(42,122,75,.12)` |
| Stín (velký) | `0 12px 40px rgba(42,122,75,.18)` |

---

## Typografická škála

| Element | Font | Velikost | Váha |
|---|---|---|---|
| H1 (hero) | Raleway | `clamp(1.75rem, 3.5vw, 2.5rem)` | 700 |
| H2 (sekce) | Raleway | `clamp(2rem, 4vw, 2.75rem)` | 700 |
| H3 (karty) | Open Sans | `1.125rem` | 700 |
| Perex | Open Sans | `1.0625rem` | 400 |
| Tělo textu | Open Sans | `0.9375rem` | 400 |
| Malý text / poznámky | Open Sans | `0.875rem` | 400 |
| Badge / pill | Open Sans | `0.8125rem` | 600 |

---

## Komponenty

### Tlačítko (primární)
```css
background: #2a7a4b;
color: #ffffff;
border: 2px solid #2a7a4b;
border-radius: 100px;
padding: 12px 24px;
font-weight: 600;
```

### Tlačítko (ghost)
```css
background: transparent;
color: #2a7a4b;
border: 2px solid #2a7a4b;
border-radius: 100px;
```

### Badge / Pill
```css
background: #e8f5ee;
color: #1a5233;
border-radius: 100px;
padding: 4px 14px;
font-size: 0.8125rem;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.04em;
```

### Karta
```css
background: #f7fbf8;
border: 1px solid #c6e8d4;
border-radius: 16px;
padding: 32px 28px;
```

### Karta akce (nadcházející akce)
Nadcházející akce (sekce „Co nás čeká") se řadí vedle sebe ve dvousloupcové mřížce (`.events`, `grid-template-columns: 1fr 1fr`, na mobilu 1 sloupec). Barevné pravidlo: **první (nejbližší) nadcházející akce má zelené pozadí** (`.event-card--featured`), **ostatní akce mají světlé pozadí** (výchozí `.event-card`). Nejde o „hlavní vs. vedlejší" akci, ale čistě o pořadí podle termínu.

Struktura karty (`article.event-card`):
1. **Datum** (`.event-card__date`) – velké zelené číslo dne + zkratka měsíce pod ním. Pokud termín ještě není potvrzený, použij `.event-card__date--tbd` a místo čísla dej `?` + rok.
2. **Pill** (`.pill.pill--sm`) – místo/formát a čas, např. „Brno · 17:30" nebo „Online · připravujeme".
3. **Nadpis** (`h3`) – název akce.
4. **Podnadpis** (`.event-card__subtitle`) – doplňující řádek (místo konání, jméno hosta apod.), tenčí a světlejší než nadpis.
5. **Popis** (`p`) – krátký text o akci.
6. **CTA tlačítko** (`.btn.btn--sm`, nebo `.btn--ghost` pro akce bez pevného termínu/registrace) – např. „Mám zájem" / „Přihlásit se" / „Dej mi vědět o termínu".
7. **Odkazy na kalendář** (`.event-card__cal`) – jen u akcí s potvrzeným termínem: „Google Kalendář" (odkaz na `calendar.google.com/calendar/render?action=TEMPLATE&...`) a „Stáhnout .ics" (statický soubor v `assets/ics/<slug>.ics`, atribut `download`). U akcí bez termínu se vynechávají.

Pro akce bez potvrzeného termínu (např. připravovaný webinář) se vynechává i CTA na registraci – místo toho odkaz vedoucí ke kontaktu/newsletteru (`#kontakt`), aby se lidé mohli přihlásit k odběru novinek.

---

## Structured data (JSON-LD)

Web nemá build krok, takže structured data v `<head>` (`application/ld+json`) se udržují ručně:

- **index.html** – Organization (+ founder Person), Event pro každou nadcházející akci v sekci „Co nás čeká". Při přidání/změně akce na stránce aktualizuj i odpovídající Event blok (datum, popis, odkaz).
- **mentoring.html** – Person (Renata) a FAQPage. **FAQPage musí 1:1 zrcadlit viditelný seznam `<details>/<summary>` v sekci FAQ** – při úpravě otázky nebo odpovědi v HTML uprav i text v JSON-LD, jinak se rozjedou.

Po nasazení ověřuj přes `validator.schema.org` a `search.google.com/test/rich-results`.

---

## Watchdog (watchdog.html)

Stránka zobrazuje poslední běh automatického "Watchdog" digestu (komunity/akce/tvorba kolem dat a AI v ČR), generovaného AI nástrojem (Claude Cowork) mimo tento web – zdrojová data žijí v `04_Research_agent/research-agent_Komunitni_a_datova_scena/output/watchdog-digests/`.

Web nemá build krok, takže se stránka aktualizuje ručně: při novém digestu nahraď obsah sekcí mezi hero bannerem (`.archiv-hero`) a patičkou novým obsahem, ideálně zachovej strukturu (`.digest-section-header`, `.digest-list`/`.digest-list-row`, `.digest-card`/`.digest-card--featured`, `.digest-subhead`, `.digest-empty`) – tyto třídy jsou navržené přesně podle formátu, ve kterém Watchdog digest vychází, takže kopírování obsahu vyžaduje minimum úprav. Nezapomeň aktualizovat i `meta`/`digest-meta` řádek s datem poslední aktualizace a obdobím nahoře, a `lastmod` v `sitemap.xml`.

Zobrazuje jen nejnovější digest, žádný archiv starších (rozhodnutí: jednoduchost před úplností).

---

## Assets

| Soubor | Popis |
|---|---|
| `assets/logo.png` | Logo – zelená varianta, průhledné pozadí |
| `assets/favicon.svg` | Favicon – zelené pozadí, bílé datové sloupce |
| `assets/Renata.png` | Foto zakladatelky |
| `assets/fotky/` | Fotky z akcí (barevné) |
| `assets/fotky_zelene/` | Fotky z akcí (zelený tón, hero slideshow) |
| `assets/Fotky z akci/` | Fotky rozdělené podle jednotlivých meetupů |

---

## Kontakty komunity

| Kanál | Adresa |
|---|---|
| E-mail | info@holkyvdatech.cz |
| Instagram | @holkyvdatech |
| LinkedIn (komunita) | linkedin.com/company/holky-v-datech |
| LinkedIn (Renata) | linkedin.com/in/renáta-kuchařová-84067116 |
| Ecomail seznam | https://holkyvdatech.ecomailapp.cz/public/subscribe/2/... |
