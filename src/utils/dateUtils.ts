/**
 * Date utility helpers supporting both Persian (Jalali / Shamsi) and Gregorian calendars
 */

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateStr: string, language: 'fa' | 'en' = 'fa', options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return '';
  const date = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
  if (isNaN(date.getTime())) return dateStr;

  if (language === 'fa') {
    return new Intl.DateTimeFormat('fa-IR', {
      calendar: 'persian',
      year: options?.year ?? 'numeric',
      month: options?.month ?? 'short',
      day: options?.day ?? 'numeric',
      ...options,
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-US', {
    year: options?.year ?? 'numeric',
    month: options?.month ?? 'short',
    day: options?.day ?? 'numeric',
    ...options,
  }).format(date);
}

export function formatDateTime(isoString: string, language: 'fa' | 'en' = 'fa'): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  if (language === 'fa') {
    return new Intl.DateTimeFormat('fa-IR', {
      calendar: 'persian',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getHeaderCurrentDate(language: 'fa' | 'en' = 'fa'): string {
  const date = new Date();
  if (language === 'fa') {
    return new Intl.DateTimeFormat('fa-IR', {
      calendar: 'persian',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getDaysOfWeek(language: 'fa' | 'en' = 'fa'): { name: string; dateStr: string; isToday: boolean }[] {
  const result = [];
  const today = new Date();
  const todayStr = getTodayDateString();

  // Show past 6 days + today or current 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    let name = '';
    if (language === 'fa') {
      name = new Intl.DateTimeFormat('fa-IR', {
        calendar: 'persian',
        weekday: 'short',
      }).format(d);
    } else {
      name = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
    }

    result.push({
      name,
      dateStr,
      isToday: dateStr === todayStr,
    });
  }

  return result;
}

export function isPastDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = getTodayDateString();
  return dateStr < today;
}

export function isTodayDate(dateStr: string): boolean {
  return dateStr === getTodayDateString();
}

export function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w]);
}
