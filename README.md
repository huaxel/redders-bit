# Redders-Bit 🏊‍♂️

Digitaal planningsysteem voor zwembadpersoneel met real-time compliance validatie en automatische uurtracking.

## 📋 Over het Project

Redders-Bit is een geïntegreerd planningsysteem dat zwembaden helpt om:
- **Compliance te garanderen**: VLAREM II en arbeidstijdenwet naleving
- **Efficiëntie te verhogen**: Planningtijd van 3 uur naar 30 minuten per week
- **Kosten te besparen**: Eliminatie van planningsfouten en onnodige loonkosten
- **Kwaliteit te borgen**: Automatische diploma tracking voor lesgevers

### Business Value

- 🎯 **Compliance**: Eliminatie van VLAREM II boeterisico (€500-5000/incident)
- ⚡ **Efficiency**: 80% snellere planning
- 💰 **Cost Savings**: €15K+ jaarlijkse besparingen
- 📊 **Reporting**: Real-time inzicht in uren en personeelsbezetting

## 🏗️ Technische Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQL.js (SQLite in-memory)
- **API**: RESTful API met CORS support

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Router**: React Router DOM
- **Calendar**: FullCalendar
- **Styling**: CSS

## 📁 Projectstructuur

```
redders-bit/
├── backend/
│   ├── server.js           # Express server
│   ├── package.json
│   └── database/
│       ├── init.js         # Database initialisatie
│       └── schema.sql      # Database schema
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx        # Entry point
│       ├── App.jsx         # Main app component
│       ├── index.css
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Employees.jsx
│           ├── MySchedule.jsx
│           └── Planning.jsx
├── docs/
│   ├── business_requirements.md
│   ├── functionele_analyse.md
│   ├── technische_analyse.md
│   └── verslag_planning_zwembadredders.md
└── agents/
    └── [Various AI agent definitions]
```

## 🚀 Quick Start

### Vereisten

- Node.js (v18 of hoger)
- npm of yarn

### Installatie

1. **Clone de repository**
   ```bash
   git clone https://github.com/yourusername/redders-bit.git
   cd redders-bit
   ```

2. **Installeer backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Installeer frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Development

1. **Start de backend server**
   ```bash
   cd backend
   npm run dev
   ```
   De API draait op `http://localhost:3000`

2. **Start de frontend development server** (in een nieuwe terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   De applicatie draait op `http://localhost:5173`

3. **Initialiseer de database** (optioneel, indien nodig)
   ```bash
   cd backend
   npm run init-db
   ```

## 🗄️ Database Schema

Het systeem gebruikt een SQLite database met de volgende hoofdtabellen:

- **users**: Basisinformatie van alle medewerkers
- **lifeguards**: Extended info voor redders (max uren/maand)
- **instructors**: Extended info voor lesgevers (diploma's)
- **certificates**: Diploma tracking voor lesgevers
- **schedule_items**: Planning items voor alle medewerkers
- **rental_periods**: Verhuurperiodes waarin geen personeel nodig is
- **vlarem_compliance**: VLAREM II compliance tracking

## 🎯 Functionaliteiten

### Dashboard
- Overzicht van huidige planning
- VLAREM II compliance status
- Snelle statistieken (aantal redders, uren deze maand)

### Planning
- FullCalendar integratie met drag-and-drop
- Real-time validatie van:
  - VLAREM II minimale bezetting (2 redders)
  - Maximale uren per medewerker
  - Diploma vereisten voor lesgevers
- Conflict detectie
- Verhuurperiode blokkering

### Medewerkers
- Overzicht van alle redders en lesgevers
- Contract type en uurloon beheer
- Status tracking (actief/inactief)
- Diploma management voor lesgevers

### Mijn Rooster
- Persoonlijk rooster per medewerker
- Maandelijkse uurtracking
- Export functionaliteit

## 📊 API Endpoints

### Users
- `GET /api/users` - Alle gebruikers
- `GET /api/users/:id` - Specifieke gebruiker
- `POST /api/users` - Nieuwe gebruiker aanmaken
- `PUT /api/users/:id` - Gebruiker updaten
- `DELETE /api/users/:id` - Gebruiker verwijderen

### Schedule
- `GET /api/schedule` - Alle planning items
- `GET /api/schedule/user/:userId` - Planning voor specifieke gebruiker
- `POST /api/schedule` - Planning item aanmaken
- `PUT /api/schedule/:id` - Planning item updaten
- `DELETE /api/schedule/:id` - Planning item verwijderen

### Compliance
- `GET /api/compliance/vlarem` - VLAREM II status check
- `GET /api/compliance/hours/:userId` - Uren check voor gebruiker

## 🧪 Testing

Het project volgt een Test-Driven Development (TDD) aanpak. Testscenario's zijn gedocumenteerd in de technische analyse.

## 📚 Documentatie

Uitgebreide documentatie is beschikbaar in de `/docs` folder:

- [Business Requirements](docs/business_requirements.md) - Business case en ROI analyse
- [Functionele Analyse](docs/functionele_analyse.md) - Functionele specificaties
- [Technische Analyse](docs/technische_analyse.md) - Technische implementatie details
- [Planning Verslag](docs/verslag_planning_zwembadredders.md) - Project planning

## 🤖 AI Agents

Het project bevat verschillende AI agents voor development support:
- **Architect**: Systeemarchitectuur
- **Builder**: Code implementatie
- **Business Analyst**: Requirements analyse
- **Consultant**: Best practices
- **Data Analyst**: Data modelling
- **UI Critic**: UX/UI feedback
- **Legal Engineer**: Compliance checking

## 🔒 Compliance

Het systeem is ontworpen met compliance als hoogste prioriteit:

- ✅ **VLAREM II**: Minimaal 2 redders aanwezig tijdens openingstijden
- ✅ **Arbeidstijdenwet**: Maximum uren per maand per medewerker
- ✅ **Diploma Vereisten**: Automatische controle voor lesgevers
- ✅ **Audit Trail**: Logging van alle wijzigingen

## 🚢 Deployment

### Production Build

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start production server**
   ```bash
   cd backend
   npm start
   ```

### Environment Variables

Geen environment variables vereist voor lokale development. Voor productie:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## 🤝 Contributing

1. Fork het project
2. Creëer een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📝 License

Dit project is intern ontwikkeld voor zwembadbeheer.

## 👥 Team

Ontwikkeld met ondersteuning van GitHub Copilot en diverse gespecialiseerde AI agents.

## 📞 Support

Voor vragen of issues, raadpleeg de documentatie in `/docs` of neem contact op met het development team.

---

**Gemaakt met ❤️ voor veilig en efficiënt zwembadbeheer**
