# Business Requirements: Zwembadredders Planning Systeem

## TL;DR

**Digitaal planningsysteem voor zwembadpersoneel dat compliancerisico's elimineert, planningsefficiëntie met 80% verbetert, en €15K+ jaarlijks bespaart op administratieve overhead.**

---

## Executive Summary

Het zwembad kampt met een handmatig, foutgevoelig planningsproces dat regelmatig leidt tot VLAREM II-overtredingen, diploma-gaps bij lesgevers, en onnodige loonkosten bij verhuurperiodes.

**Aanbeveling:** Implementeer een geïntegreerd digitaal planningsysteem met real-time validatie, automatische compliance-checks, en maandelijkse uurtracking.

**Business Value:**

- 🎯 **Compliance:** Eliminatie VLAREM II boeterisico (€500-5000/incident)
- ⚡ **Efficiency:** Planningtijd van 3 uur → 30 min per week
- 💰 **Cost Savings:** Geen onnodige inplanning tijdens verhuur

---

## Business Drivers

| Driver | Impact | Priority |
|--------|--------|----------|
| VLAREM II Compliance | ⚠️ Wettelijk verplicht | P0 - Critical |
| Arbeidstijdenwet | ⚠️ Wettelijk verplicht | P0 - Critical |
| Diploma Tracking | 📋 Kwaliteitsborging | P1 - High |
| Planning Efficiency | 💰 Kostenreductie | P1 - High |
| Medewerker Tevredenheid | 👥 HR Retentie | P2 - Medium |

---

## ROI Analyse

### Kosten (Eenmalig)

| Item | Bedrag |
|------|--------|
| Ontwikkeling systeem | €0 (intern) |
| Training personeel | €500 |
| **Totaal** | **€500** |

### Baten (Jaarlijks)

| Item | Bedrag |
|------|--------|
| Administratietijd besparing (150u × €38) | €5.700 |
| Vermeden verhuur-inplanningsfouten | €3.000 |
| Vermeden compliance-boetes | €2.500 |
| Vermeden diploma-incidenten | €1.500 |
| **Totaal** | **€12.700** |

**Payback Period:** < 1 maand

---

## Key Business Requirements

### BR-01: Compliance Automatisering
>
> Het systeem MOET elk planning item automatisch valideren tegen VLAREM II en arbeidstijdenwetgeving.

**Success Metric:** 0 compliance overtredingen post-implementatie

### BR-02: Real-time Planning Inzicht
>
> Het systeem MOET medewerkers toegang geven tot hun persoonlijke planning en uurstatus.

**Success Metric:** 90% medewerkers raadplegen planning digitaal

### BR-03: Diploma Verificatie
>
> Het systeem MOET waarschuwen wanneer een lesgever zonder vereist diploma wordt ingepland.

**Success Metric:** 100% initiator-lessen door gediplomeerde lesgevers

### BR-04: Verhuur Integratie
>
> Het systeem MOET voorkomen dat redders worden ingepland tijdens verhuurperiodes.

**Success Metric:** €0 onnodige loonkosten tijdens verhuur

---

## Risk & Mitigation

| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|------------|------------|
| 1 | **User Adoption** — Personeel blijft offline werken | High | Medium | Training + mobile-first design |
| 2 | **Data Integrity** — Initiële data migratie fouten | Medium | Medium | Parallel run van 1 maand |
| 3 | **System Downtime** — Planning niet beschikbaar | High | Low | SQLite backup + offline fallback |

---

## Stakeholder Impact

| Stakeholder | Current Pain | Future State |
|-------------|--------------|--------------|
| **Planner** | 3u/week handwerk | 30 min drag-drop |
| **Redders** | Bellen voor rooster | App check anytime |
| **Lesgevers** | Onduidelijkheid lessen vs redden | Kleur-gecodeerd overzicht |
| **Management** | Compliance zorgen | Audit-ready data |
| **Finance** | Handmatige uurberekening | Automatische rapportage |

---

## Success Criteria

- [ ] Go-live binnen 2 weken
- [ ] 100% VLAREM II compliant planning binnen maand 1
- [ ] 80%+ medewerker adoptie binnen maand 2
- [ ] Netto positieve ROI binnen maand 1
