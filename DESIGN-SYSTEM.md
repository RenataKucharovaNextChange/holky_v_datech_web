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
