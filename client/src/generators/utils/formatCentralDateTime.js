import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const CENTRAL_TZ = 'America/Chicago';

// dayjs's timezone plugin doesn't resolve the 'z' format token to an
// abbreviation (CDT/CST) - derive it from the UTC offset instead, since
// Central is always either -05:00 (CDT, daylight saving) or -06:00 (CST).
const centralAbbreviation = (d) => (d.utcOffset() === -300 ? 'CDT' : 'CST');

// All stored dateTime values are UTC ISO strings - always render them in
// Central time (America/Chicago) regardless of the browser generating the
// report, in human-readable form, never the raw ISO string.
export const formatCentralDateTime = (dateTime, format = 'MMM D, YYYY h:mm A') => {
  if (!dateTime) return '';
  const d = dayjs(dateTime).tz(CENTRAL_TZ);
  if (!d.isValid()) return '';
  return `${d.format(format)} ${centralAbbreviation(d)}`;
};

export const formatCentralDate = (dateTime) => {
  if (!dateTime) return '';
  const d = dayjs(dateTime).tz(CENTRAL_TZ);
  return d.isValid() ? d.format('MM/DD/YYYY') : '';
};

export const formatCentralTime = (dateTime) => {
  if (!dateTime) return '';
  const d = dayjs(dateTime).tz(CENTRAL_TZ);
  return d.isValid() ? d.format('h:mm A') : '';
};

// For "report generated on ..." headers - current moment in Central time.
export const currentCentralTimestamp = () => {
  const d = dayjs().tz(CENTRAL_TZ);
  return `${d.format('MMMM D, YYYY h:mm A')} ${centralAbbreviation(d)}`;
};
