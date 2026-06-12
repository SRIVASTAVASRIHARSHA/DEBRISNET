export const formatUTC = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = date.getUTCFullYear();
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy} AT ${hh}:${min} UTC`;
  } catch (e) {
    return isoString;
  }
};

export const formatOperatorTime = (isoString, timeZone) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      hourCycle: 'h23'
    });
    
    const parts = formatter.formatToParts(date);
    let dd, mm, yyyy, hh, min, tzName;
    parts.forEach(part => {
      if (part.type === 'day') dd = part.value;
      if (part.type === 'month') mm = part.value;
      if (part.type === 'year') yyyy = part.value;
      if (part.type === 'hour') hh = part.value;
      if (part.type === 'minute') min = part.value;
      if (part.type === 'timeZoneName') tzName = part.value;
    });
    
    return `${dd}-${mm}-${yyyy} AT ${hh}:${min} ${tzName || ''}`.trim();
  } catch (e) {
    return isoString;
  }
};

export const formatReportTime = (isoString, timeZone, isUTC = false) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    const tz = isUTC ? 'UTC' : timeZone;
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: isUTC ? undefined : 'short',
      hourCycle: 'h23'
    });
    
    const raw = formatter.format(date).toUpperCase();
    let timeString = raw.replace(',', '');
    if (isUTC && !timeString.includes('UTC')) {
      timeString += ' UTC';
    }
    return timeString;
  } catch (e) {
    return isoString;
  }
};
