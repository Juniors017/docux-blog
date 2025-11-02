import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

// --- Sub-components (defined first)
export const FallbackBefore = ({ children, start }) => <>{children}</>;
export const FallbackAfter = ({ children, end }) => <>{children}</>;

FallbackBefore.propTypes = {
  children: PropTypes.node.isRequired,
  start: PropTypes.string,
};

FallbackAfter.propTypes = {
  children: PropTypes.node.isRequired,
  end: PropTypes.string,
};

/**
 * Calculates the temporal state based on dates and fallbacks
 */
const calculateTimeState = (now, calculatedStartDate, calculatedEndDate, fallbackBeforeStartDate, fallbackAfterEndDate) => {
  if (!calculatedStartDate || !calculatedEndDate) {
    return 'none';
  }

  // During the main period
  if (now >= calculatedStartDate && now <= calculatedEndDate) {
    return 'during';
  }
  
  // Before the main period
  if (now < calculatedStartDate) {
    if (fallbackBeforeStartDate) {
      return now >= fallbackBeforeStartDate ? 'before' : 'none';
    }
    return 'before';
  }
  
  // After the main period
  if (now > calculatedEndDate) {
    if (fallbackAfterEndDate) {
      return now <= fallbackAfterEndDate ? 'after' : 'none';
    }
    return 'after';
  }

  return 'none';
};

/**
 * Conditional display component based on date or duration.
 *
 * Usage:
 * <TimeTimer date="25/12/2025" strict>
 *   🎄 Merry Christmas!
 *   <FallbackBefore>⏳ Not Christmas yet</FallbackBefore>
 *   <FallbackAfter>🕰️ Christmas has passed</FallbackAfter>
 * </TimeTimer>
 *
 * <TimeTimer start="01/11/2025 10:10" duration="30d" strict>
 *   🎉 Active offer!
 * </TimeTimer>
 *
 * <TimeTimer start="01/12/2025 10:00" duration="30d">
 *   🎁 Active offer!
 *   <FallbackBefore start="15/11/2025 10:00">
 *     ⏳ The offer starts soon
 *   </FallbackBefore>
 *   <FallbackAfter end="20/12/2025 18:00">
 *     🕰️ Offer ended
 *   </FallbackAfter>
 * </TimeTimer>
 */
const TimeTimer = ({ date, start, duration, strict = false, children }) => {
  const now = useMemo(() => new Date(), []);
  
  // --- Helper to parse dates
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    const parts = dateStr.split(' ');
    const datePart = parts[0];
    const timePart = parts[1];
    
    const [day, month, year] = datePart.split('/');
    const [h = '0', min = '0'] = timePart ? timePart.split(':') : ['0', '0'];
    
    const targetYear = year ? Number(year) : (strict ? now.getUTCFullYear() : now.getFullYear());
    
    return strict
      ? new Date(Date.UTC(targetYear, Number(month) - 1, Number(day), Number(h), Number(min), 0, 0))
      : new Date(targetYear, Number(month) - 1, Number(day), Number(h), Number(min), 0, 0);
  };

  // --- Date calculation (with memoization)
  const { calculatedStartDate, calculatedEndDate } = useMemo(() => {
    let startDate = null;
    let endDate = null;

    // Case 1: Fixed date
    if (date && !start) {
      const target = parseDate(date);
      const endOfDay = new Date(target);
      if (strict) {
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
      } else {
        endOfDay.setDate(endOfDay.getDate() + 1);
      }
      startDate = target;
      endDate = endOfDay;
    }
    // Case 2: Chronometer
    else if (start && duration) {
      const startDateTime = parseDate(start);
      const match = duration.match(/(\d+)([dhm])/);
      
      if (!match) {
        console.warn(`TimeTimer: invalid duration format "${duration}". Use "30d", "2h", or "45m".`);
        return { calculatedStartDate: null, calculatedEndDate: null };
      }

      const value = Number(match[1]);
      const unit = match[2];
      const endDateTime = new Date(startDateTime);

      if (strict) {
        if (unit === 'd') endDateTime.setUTCDate(endDateTime.getUTCDate() + value);
        else if (unit === 'h') endDateTime.setUTCHours(endDateTime.getUTCHours() + value);
        else if (unit === 'm') endDateTime.setUTCMinutes(endDateTime.getUTCMinutes() + value);
      } else {
        if (unit === 'd') endDateTime.setDate(endDateTime.getDate() + value);
        else if (unit === 'h') endDateTime.setHours(endDateTime.getHours() + value);
        else if (unit === 'm') endDateTime.setMinutes(endDateTime.getMinutes() + value);
      }

      startDate = startDateTime;
      endDate = endDateTime;
    }

    return { calculatedStartDate: startDate, calculatedEndDate: endDate };
  }, [date, start, duration, strict]);

  // --- Extract fallback children
  const childrenArray = React.Children.toArray(children);

  const fallbackBefore = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === FallbackBefore
  );
  const fallbackAfter = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === FallbackAfter
  );

  const mainChildren = childrenArray.filter(
    (child) =>
      !React.isValidElement(child) ||
      (child.type !== FallbackBefore && child.type !== FallbackAfter)
  );

  // --- Handle custom dates in fallbacks
  const fallbackBeforeStartDate = fallbackBefore?.props?.start ? parseDate(fallbackBefore.props.start) : null;
  const fallbackAfterEndDate = fallbackAfter?.props?.end ? parseDate(fallbackAfter.props.end) : null;

  // --- Calculate state
  const state = calculateTimeState(
    now,
    calculatedStartDate,
    calculatedEndDate,
    fallbackBeforeStartDate,
    fallbackAfterEndDate
  );

  // --- Render based on state
  if (state === 'before' && fallbackBefore) {
    return fallbackBefore;
  }
  if (state === 'after' && fallbackAfter) {
    return fallbackAfter;
  }
  if (state === 'during') {
    return <>{mainChildren}</>;
  }

  return null;
};

TimeTimer.propTypes = {
  date: PropTypes.string,
  start: PropTypes.string,
  duration: PropTypes.string,
  strict: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default TimeTimer;
