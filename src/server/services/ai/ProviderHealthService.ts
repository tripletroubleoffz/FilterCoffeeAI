const healthStatus = new Map<string, { consecutiveFailures: number; lastChecked: number }>();

export class ProviderHealthService {
  private static MAX_CONSECUTIVE_FAILURES = 3;
  private static COOLDOWN_PERIOD_MS = 60000; // 1 minute cooldown

  static reportSuccess(provider: string) {
    const provKey = provider.toUpperCase();
    healthStatus.set(provKey, { consecutiveFailures: 0, lastChecked: Date.now() });
  }

  static reportFailure(provider: string) {
    const provKey = provider.toUpperCase();
    const current = healthStatus.get(provKey) || { consecutiveFailures: 0, lastChecked: 0 };
    healthStatus.set(provKey, {
      consecutiveFailures: current.consecutiveFailures + 1,
      lastChecked: Date.now(),
    });
  }

  static isHealthy(provider: string): boolean {
    const provKey = provider.toUpperCase();
    const status = healthStatus.get(provKey);
    if (!status) return true;

    if (status.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
      const timeSinceLastFailure = Date.now() - status.lastChecked;
      if (timeSinceLastFailure > this.COOLDOWN_PERIOD_MS) {
        return true;
      }
      return false;
    }
    return true;
  }
}
