# Technische Analyse: Zwembadredders Planning Systeem

## 1. Architectuur Overzicht

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React + Vite (SPA)                      │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐        │   │
│  │  │ Dashboard  │ │ Planning   │ │ Employees  │        │   │
│  │  └────────────┘ └────────────┘ └────────────┘        │   │
│  │            FullCalendar.js Component                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │ HTTP/REST                        │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                        SERVER                                │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Node.js + Express                        │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐        │   │
│  │  │ Employees  │ │ Schedule   │ │ Validation │        │   │
│  │  │ Routes     │ │ Routes     │ │ Middleware │        │   │
│  │  └────────────┘ └────────────┘ └────────────┘        │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              SQLite Database                          │   │
│  │  users │ lifeguards │ instructors │ schedule_items   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

| Component | Technologie | Versie | Rationale |
|-----------|-------------|--------|-----------|
| Frontend | React | 18.x | Component-based, ecosystem |
| Build Tool | Vite | 5.x | Fast HMR, ESM native |
| Calendar UI | FullCalendar | 6.x | Drag-drop scheduling |
| Backend | Node.js | 20.x LTS | JavaScript full-stack |
| Framework | Express | 4.x | Minimalistisch, bewezen |
| Database | SQLite | 3.x | Zero-config, portable |
| ORM | better-sqlite3 | 11.x | Synchrone queries, snel |

---

## 3. Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o| lifeguards : "extends"
    users ||--o| instructors : "extends"
    users ||--o{ schedule_items : "has"
    instructors ||--o{ certificates : "has"
    
    users {
        int id PK
        string name
        string email UK
        string color
        enum contract_type
        decimal hourly_rate
        datetime created_at
    }
    
    lifeguards {
        int id PK
        int user_id FK UK
        decimal max_hours_month
        bool is_active
    }
    
    instructors {
        int id PK
        int user_id FK UK
        bool has_initiator_diploma
        bool is_active
    }
    
    schedule_items {
        int id PK
        int user_id FK
        date date
        time start_time
        time end_time
        enum type
        string notes
    }
    
    rental_periods {
        int id PK
        date start_date
        date end_date
        string renter_name
    }
    
    config {
        string key PK
        string value
        string description
    }
```

---

## 4. API Endpoints

### Employees

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/employees` | - | `Employee[]` |
| GET | `/api/employees/:id` | - | `Employee` |
| POST | `/api/employees` | `{name, email, ...}` | `{id}` |
| PUT | `/api/employees/:id` | `{name, email, ...}` | `{success}` |
| DELETE | `/api/employees/:id` | - | `{success}` |

### Schedule

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/schedule/month/:year/:month` | - | `ScheduleItem[]` |
| GET | `/api/schedule/user/:userId` | - | `ScheduleItem[]` |
| POST | `/api/schedule` | `{user_id, date, start_time, end_time, type}` | `{id}` or `{error}` |
| PUT | `/api/schedule/:id` | `{date, start_time, ...}` | `{success}` |
| DELETE | `/api/schedule/:id` | - | `{success}` |

### Hours & Validation

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/employees/:id/hours/:year/:month` | - | `{worked_hours, max_hours, remaining_hours}` |
| POST | `/api/validate` | `{schedule_item}` | `{valid, warnings[], errors[]}` |

---

## 5. Validation Rules Implementation

```javascript
// Validation middleware pseudo-code
const validateScheduleItem = (item) => {
  const errors = [];
  const warnings = [];
  
  // Rule 1: Working hours (4-9h)
  const hours = calculateHours(item.start_time, item.end_time);
  if (hours < 4) errors.push('MIN_HOURS_VIOLATION');
  if (hours > 9) errors.push('MAX_HOURS_VIOLATION');
  
  // Rule 2: Rental period check
  if (isInRentalPeriod(item.date) && item.type === 'redder') {
    errors.push('RENTAL_PERIOD_CONFLICT');
  }
  
  // Rule 3: Consecutive work days
  const consecutiveDays = getConsecutiveWorkDays(item.user_id, item.date);
  if (consecutiveDays >= config.max_consecutive_work_days) {
    warnings.push('REST_DAYS_REQUIRED');
  }
  
  // Rule 4: Instructor diploma
  if (item.type === 'lesgever' && !hasRequiredDiploma(item.user_id)) {
    warnings.push('MISSING_DIPLOMA');
  }
  
  return { valid: errors.length === 0, errors, warnings };
};
```

---

## 6. Frontend Component Structure

```
src/
├── components/
│   ├── Calendar.jsx          # FullCalendar wrapper
│   ├── EmployeeCard.jsx      # Medewerker kaart
│   ├── ScheduleForm.jsx      # Nieuw item formulier
│   ├── ValidationAlert.jsx   # Waarschuwing/fout display
│   └── HoursWidget.jsx       # Uren overzicht widget
├── pages/
│   ├── Dashboard.jsx         # Overzichtspagina
│   ├── Planning.jsx          # Kalender + planning
│   ├── Employees.jsx         # Medewerkersbeheer
│   └── MySchedule.jsx        # Persoonlijk rooster
├── hooks/
│   ├── useEmployees.js       # Data fetching
│   └── useSchedule.js        # Schedule CRUD
├── api/
│   └── client.js             # Axios/fetch wrapper
└── App.jsx
```

---

## 7. Deployment Options

| Optie | Setup | Geschikt voor |
|-------|-------|---------------|
| **Lokaal** | `npm run dev` (beide) | Development, demo |
| **Docker Compose** | 2 containers + volume | Staging, klein team |
| **VPS/Cloud** | PM2 + Nginx + SQLite | Productie light |
| **Vercel + Railway** | Separated hosting | Productie scale |

---

## 8. Security Considerations

| Risico | Mitigatie |
|--------|-----------|
| SQL Injection | Prepared statements (better-sqlite3) |
| CORS | Strikte origin whitelist |
| Auth (toekomst) | JWT tokens + role-based access |
| Data backup | Daily SQLite dump to cloud |

---

## 9. Performance Targets

| Metric | Target |
|--------|--------|
| Initial page load | < 2s |
| API response time | < 100ms |
| Calendar render | < 500ms |
| Database size (1 jaar) | < 50MB |
