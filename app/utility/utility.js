function formatTimeAgo(dateString) {
    
    const dateObject = new Date(dateString);
    const timestampMs = dateObject.getTime();
    const now = Date.now();

    const diffMs = now - timestampMs;

    const MINUTE_MS = 60 * 1000;
    const HOUR_MS = 60 * MINUTE_MS;
    const DAY_MS = 24 * HOUR_MS;
    const WEEK_MS = 7 * DAY_MS;

    if (diffMs < MINUTE_MS) {
        return "Just now";
    }

    if (diffMs < HOUR_MS) {
        const minutes = Math.floor(diffMs / MINUTE_MS);
        return `${minutes} minute${minutes === 1 ? '' :'s'} ago`;
    }

    if (diffMs < DAY_MS) {
        const hours = Math.floor(diffMs / HOUR_MS);
        return `${hours} hour${hours === 1 ? '' :'s'} ago`;
    }

    const today = new Date(now).setHours(0, 0, 0, 0);
    const targetDateDay = new Date(timestampMs).setHours(0, 0, 0, 0);
    const yesterdayDay = today - DAY_MS;
    
    if (targetDateDay === yesterdayDay) {
        return "Yesterday";
    }
    
    if (diffMs < WEEK_MS) {
        const days = Math.floor(diffMs / DAY_MS);
        return `${days} day${days === 1 ? '' :'s'} ago`;
    }

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('en-GB', options).format(dateObject);
}

export { formatTimeAgo };