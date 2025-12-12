# Verslag: Planning van Zwembadredders en Lesgevers

## Situatie

Binnen het bedrijf wordt gewerkt aan een systeem voor het inplannen van zowel **zwembadredders** als **lesgevers**.

### Personeelstypes

- **Voltijdse redders**: tarief van €38 per uur
- **Deeltijdse redders**: variabel tarief
- **Lesgevers**: kunnen ook redder zijn, maar tijdens lesgeven worden zij *niet* als redder beschouwd
- Een lesgever hoeft niet noodzakelijk een redder te zijn

---

## Regelgeving

### VLAREM II Compliance Check

Het systeem valideert automatisch of het wettelijk aantal redders aanwezig is op basis van de wateroppervlakte.

**Logica:**

- **Input:** Totale wateroppervlakte (m²) van open baden.
- **Formule:** 1 redder per started 250m² wateroppervlakte (standaard VLAREM).
- **Configuratie:**
  - `POOL_SURFACE_AREA` (instelbaar, bv. 450m²)
  - `MIN_LIFEGUARDS` = `ceil(POOL_SURFACE_AREA / 250)`
- **Validatie:**
  - *Bij elke shift toevoeging:* Check of `(Aantal Redders) >= MIN_LIFEGUARDS` voor dat tijdsblok.
  - *Foutmelding:* "Te weinig redders ingepland voor conformiteit (Vereist: X, Huidig: Y)."

### Arbeidstijden Validatie (Work Time Check)

Het systeem handhaaft strikte regels om burn-out te voorkomen en wetgeving na te leven.

| Regel | Waarde | Validatie Logica | Type |
|-------|--------|------------------|------|
| **Max Dagen Achtereen** | 7 dagen | `IF consecutive_days > 7 THEN Block/Warn` | Bedrijf |
| **Wettelijk Max Dagen** | 14 dagen | `IF consecutive_days > 14 THEN Error` | Wettelijk |
| **Rusttijd** | 11 uur | `Min hours between shifts >= 11` | Wettelijk |
| **Max Uren/Dag** | 9 uur | `Total shift hours per day <= 9` | Wettelijk |
| **Min Uren/Dag** | 3 uur | `Shift duration >= 3` | Wettelijk |

> **Implementatie Detail:** Deze checks worden uitgevoerd bij het opslaan van een weekplanning. Overtredingen van 'Wettelijk' blokkeren de opslag; 'Bedrijf' geeft een waarschuwing die 'overruled' kan worden door een manager.

---

## Systeemfunctionaliteit

### Voor Redders

- Enkel **eigen planning** bekijken
- Weergave in **persoonlijke kleur**

### Voor Lesgevers

- Duidelijk onderscheid tussen lessen en reddersdiensten
- **Diploma registratie**: sommigen hebben initiatordiploma (vereist voor bepaalde lessen)
- Systeem geeft **melding** bij ongeschikte lesgever

### Uurregistratie

- Per maand weergeven hoeveel uren gewerkt
- Hoeveel uren nog ingepland kunnen worden
- Werknemers registreren uren via hetzelfde systeem

### Loonberekening

- Deeltijdse redders: apart berekend
- Lesgevers: apart berekend (afhankelijk van functies en gewerkte uren)

---

## Security & Toegangscontrole (RBAC)

Het systeem maakt gebruik van **Role Based Access Control** om data te beschermen en functionaliteit te scheiden.

### Rollen

1. **Redder**: Kan eigen planning zien, beschikbaarheid opgeven.
2. **Lesgever**: Kan eigen lessen zien, diploma's beheren.
3. **Admin (Hoofdredder)**: Volledige toegang tot planning, personeelsbeheer en configuratie.

### Permissie Matrix

| Functionaliteit | Redder | Lesgever | Admin |
|:---|:---:|:---:|:---:|
| **Eigen rooster bekijken** | ✅ | ✅ | ✅ |
| **Volledig rooster bekijken** | ❌ | ❌ | ✅ |
| **Beschikbaarheid opgeven** | ✅ | ✅ | ✅ |
| **Vrije momenten boeken** | ✅ | ❌ | ✅ |
| **Collega's beheren** | ❌ | ❌ | ✅ |
| **Rapporten/Loon downloaden** | ❌ | ❌ | ✅ |
| **Systeemconfiguratie (VLAREM)** | ❌ | ❌ | ✅ |

---

## Speciale Gevallen

### Verhuur Zwembad

- Bij verhuur (bijv. 2 weken): **geen redder voorzien**
- Dit wordt zichtbaar weergegeven om foutieve inplanning te voorkomen

### Notificaties

- Bij **wijzigingen** in planning: automatische notificatie aan betrokken werknemers
- Planning wordt **maandelijks** opgesteld

---

## Samenvatting Vereisten

1. ✅ Inplannen redders en lesgevers
2. ✅ VLAREM II compliance (min. redders)
3. ✅ Arbeidstijdencontrole (7 dagen werk, 2 rust)
4. ✅ Uurregistratie en maandoverzicht
5. ✅ Diploma-tracking voor lesgevers
6. ✅ Verhuurperiode blokkering
7. ✅ Automatische notificaties bij wijzigingen
8. ✅ Persoonlijke kleur per medewerker
