# Functionele Analyse: Zwembadredders Planning Systeem

## 1. Situatieschets (As-Is)

| Aspect | Huidige Situatie (Manueel) |
|--------|----------------------------|
| Planning | Excel/papier, foutgevoelig |
| Communicatie | Telefoon/mail, vertraagd |
| Uurregistratie | Handmatig bijhouden |
| Regelgeving | Geen automatische controle |
| Diploma check | Geheugen van planner |

---

## 2. User Stories

### US-01: Planning Bekijken (Redder)
>
> **Als** redder  
> **Wil ik** mijn persoonlijke planning bekijken in mijn eigen kleur  
> **Zodat** ik duidelijk mijn shiften kan onderscheiden

**Acceptatiecriteria (Gherkin):**

```gherkin
Given ik ben ingelogd als redder "Jan Peeters"
When ik de planning open
Then zie ik enkel mijn eigen shiften
And deze worden weergegeven in mijn persoonlijke kleur (#e74c3c)
```

---

### US-02: Planning Maken (Planner)
>
> **Als** planner  
> **Wil ik** een maandplanning kunnen opstellen  
> **Zodat** medewerkers tijdig hun rooster kennen

**Acceptatiecriteria:**

```gherkin
Given een lege planning voor december 2025
When ik redder "Marie" inplan op 15 december van 09:00-17:00
Then wordt dit item opgeslagen met type "redder"
And ontvangt Marie een notificatie
```

---

### US-03: Werkuren Validatie
>
> **Als** systeem  
> **Wil ik** werkuren automatisch valideren  
> **Zodat** wettelijke limieten gerespecteerd worden

**Acceptatiecriteria:**

```gherkin
Given de regel "minimum 4 uur per dag"
When ik een shift van 3 uur probeer in te plannen
Then wordt dit geweigerd met foutmelding "Minimum 4 uur per dag vereist"

Given de regel "maximum 9 uur per dag"
When ik een shift van 10 uur probeer in te plannen
Then wordt dit geweigerd met foutmelding "Maximum 9 uur per dag toegestaan"
```

---

### US-04: VLAREM II Compliance
>
> **Als** planner  
> **Wil ik** gewaarschuwd worden bij onvoldoende redders  
> **Zodat** we voldoen aan VLAREM II regelgeving

**Acceptatiecriteria:**

```gherkin
Given zwembad vereist minimaal 2 redders tijdens openingsuren
When ik slechts 1 redder heb ingepland op maandag 09:00-17:00
Then krijg ik een waarschuwing "⚠️ VLAREM II: Minimaal 2 redders vereist"
```

---

### US-05: Lesgever Diploma Check
>
> **Als** systeem  
> **Wil ik** controleren of lesgevers het juiste diploma hebben  
> **Zodat** geen onbevoegde personen lessen geven

**Acceptatiecriteria:**

```gherkin
Given lesgever "Pieter" heeft initiatordiploma
And lesgever "Tom" heeft GEEN initiatordiploma
When ik "Tom" wil inplannen voor een initiatorles
Then krijg ik waarschuwing "Lesgever heeft geen initiatordiploma"
```

---

### US-06: Verhuurperiode Blokkering
>
> **Als** systeem  
> **Wil ik** voorkomen dat redders ingepland worden tijdens verhuur  
> **Zodat** geen onnodige loonkosten ontstaan

**Acceptatiecriteria:**

```gherkin
Given het zwembad is verhuurd van 20-12 tot 03-01
When ik probeer een redder in te plannen op 25 december
Then wordt dit geweigerd met melding "Zwembad verhuurd - geen redders nodig"
```

---

### US-07: Rustdagen Controle
>
> **Als** systeem  
> **Wil ik** afdwingen dat werknemers voldoende rust krijgen  
> **Zodat** we voldoen aan arbeidstijdenwetgeving

**Acceptatiecriteria:**

```gherkin
Given medewerker "Jan" heeft 7 dagen achtereen gewerkt
When ik hem wil inplannen op dag 8
Then krijg ik waarschuwing "2 rustdagen vereist na 7 werkdagen"
```

---

## 3. Process Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PLANNING WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────┐     ┌─────────────┐     ┌───────────────┐             │
│   │ Planner │────▶│ Voeg shift  │────▶│ Validatie     │             │
│   │ opent   │     │ toe         │     │ checks        │             │
│   └─────────┘     └─────────────┘     └───────┬───────┘             │
│                                               │                      │
│                        ┌──────────────────────┼──────────────────┐  │
│                        ▼                      ▼                  ▼  │
│               ┌────────────────┐    ┌────────────────┐  ┌────────┐  │
│               │ ❌ Afgewezen   │    │ ⚠️ Waarschuwing│  │ ✅ OK  │  │
│               │ - <4u of >9u   │    │ - Diploma miss │  │ Opslaan│  │
│               │ - Verhuurperiode│    │ - VLAREM II    │  │        │  │
│               │ - 8e werkdag   │    └────────┬───────┘  └────┬───┘  │
│               └────────────────┘             │               │      │
│                                              ▼               ▼      │
│                                     ┌────────────────────────────┐  │
│                                     │ 📧 Notificatie naar        │  │
│                                     │    medewerker              │  │
│                                     └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Gap Analysis: As-Is vs To-Be

| Proces | As-Is (Manueel) | To-Be (Geautomatiseerd) |
|--------|-----------------|-------------------------|
| Planning maken | 2-3 uur handwerk | 15 min drag-drop |
| VLAREM check | Menselijk geheugen | Real-time validatie |
| Diploma controle | Papieren archief | Database lookup |
| Uurregistratie | Excel formulier | Automatisch berekend |
| Communicatie | Telefoon rondjes | Push notificaties |
| Verhuur blokkade | Post-it reminder | Systeem blokkering |
| Rustdagen check | Planner onthoudt | Automatische waarschuwing |

---

## 5. Edge Cases & Unhappy Paths

| Scenario | Systeem Reactie |
|----------|-----------------|
| Redder is ook lesgever op zelfde dag | Aparte items toelaatbaar, maar niet overlappend |
| Planner wil eigen regels negeren | Soft warnings (override mogelijk met reden) |
| Twee planners wijzigen tegelijk | Last-write-wins + conflict melding |
| Medewerker wordt ziek | Item markeren als "vervangen nodig" |
| Nieuwe VLAREM regelgeving | Config tabel voor aanpasbare limieten |
