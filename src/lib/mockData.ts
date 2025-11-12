import { v4 as uuidv4 } from 'uuid';

// ==================== Dashboard Page ====================

export const dashboardSummaryStatistics = {
  totalCostSavings: 1234.56,
  autopilotDecisionsToday: 152,
  validationFailuresLast24h: 12,
  activeSchemas: 5,
};

// ==================== Autopilot Page ====================

export const autopilotDecisionLogs = Array.from({ length: 20 }, (_, i) => ({
  decisionId: uuidv4(),
  timestamp: new Date(Date.now() - i * 1000 * 60 * 5).toISOString(),
  serviceName: `Service-${String.fromCharCode(65 + (i % 5))}`,
  decisionType: ['ENABLE_FEATURE', 'THROTTLE_API', 'SCALE_DOWN'][i % 3],
  reasoning: `Reason for decision ${i + 1}`,
  projectedSavings: i % 4 === 0 ? 0 : parseFloat((Math.random() * 100).toFixed(2)),
  status: ['executed', 'pending', 'failed'][i % 3],
}));

// ==================== Response Validator Page ====================

export const validationLogs = Array.from({ length: 30 }, (_, i) => ({
  logId: uuidv4(),
  timestamp: new Date(Date.now() - i * 1000 * 60 * 3).toISOString(),
  apiEndpoint: `/api/v1/users/${i}`,
  httpMethod: ['GET', 'POST', 'PUT'][i % 3],
  statusCode: [200, 400, 500][i % 3],
  validationStatus: ['passed', 'failed', 'auto-fixed'][i % 3],
  payloadDiff:
    i % 3 === 2
      ? {
          before: { userId: i, name: `User ${i}`, status: 'active' },
          after: { userId: i, name: `User ${i}`, status: 'activated' },
        }
      : undefined,
}));

// ==================== Schema Enforcement Page ====================

export const schemaConfigurations = Array.from({ length: 15 }, (_, i) => ({
  schemaId: uuidv4(),
  schemaName:
    i === 14
      ? 'a-very-long-schema-name-to-test-overflow-handling-and-ui-responsiveness'
      : `Schema-${String.fromCharCode(65 + i)}`,
  version: `1.${i}.0`,
  status: ['active', 'inactive'][i % 2],
  enforcementMode: ['strict', 'log-only'][i % 2],
  lastUpdated: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
  validationCount: Math.floor(Math.random() * 1000),
  failureRate: parseFloat((Math.random() * 10).toFixed(2)),
}));