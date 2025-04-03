# Tom's Stuiterende Hoofden Screensaver

Een interactieve screensaver met 100 stuiterende hoofden van Tom die geluid maken wanneer ze de randen van het scherm raken.

## Hoe te gebruiken

1. Open `index.html` in een webbrowser.
2. De hoofden zullen automatisch beginnen te stuiteren over het hele scherm.
3. Wanneer een hoofd een rand raakt, zal het een willekeurig geluid afspelen en even beginnen te praten.
4. Gebruik de knoppen onderaan het scherm om de snelheid aan te passen:
   - "Sneller": Verhoogt de snelheid van alle hoofden
   - "Langzamer": Verlaagt de snelheid van alle hoofden

## Technische details

- De screensaver gebruikt HTML, CSS en JavaScript.
- Alle hoofden hebben een constante snelheid maar stuiteren in verschillende richtingen.
- De achtergrondmuziek speelt in een continue loop.
- Er zijn zeven verschillende geluidseffecten die willekeurig worden afgespeeld bij botsingen.
- De animatie van elk hoofd verandert van "face_idle.gif" naar "face_talking.gif" wanneer het een rand raakt.

## Bestandsstructuur

- `index.html`: De hoofdwebpagina die de screensaver weergeeft
- `styles.css`: Stijlen voor de screensaver en besturingselementen
- `script.js`: De JavaScript-code die de beweging, botsingen en geluiden regelt
- `Assets/`: Map met afbeeldingen en geluiden
  - `Graphics/`: Bevat de GIF-animaties voor de hoofden
  - `Audio/`: Bevat de geluidsbestanden 