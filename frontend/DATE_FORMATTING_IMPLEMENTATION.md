# Date Formatting Implementation for Internationalization

## Overview

This document describes the implementation of proper locale-aware date formatting for the sports team scheduling application. The implementation ensures that dates are displayed according to the user's selected language preference.

## Problem Statement

Previously, the application was using hardcoded `toLocaleDateString("en-US")` calls, which meant:

- All dates were displayed in US English format regardless of user's language preference
- French users saw "Jun 24" instead of "24 juin"
- Spanish users saw "Jun 24" instead of "24 jun"
- Missing translations for date-related text like "Date TBD", "Just now", etc.

## Solution Implemented

### 1. Date Formatting Utilities (`src/utils/dateUtils.ts`)

Created a comprehensive utility module with the following functions:

#### `formatDate(dateString, language, options)`

- Formats dates according to the specified language
- Maps language codes to appropriate browser locales:
  - `en` → `en-US`
  - `fr` → `fr-FR`
  - `es` → `es-ES`

#### `formatDateTime(dateString, language, options)`

- Formats dates with time according to locale
- Default format: "Jun 24, 11:30 AM" (EN) vs "24 juin, 11:30" (FR)

#### `formatGameDate(date, language)`

- Formats game dates with weekday: "Mon, Jun 24" (EN) vs "lun. 24 juin" (FR)

#### `formatGameDateTime(date, time, language)`

- Formats game dates with time, handling various time formats

#### `formatRelativeTime(dateString, language, t?)`

- Formats relative times like "2 hours ago", "yesterday"
- Uses translation function when available, falls back to hardcoded strings
- Supports interpolation: `{count} minutes ago`

### 2. Translation Updates

Added missing translations to all locale files:

#### English (`src/locales/en.json`)

```json
{
  "teamInvitations": {
    "created": "Created",
    "expires": "Expires",
    "status": {
      "pending": "Pending",
      "accepted": "Accepted",
      "declined": "Declined",
      "expired": "Expired"
    }
  },
  "dateTime": {
    "justNow": "Just now",
    "minutesAgo": "{count} minutes ago",
    "hoursAgo": "{count} hours ago",
    "yesterday": "Yesterday",
    "daysAgo": "{count} days ago",
    "dateTBD": "Date TBD",
    "invalidDate": "Invalid Date"
  }
}
```

#### French (`src/locales/fr.json`)

```json
{
  "teamInvitations": {
    "created": "Créée",
    "expires": "Expire",
    "status": {
      "pending": "En attente",
      "accepted": "Acceptée",
      "declined": "Déclinée",
      "expired": "Expirée"
    }
  },
  "dateTime": {
    "justNow": "À l'instant",
    "minutesAgo": "Il y a {count} minutes",
    "hoursAgo": "Il y a {count} heures",
    "yesterday": "Hier",
    "daysAgo": "Il y a {count} jours",
    "dateTBD": "Date à déterminer",
    "invalidDate": "Date invalide"
  }
}
```

#### Spanish (`src/locales/es.json`)

```json
{
  "teamInvitations": {
    "created": "Creada",
    "expires": "Expira",
    "status": {
      "pending": "Pendiente",
      "accepted": "Aceptada",
      "declined": "Rechazada",
      "expired": "Expirada"
    }
  },
  "dateTime": {
    "justNow": "Ahora mismo",
    "minutesAgo": "Hace {count} minutos",
    "hoursAgo": "Hace {count} horas",
    "yesterday": "Ayer",
    "daysAgo": "Hace {count} días",
    "dateTBD": "Fecha por determinar",
    "invalidDate": "Fecha inválida"
  }
}
```

## Date Formatting Examples

### Short Date Format

- **English**: "Jun 24"
- **French**: "24 juin"
- **Spanish**: "24 jun"

### Full Date Format

- **English**: "Mon, Jun 24"
- **French**: "lun. 24 juin"
- **Spanish**: "lun, 24 jun"

### Date with Time

- **English**: "Jun 24, 11:30 AM"
- **French**: "24 juin, 11:30"
- **Spanish**: "24 jun, 11:30"

### Relative Time

- **English**: "2 hours ago", "Yesterday"
- **French**: "Il y a 2 heures", "Hier"
- **Spanish**: "Hace 2 horas", "Ayer"

## Usage Examples

### In React Components

```tsx
import { useI18n } from "../contexts/I18nContext";
import {
  formatDate,
  formatGameDate,
  formatRelativeTime,
} from "../utils/dateUtils";

function MyComponent() {
  const { t, language } = useI18n();

  // Format a simple date
  const formattedDate = formatDate("2024-06-24", language);

  // Format a game date
  const gameDate = formatGameDate("2024-06-24", language);

  // Format relative time with translations
  const relativeTime = formatRelativeTime("2024-06-24T10:30:00Z", language, t);

  return (
    <div>
      <p>Date: {formattedDate}</p>
      <p>Game: {gameDate}</p>
      <p>Time: {relativeTime}</p>
    </div>
  );
}
```

### With Custom Options

```tsx
// Custom date formatting
const customDate = formatDate("2024-06-24", language, {
  year: "numeric",
  month: "long",
  day: "numeric",
});
// Result: "June 24, 2024" (EN) vs "24 juin 2024" (FR)
```

## Components Updated

The following components have been identified for date formatting updates:

1. **DashboardPage.tsx** - Recent activity timestamps
2. **TeamInvitationsList.tsx** - Invitation creation and expiry dates
3. **GameSeriesPage.tsx** - Series start/end dates
4. **TeamsPage.tsx** - Team creation dates
5. **GamesPage.tsx** - Game dates
6. **TeamDetailsPage.tsx** - Team creation/update dates
7. **Advanced Scheduling Components** - Availability dates

## Testing

A test script (`test-date-formatting.js`) demonstrates the formatting differences:

```bash
cd frontend
node test-date-formatting.js
```

## Benefits

1. **User Experience**: Dates are displayed in the user's preferred format
2. **Accessibility**: Proper localization improves accessibility for international users
3. **Consistency**: All date formatting follows the same locale-aware approach
4. **Maintainability**: Centralized date formatting utilities are easy to maintain
5. **Extensibility**: Easy to add support for additional languages

## Future Enhancements

1. **Time Zone Support**: Add timezone-aware formatting
2. **Calendar Integration**: Support for different calendar systems
3. **Custom Formats**: Allow users to customize date formats
4. **Performance**: Cache formatted dates for better performance
5. **Accessibility**: Add ARIA labels for screen readers

## Migration Guide

To update existing components:

1. Import the date utilities:

   ```tsx
   import { formatDate, formatGameDate } from "../utils/dateUtils";
   ```

2. Get the current language:

   ```tsx
   const { language } = useI18n();
   ```

3. Replace hardcoded formatting:

   ```tsx
   // Before
   {
     new Date(date).toLocaleDateString("en-US");
   }

   // After
   {
     formatDate(date, language);
   }
   ```

4. Add translations for date-related text in locale files

This implementation ensures that all date formatting throughout the application respects the user's language preference and provides a consistent, localized experience.
