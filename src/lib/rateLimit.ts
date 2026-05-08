const requests = new Map<string, { count: number, timestamp: number }>();
const TIME_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

/**
 * Cleans up old entries from the rate limit map.
 * This is called periodically by a setInterval.
 */
function cleanup() {
    const now = Date.now();
    for (const [ip, data] of requests.entries()) {
        if (now - data.timestamp > TIME_WINDOW_MS) {
            requests.delete(ip);
        }
    }
}

// In a typical Node.js server environment, this would run continuously.
// In serverless environments, this interval might not persist as expected.
// Given the prompt's request for a "simple in-memory" limiter, this is a suitable approach.
if (typeof setInterval !== 'undefined') {
    setInterval(cleanup, TIME_WINDOW_MS);
}

/**
 * Checks if a request from a given IP is allowed based on a simple in-memory rate limit.
 * Allows a maximum of 5 requests per 15-minute window per IP.
 * @param ip The IP address of the requester.
 * @returns `true` if the request is allowed, `false` otherwise.
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const data = requests.get(ip);

  if (!data || (now - data.timestamp > TIME_WINDOW_MS)) {
    // It's the first request in a new time window.
    requests.set(ip, { count: 1, timestamp: now });
    return true;
  }

  if (data.count < MAX_REQUESTS) {
    // The request is within the limit.
    data.count++;
    requests.set(ip, { ...data }); // Update the map entry
    return true;
  }

  // The request exceeds the limit.
  return false;
}
