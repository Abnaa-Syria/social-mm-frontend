# Frontend — Phase 4

Arabic-first RTL React dashboard for the Social Media Operations Platform.

## Phase 4 Features

- **التقارير** — `/reports` with sub-routes for campaigns, teams, members, tasks, activity
- **CSV Export** — تصدير CSV on report pages (requires `reports.export`)
- **الإشعارات** — dropdown in topbar (60s poll) + `/notifications` page
- **403 Page** — unauthorized access with Arabic messaging
- Reusable: `PermissionGate`, `DateRangeFilter`, `ExportButton`, `Skeleton`

## Routes

| Path | Permission |
|------|------------|
| `/reports` | `reports.view` |
| `/reports/campaigns` | `reports.view` |
| `/reports/teams` | `reports.view` |
| `/reports/members` | `reports.view` |
| `/reports/tasks` | `reports.view` |
| `/reports/activity` | `reports.view` |
| `/notifications` | `notifications.view` |

## Services

- `reportsService` — analytics + CSV download
- `notificationsService` — list, unread count, mark read, delete
- Extended `tasksService` — available members, bulk assign, comment suggestions

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Build

```bash
npm run build
```

## RTL & Almarai

Configured in `index.html` and Tailwind. All pages use `dir="rtl"` and Almarai font family.

See root `README.md` for full project documentation.
