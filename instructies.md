# Instructies

## Methodologie

Eerst business requirements
Dan functionele vereisten
Dan technische vereisten
Dan testscenario's (test driven development)
Dan deployment  

## Projectstructuur

```
├── backend
│   ├── server.js
│   ├── database
│   │   ├── init.js
│   │   └── schema.sql
│   └── models
│       ├── user.js
│       ├── employee.js
│       ├── schedule.js
│       └── rental_period.js
├── frontend
│   ├── index.html
│   ├── src
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components
│   │   │   ├── Calendar.jsx
│   │   │   ├── EmployeeList.jsx
│   │   │   ├── ScheduleList.jsx
│   │   │   └── RentalPeriodList.jsx
│   │   └── utils
│   │       └── api.js
│   └── vite.config.js
├── functionele_vereisten
│   ├── functionele_analyse.md
│   ├── technische_analyse.md
│   └── verslag_planning_zwembadredders.md
└── README.md


