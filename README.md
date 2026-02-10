# Headless Lead Generation Funnel (NL)

Een hoog-converterende, snelle lead-generatie funnel gebouwd voor Vercel (Serverless) met Directus CMS integratie.

## 🚀 Architectuur & Logica

Deze funnel wijkt af van standaard Swipe-pagina's door een volledig 'headless' benadering. De flow is dynamisch en wordt aangestuurd door de CMS-configuratie.

### 1. Flow Engine (`initFlow-lite.js`)
De motor van de funnel. 
- Haalt de campagne-instellingen op via `/api/campaignVisuals.js`.
- Beheert de `flowOrder` (bijv: lander -> shortform -> coreg -> longform -> ivr -> sovendus).
- Update de **geïntegreerde progressiebalk** binnen de actieve kaart bij elke stap.

### 2. UI & Styling (`combined-coreg.css`)
- **Design System:** Gebruikt 'Montserrat' voor koppen en 'Inter' voor tekst.
- **Card-based Design:** Alle content wordt gerenderd in een witte kaart (`.flow-section`) met een subtiele, gelaagde schaduw en een radius van 12px.
- **Sticky Footer:** De layout is zo opgebouwd dat de content centraal staat en de footer pas onder de 'vouw' van de pagina verschijnt.

### 3. Coregificatie (`coregRenderer.js`)
Rendert dynamisch extra aanbiedingen van partners.
- **UI Styles:** Ondersteunt 'buttons' en 'dropdown'.
- **Direct Selection:** Bij dropdown-vragen wordt de keuze direct opgeslagen en gaat de funnel automatisch naar de volgende stap.
- **Negative Flow:** Elke vraag bevat een 'Nee, bedankt' optie die visueel ondergeschikt is aan de positieve actie.

### 4. Formulier Afhandeling (`formSubmit.js`)
- Beheert de Shortform validatie.
- Bevat de **Sponsor Slide-up** logica: een overlay die van onderuit de kaart omhoog schuift nadat de gebruiker zijn gegevens heeft ingevuld, voor extra opt-ins.

## 🛠 Installatie & Deployment

1. **Repository clonen:** `git clone [url]`
2. **Dependencies installeren:** `npm install`
3. **Lokaal draaien:** `vercel dev`
4. **Deployen:** `vercel --prod`

## 📋 Directus Velden
De code verwacht de volgende velden vanuit de `/api/campaignVisuals.js` endpoint:
- `title`: De hoofdtitel van de lander.
- `paragraph`: De begeleidende tekst.
- `hero_image`: URL naar de hoofdafbeelding.
- `flow`: Een array van strings die de volgorde van secties bepaalt.
