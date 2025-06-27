/**
 * Date formatting utilities for internationalization
 */

export type Language = "en" | "es" | "fr";

/**
 * Maps our language codes to browser locale codes
 */
const localeMap: Record<Language, string> = {
  en: "en-US",
  es: "es-ES", 
  fr: "fr-FR"
};

/**
 * Get the translated "Date TBD" text
 * @param language - Current language code
 * @param t - Translation function (optional)
 * @returns Translated "Date TBD" text
 */
const getDateTBDText = (language: Language, t?: (key: string) => string): string => {
  if (t) {
    return t("dateTime.dateTBD");
  }
  
  // Fallback translations if no translation function provided
  switch (language) {
    case 'fr':
      return 'Date à déterminer';
    case 'es':
      return 'Fecha por determinar';
    default:
      return 'Date TBD';
  }
};

/**
 * Format a date for display based on the current language
 * @param dateString - ISO date string or Date object
 * @param language - Current language code
 * @param options - Intl.DateTimeFormatOptions
 * @param t - Translation function (optional)
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | Date,
  language: Language,
  options: Intl.DateTimeFormatOptions = {},
  t?: (key: string) => string
): string => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return t ? t("dateTime.invalidDate") : "Invalid Date";
    }

    const locale = localeMap[language];
    return date.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return t ? t("dateTime.invalidDate") : "Invalid Date";
  }
};

/**
 * Format a date with time for display based on the current language
 * @param dateString - ISO date string or Date object
 * @param language - Current language code
 * @param options - Intl.DateTimeFormatOptions
 * @param t - Translation function (optional)
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  dateString: string | Date,
  language: Language,
  options: Intl.DateTimeFormatOptions = {},
  t?: (key: string) => string
): string => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return t ? t("dateTime.invalidDate") : "Invalid Date";
    }

    const locale = localeMap[language];
    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options
    };
    
    return date.toLocaleDateString(locale, defaultOptions);
  } catch (error) {
    console.error('Error formatting date time:', error);
    return t ? t("dateTime.invalidDate") : "Invalid Date";
  }
};

/**
 * Format a game date (date only) for display based on the current language
 * @param date - Date string
 * @param language - Current language code
 * @param t - Translation function (optional)
 * @returns Formatted game date string
 */
export const formatGameDate = (
  date: string,
  language: Language,
  t?: (key: string) => string
): string => {
  try {
    if (!date) {
      return getDateTBDText(language, t);
    }

    const gameDate = new Date(date);
    
    if (isNaN(gameDate.getTime())) {
      return getDateTBDText(language, t);
    }

    const locale = localeMap[language];
    
    // Different formats for different languages
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short", 
      day: "numeric"
    };

    return gameDate.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Error formatting game date:', error);
    return getDateTBDText(language, t);
  }
};

/**
 * Format a game date with time for display based on the current language
 * @param date - Date string
 * @param time - Time string
 * @param language - Current language code
 * @param t - Translation function (optional)
 * @returns Formatted game date and time string
 */
export const formatGameDateTime = (
  date: string,
  time: string,
  language: Language,
  t?: (key: string) => string
): string => {
  try {
    if (!date || !time) {
      return getDateTBDText(language, t);
    }

    // Handle different time formats
    let timeStr = time;
    if (time && !time.includes(":")) {
      // If time is just a number (e.g., "1900"), convert to "19:00"
      if (time.length === 4) {
        timeStr = `${time.substring(0, 2)}:${time.substring(2, 4)}`;
      }
    }

    const dateStr = `${date}T${timeStr}`;
    const gameDate = new Date(dateStr);

    if (isNaN(gameDate.getTime())) {
      return getDateTBDText(language, t);
    }

    const locale = localeMap[language];
    
    // Different formats for different languages
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    };

    return gameDate.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Error formatting game date time:', error);
    return getDateTBDText(language, t);
  }
};

/**
 * Format a relative time (e.g., "2 hours ago", "yesterday") based on the current language
 * @param dateString - ISO date string or Date object
 * @param language - Current language code
 * @param t - Translation function from useI18n
 * @returns Relative time string
 */
