export interface PlanLimitConfig {
  name: string;
  maxTopics: number;
  maxDailySearches: number;
  maxDailyRoasts: number;
  maxDailyBrews: number;
  maxDailySummaries: number;
  maxDailyReports: number;
  maxDailyExports: number;
  maxDailyAiGenerations: number;
  maxDailyApiUsage: number;
  allowedFeatures: string[];
}

export const PLAN_LIMITS: Record<string, PlanLimitConfig> = {
  FREE: {
    name: 'Free',
    maxTopics: 3,
    maxDailySearches: 10,
    maxDailyRoasts: 1,
    maxDailyBrews: 3,
    maxDailySummaries: 3,
    maxDailyReports: 0,
    maxDailyExports: 0,
    maxDailyAiGenerations: 5,
    maxDailyApiUsage: 50,
    allowedFeatures: ['search', 'brew', 'summary'],
  },
  STARTER: {
    name: 'Starter',
    maxTopics: 10,
    maxDailySearches: 50,
    maxDailyRoasts: 5,
    maxDailyBrews: 15,
    maxDailySummaries: 15,
    maxDailyReports: 2,
    maxDailyExports: 5,
    maxDailyAiGenerations: 30,
    maxDailyApiUsage: 250,
    allowedFeatures: ['search', 'brew', 'summary', 'roast', 'export'],
  },
  PRO: {
    name: 'Pro',
    maxTopics: 50,
    maxDailySearches: 200,
    maxDailyRoasts: 20,
    maxDailyBrews: 100,
    maxDailySummaries: 100,
    maxDailyReports: 10,
    maxDailyExports: 50,
    maxDailyAiGenerations: 150,
    maxDailyApiUsage: 1000,
    allowedFeatures: ['search', 'brew', 'summary', 'roast', 'export', 'report', 'custom_sources', 'advanced_search'],
  },
  POWER: {
    name: 'Power',
    maxTopics: 15,
    maxDailySearches: 150,
    maxDailyRoasts: 15,
    maxDailyBrews: 75,
    maxDailySummaries: 75,
    maxDailyReports: 5,
    maxDailyExports: 25,
    maxDailyAiGenerations: 100,
    maxDailyApiUsage: 750,
    allowedFeatures: ['search', 'brew', 'summary', 'roast', 'export', 'report', 'custom_sources', 'advanced_search'],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    maxTopics: 99999,
    maxDailySearches: 999999,
    maxDailyRoasts: 999999,
    maxDailyBrews: 999999,
    maxDailySummaries: 999999,
    maxDailyReports: 999999,
    maxDailyExports: 999999,
    maxDailyAiGenerations: 999999,
    maxDailyApiUsage: 9999999,
    allowedFeatures: ['search', 'brew', 'summary', 'roast', 'export', 'report', 'custom_sources', 'advanced_search', 'api_access'],
  },
};