export const formatRelativeTime = (
  dateString: string | Date,
  language: Language,
  t?: (key: string, params?: Record<string, string | number>) => string
): string => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Use translation function if provided, otherwise fallback to hardcoded strings
    if (t) {
      if (diffInMinutes < 1) {
        return t("dateTime.justNow");
      } else if (diffInMinutes < 60) {
        return t("dateTime.minutesAgo", { count: diffInMinutes });
      } else if (diffInHours < 24) {
        return t("dateTime.hoursAgo", { count: diffInHours });
      } else if (diffInDays === 1) {
        return t("dateTime.yesterday");
      } else if (diffInDays < 7) {
        return t("dateTime.daysAgo", { count: diffInDays });
      } else {
        // For older dates, use the regular date format
        return formatDate(date, language, {
          month: "short",
          day: "numeric"
        });
      }
    } else {
      // Fallback to hardcoded strings if no translation function provided
      if (diffInMinutes < 1) {
        return language === 'en' ? 'Just now' : 
               language === 'fr' ? 'À l\'instant' : 
               'Ahora mismo';
      } else if (diffInMinutes < 60) {
        return language === 'en' ? `${diffInMinutes} minutes ago` :
               language === 'fr' ? `Il y a ${diffInMinutes} minutes` :
               `Hace ${diffInMinutes} minutos`;
      } else if (diffInHours < 24) {
        return language === 'en' ? `${diffInHours} hours ago` :
               language === 'fr' ? `Il y a ${diffInHours} heures` :
               `Hace ${diffInHours} horas`;
      } else if (diffInDays === 1) {
        return language === 'en' ? 'Yesterday' :
               language === 'fr' ? 'Hier' :
               'Ayer';
      } else if (diffInDays < 7) {
        return language === 'en' ? `${diffInDays} days ago` :
               language === 'fr' ? `Il y a ${diffInDays} jours` :
               `Hace ${diffInDays} días`;
      } else {
        // For older dates, use the regular date format
        return formatDate(date, language, {
          month: "short",
          day: "numeric"
        });
      }
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return t ? t("dateTime.invalidDate") : "Invalid Date";
  }
};

/**
 * Get the appropriate locale code for a given language
 * @param language - Language code
 * @returns Browser locale code
 */
export const getLocale = (language: Language): string => {
  return localeMap[language];
};

/**
 * Format a time for display based on the current language
 * @param dateString - ISO date string or Date object
 * @param language - Current language code
 * @param options - Intl.DateTimeFormatOptions
 * @param t - Translation function (optional)
 * @returns Formatted time string
 */
export const formatTime = (
  dateString: string | Date,
  language: Language,
  options: Intl.DateTimeFormatOptions = {},
  t?: (key: string) => string
): string => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return t ? t("dateTime.invalidDate") : "Invalid Date";
    }

    const locale = localeMap[language];
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      ...options
    };
    
    return date.toLocaleTimeString(locale, defaultOptions);
  } catch (error) {
    console.error('Error formatting time:', error);
    return t ? t("dateTime.invalidDate") : "Invalid Date";
  }
};

/**
 * Get the date format pattern for HTML date inputs based on locale
 * @param language - Current language code
 * @returns Date format pattern (e.g., "DD/MM/YYYY" for French/Spanish, "MM/DD/YYYY" for English)
 */
export const getDateInputFormat = (language: Language): string => {
  switch (language) {
    case 'fr':
    case 'es':
      return 'DD/MM/YYYY'; // Day first for French and Spanish
    case 'en':
    default:
      return 'MM/DD/YYYY'; // Month first for English
  }
};

/**
 * Convert a date string to the format expected by HTML date inputs (YYYY-MM-DD)
 * @param dateString - Date string in any format
 * @param language - Current language code
 * @returns Date string in YYYY-MM-DD format
 */
export const toDateInputFormat = (dateString: string, language: Language): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  } catch (error) {
    console.error('Error converting date to input format:', error);
    return '';
  }
};

/**
 * Convert a date from HTML date input format (YYYY-MM-DD) to display format
 * @param dateInputValue - Date string in YYYY-MM-DD format
 * @param language - Current language code
 * @param t - Translation function (optional)
 * @returns Formatted date string for display
 */
export const fromDateInputFormat = (
  dateInputValue: string, 
  language: Language, 
  t?: (key: string) => string
): string => {
  if (!dateInputValue) {
    return '';
  }
  return formatDate(dateInputValue, language, {}, t);
};

/**
 * Get the placeholder text for date inputs based on locale
 * @param language - Current language code
 * @param t - Translation function (optional)
 * @returns Placeholder text (e.g., "DD/MM/YYYY" for French/Spanish)
 */
export const getDateInputPlaceholder = (language: Language, t?: (key: string) => string): string => {
  if (t) {
    return t("dateTime.dateFormat");
  }
  
  switch (language) {
    case 'fr':
      return 'JJ/MM/AAAA';
    case 'es':
      return 'DD/MM/AAAA';
    case 'en':
    default:
      return 'MM/DD/YYYY';
  }
}; 