import type {
  Organization,
  Provider,
  ProviderCreate,
  ProviderUpdate,
  ChatCompletionRequest,
  ChatCompletionResponse,
  UsageStats,
  RecommendationsResponse,
  CacheStats,
  CacheClearRequest,
  CacheClearResponse,
  AlertChannel,
  AlertChannelCreate,
  AlertConfig,
  RateLimitConfig,
  RateLimitUpdate,
  AutopilotSavingsBreakdown,
  AutopilotCostComparison,
  AutofixStats,
 Model,
 CreateModelRequest,
} from "../types/api";
import {
  dashboardSummaryStatistics,
  autopilotDecisionLogs,
  schemaConfigurations,
} from "../lib/mockData";

class MockCognitudeAPI {
  private apiKey: string | null = null;

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem("cognitude_api_key", apiKey);
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem("cognitude_api_key");
  }

  getApiKey(): string | null {
    return this.apiKey || localStorage.getItem("cognitude_api_key");
  }

  isAuthenticated(): boolean {
    return true;
  }

  // Auth (mocked)
  async register(name: string): Promise<Organization> {
    // return a fake organization with a generated api_key
    const now = new Date().toISOString();
    return {
      id: Math.floor(Math.random() * 10000) + 100,
      name,
      api_key: `mock-${Math.random().toString(36).slice(2, 12)}`,
      created_at: now,
    };
  }

  // Providers
  async getProviders(): Promise<Provider[]> {
    return [
      {
        id: 1,
        organization_id: 1,
        provider: "openai",
        api_key: "sk-...",
        priority: 1,
        enabled: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        organization_id: 1,
        provider: "anthropic",
        api_key: "sk-...",
        priority: 2,
        enabled: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        organization_id: 1,
        provider: "mistral",
        api_key: "sk-...",
        priority: 3,
        enabled: false,
        created_at: new Date().toISOString(),
      },
    ];
  }

  async getProvider(providerId: number): Promise<Provider> {
    const providers = await this.getProviders();
    const found = providers.find((p) => p.id === providerId);
    if (!found) throw new Error("Provider not found (mock)");
    return found;
  }

  async createProvider(provider: ProviderCreate): Promise<Provider> {
    return {
      id: Math.floor(Math.random() * 10000) + 200,
      organization_id: 1,
      provider: provider.provider,
      api_key: provider.api_key,
      priority: provider.priority || 0,
      enabled: provider.enabled ?? true,
      created_at: new Date().toISOString(),
    } as Provider;
  }

  async updateProvider(
    providerId: number,
    update: ProviderUpdate
  ): Promise<Provider> {
    const existing = await this.getProvider(providerId);
    return {
      ...existing,
      ...update,
      updated_at: new Date().toISOString(),
    } as Provider;
  }

  async deleteProvider(providerId: number): Promise<{ message: string }> {
    return { message: `Mock deleted provider ${providerId}` };
  }

  // Chat completions
  async chatCompletion(
    _request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const sample: ChatCompletionResponse = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1677652288,
      model: "gpt-3.5-turbo-0613",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Hello! How can I help you today?",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 9,
        completion_tokens: 12,
        total_tokens: 21,
      },
      x_cognitude: {
        cached: false,
        cost: 0.000021,
        provider: "openai",
      },
    };
    return sample;
  }

  async smartCompletion(
    request: Omit<ChatCompletionRequest, "model">
  ): Promise<ChatCompletionResponse> {
    // simply reuse chatCompletion mock
    return this.chatCompletion({ ...request, model: "smart-mock" });
  }

  // Analytics
  async getUsageStats(_params?: Record<string, string>): Promise<UsageStats> {
    const daily_usage = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        requests: Math.floor(Math.random() * 1000) + 500,
        cost: Math.random() * 20 + 10,
      };
    });

    return {
      total_requests: 12345,
      total_cost: 123.45,
      cache_hits: 1234,
      cache_hit_rate: 0.1,
      cost_savings: 12.34,
      breakdown: [
        { model: 'gpt-4', requests: 5000, cost: 80.25, tokens: 500000 },
        { model: 'gpt-3.5-turbo', requests: 7345, cost: 43.20, tokens: 734500 },
      ],
      daily_usage: daily_usage.reverse(),
    };
  }

  async getRecommendations(): Promise<RecommendationsResponse> {
    // return a couple of canned recommendations
    return {
      recommendations: [
        {
          type: "cache",
          title: "Cache repeated prompts",
          description: "Enable caching for duplicate prompts to save cost.",
          potential_savings: 120.5,
          priority: "high",
        },
        {
          type: "model",
          title: "Use cheaper model for simple tasks",
          description: "Route classification to gpt-3.5.",
          potential_savings: 45.0,
          priority: "medium",
        },
      ],
      total_potential_savings: 165.5,
    };
  }

  async getAutopilotSavingsBreakdown(
    _params?: Record<string, string>
  ): Promise<AutopilotSavingsBreakdown> {
    return {
      "Model Downgrade": { savings: 120.5, requests: 1000 },
      "Cache Hit": { savings: 45.0, requests: 500 },
    };
  }

  async getAutopilotCostComparison(
    _params?: Record<string, string>
  ): Promise<AutopilotCostComparison> {
    return {
      could_have_spent: 500.0,
      actually_spent: 334.5,
      savings: 165.5,
    };
  }

  // Cache
  async getCacheStats(): Promise<CacheStats> {
    return {
      redis: {
        hits: 1234,
        misses: 123,
        hit_rate: 0.9,
        total_keys: 1357,
        memory_usage_mb: 12.3,
      },
      postgresql: {
        total_cached_responses: 12345,
        cost_savings: 123.45,
        oldest_cache_entry: new Date().toISOString(),
      },
      lifetime_savings: {
        total_cost_saved: 1234.56,
        requests_served_from_cache: 123456,
      },
    };
  }

  async clearCache(_request?: CacheClearRequest): Promise<CacheClearResponse> {
    return {
      message: "Mock: cache cleared",
      redis_keys_deleted: 123,
      postgresql_rows_deleted: 12,
    };
  }

  // Alerts
  async getAlertChannels(): Promise<AlertChannel[]> {
    return [];
  }

  async createAlertChannel(channel: AlertChannelCreate): Promise<AlertChannel> {
    return {
      id: Math.floor(Math.random() * 10000) + 500,
      organization_id: 1,
      channel_type: channel.channel_type,
      configuration: channel.configuration,
      enabled: true,
      created_at: new Date().toISOString(),
    };
  }

  async updateAlertChannel(
    channelId: number,
    update: Partial<AlertChannelCreate>
  ): Promise<AlertChannel> {
    const channels = await this.getAlertChannels();
    const found = channels[0];
    return { ...found, ...update, id: channelId, created_at: found.created_at };
  }

  async deleteAlertChannel(channelId: number): Promise<{ message: string }> {
    return { message: `Mock deleted alert channel ${channelId}` };
  }

  async getAlertConfig(): Promise<AlertConfig> {
    return {
      id: 1,
      organization_id: 1,
      cost_threshold_daily: 100,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async updateAlertConfig(config: AlertConfig): Promise<AlertConfig> {
    return { ...config, updated_at: new Date().toISOString() };
  }

  // Rate limits
  async getRateLimitConfig(): Promise<RateLimitConfig> {
    return {
      organization_id: 1,
      requests_per_minute: 60,
      requests_per_hour: 1000,
      requests_per_day: 10000,
      enabled: true,
      updated_at: new Date().toISOString(),
    };
  }

  async updateRateLimitConfig(
    config: RateLimitUpdate
  ): Promise<RateLimitConfig> {
    const current = await this.getRateLimitConfig();
    return {
      ...current,
      ...config,
      updated_at: new Date().toISOString(),
    } as RateLimitConfig;
  }

  // New Mock Data Methods
  async getDashboardSummaryStatistics() {
    return dashboardSummaryStatistics;
  }

  async getAutopilotDecisionLogs() {
    return autopilotDecisionLogs;
  }

  async getValidationLogs() {
    return [];
  }

  async getSchemaConfigurations() {
    return schemaConfigurations;
  }

  async getSchemaStats() {
    return { top_5_most_used: [] };
  }

  async uploadSchema(name: string, schema: object) {
    console.log("Mock upload schema", name, schema);
    return { message: "Schema uploaded successfully" };
  }

  async getActiveSchemas() {
    return [
      {
        schema_name: 'user_profile',
        total_attempts: 1250,
        failure_rate: 0.05,
        avg_retries: 0.1,
      },
      {
        schema_name: 'product_catalog',
        total_attempts: 800,
        failure_rate: 0.12,
        avg_retries: 0.25,
      },
      {
        schema_name: 'order_details',
        total_attempts: 2500,
        failure_rate: 0.02,
        avg_retries: 0.05,
      },
    ];
  }

  async getFailedValidationLogs() {
    return [
      {
        id: 1,
        request_id: 'req_123',
        timestamp: new Date().toISOString(),
        status: 'failure' as "success" | "failure",
        request_summary: 'Product catalog request',
        response_summary: 'Invalid JSON format',
        error_type: 'Invalid JSON',
        retries: 2,
        schema_name: 'product_catalog',
      },
    ];
  }

  async getValidationStats() {
    return {
      success_rate: 98.2,
      failure_rate: 1.8,
      autofix_success_rate: 76.5,
    };
  }

  async getIssueBreakdown() {
    return {
      "Invalid JSON": 12,
      "Schema Mismatch": 5,
      "Missing Fields": 3,
    };
  }

  async getAutofixStats(): Promise<AutofixStats> {
    return {
      retries: {
        "0": 85,
        "1": 10,
        "2": 5,
      },
      average_retries: 0.25,
    };
  }

  async getValidationTimeline() {
    return [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        status: 'success' as 'success' | 'failure',
        request_summary: 'User profile update',
        response_summary: 'OK',
        error_type: null,
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        status: 'failure' as 'success' | 'failure',
        request_summary: 'Product catalog request',
        response_summary: 'Invalid JSON format',
        error_type: 'Invalid JSON',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        status: 'success' as 'success' | 'failure',
        request_summary: 'Login attempt',
        response_summary: 'OK',
        error_type: null,
      },
    ];
  }

  async getAutopilotClassificationBreakdown() {
    return {
      'classification': 50,
      'summarization': 25,
      'translation': 15,
      'generation': 10,
    };
  }

  async getAutopilotModelRouting() {
    return {
      'gpt-4': 20,
      'gpt-3.5-turbo': 60,
      'claude-2': 15,
      'gemini-pro': 5,
    };
  }

  async getAutopilotSavings() {
    return {
      cost_savings: 123.45,
      cache_hit_rate: 0.67,
    };
  }

  async getAutopilotLogs() {
    return [
      {
        timestamp: new Date().toISOString(),
        original_model: 'gpt-4',
        selected_model: 'gpt-3.5-turbo',
        reason: 'Cost optimization',
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        original_model: 'gpt-4',
        selected_model: 'gpt-4',
        reason: 'High complexity',
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        original_model: 'claude-2',
        selected_model: 'gpt-3.5-turbo',
        reason: 'Cache hit',
      },
    ];
  }

  async getModel() {
    return null;
  }

  async getCurrentDrift() {
    return {};
  }

  async getDriftHistory() {
    return [];
  }

  async getModels() {
    return [];
  }

  async createModel(model: CreateModelRequest): Promise<Model> {
    console.log("Mock create model", model);
    const now = new Date().toISOString();
    return {
      id: Math.floor(Math.random() * 10000) + 1000,
      name: model.name,
      version: model.version,
      description: model.description,
      features: model.features.map((f, i) => ({
        ...f,
        id: i + 1,
      })),
      created_at: now,
      updated_at: now,
    };
  }

  async getUsageAnalytics() {
    return this.getUsageStats();
  }

  async getEnhancedDashboardData() {
    const generateSparkline = () => Array.from({ length: 20 }, () => Math.floor(Math.random() * 100));

    return {
      heroStats: {
        couldHaveSpent: 18750.75,
        actuallySpent: 14230.50,
        totalSavings: 4520.25,
        projectedMonthlySavings: 6100.0,
      },
      keyMetrics: [
        {
          title: "Total Savings",
          value: "$4,520.25",
          trend: "+15.2%",
          sparklineData: generateSparkline(),
          color: "green" as "green" | "blue" | "red",
        },
        {
          title: "Avg. Latency",
          value: "320ms",
          trend: "-8.5%",
          sparklineData: generateSparkline().reverse(),
          color: "green" as "green" | "blue" | "red",
        },
        {
          title: "Cache Hit Rate",
          value: "42.7%",
          trend: "+3.1%",
          sparklineData: generateSparkline(),
          color: "blue" as "green" | "blue" | "red",
        },
        {
          title: "Error Rate",
          value: "1.2%",
          trend: "+0.5%",
          sparklineData: generateSparkline(),
          color: "red" as "green" | "blue" | "red",
        },
      ],
      bestOptimization: {
        originalModel: "GPT-4",
        selectedModel: "GPT-3.5 Turbo",
        savingsPerRequest: 0.04,
        totalImpact: 1230.45,
        requestCount: 380,
      },
      activityFeed: [
        {
          id: "evt_1",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          type: "model_reroute",
          description: "Rerouted 50 requests from `gpt-4` to `gpt-3.5-turbo` saving an estimated $5.20.",
        },
        {
          id: "evt_2",
          timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          type: "cache_hit",
          description: "Served 120 requests from cache, avoiding fresh computation costs.",
        },
        {
          id: "evt_3",
          timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
          type: "schema_autofix",
          description: "Auto-fixed 15 responses for `UserProfile` schema.",
        },
        {
          id: "evt_4",
          timestamp: new Date(Date.now() - 1000 * 60 * 62).toISOString(),
          type: "alert_triggered",
          description: "Daily cost threshold alert of $500 was triggered.",
        },
      ],
      savingsOverTime: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: "Cumulative Savings",
            data: Array.from({ length: 30 }, (_, i) => (i + 1) * 150 + Math.random() * 100),
            borderColor: "#10B981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            fill: true,
          },
        ],
      },
      cacheVsFresh: {
        labels: Array.from({ length: 12 }, (_, i) => new Date(2023, i, 1).toLocaleString('default', { month: 'short' })),
        datasets: [
          {
            label: "Cached Responses",
            data: [1200, 1500, 1800, 2200, 2500, 2800, 3100, 3400, 3700, 4000, 4300, 4600],
            backgroundColor: "#4F46E5",
          },
          {
            label: "Fresh Computations",
            data: [3000, 2800, 2600, 2400, 2200, 2000, 1800, 1600, 1400, 1200, 1000, 800],
            backgroundColor: "#A5B4FC",
          },
        ],
      },
    };
  }

  async getAutopilotDashboardData() {
    return {
      heroStats: {
        couldHaveSpent: 1250.75,
        actuallySpent: 875.50,
        savings: 375.25,
      },
      keyMetrics: [
        {
          title: "Optimization Rate",
          value: "70%",
          comparison: "+5% vs last week",
        },
        {
          title: "Avg. Response Time",
          value: "450ms",
          comparison: "-50ms vs last week",
        },
        {
          title: "Total Requests",
          value: "1,234,567",
          comparison: "+10% vs last week",
        },
      ],
      classificationBreakdown: {
        labels: ["Classification", "Summarization", "Translation", "Generation", "Other"],
        datasets: [
          {
            data: [45, 25, 15, 10, 5],
            backgroundColor: [
              "#4F46E5",
              "#10B981",
              "#F59E0B",
              "#EF4444",
              "#6B7280",
            ],
          },
        ],
      },
      modelRouting: {
        nodes: [
          { id: "User Request" },
          { id: "Autopilot" },
          { id: "GPT-4" },
          { id: "GPT-3.5-Turbo" },
          { id: "Claude 3 Sonnet" },
          { id: "Gemini Pro" },
        ],
        links: [
          { source: "User Request", target: "Autopilot", value: 100 },
          { source: "Autopilot", target: "GPT-4", value: 20 },
          { source: "Autopilot", target: "GPT-3.5-Turbo", value: 55 },
          { source: "Autopilot", target: "Claude 3 Sonnet", value: 15 },
          { source: "Autopilot", target: "Gemini Pro", value: 10 },
        ],
      },
      logs: [
        {
          timestamp: new Date().toISOString(),
          original_model: 'gpt-4',
          selected_model: 'gpt-3.5-turbo',
          reason: 'Cost optimization for simple query',
          cost_saved: 0.0015,
          speed_improvement: 250,
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          original_model: 'gpt-4',
          selected_model: 'gpt-4',
          reason: 'High complexity detected',
          cost_saved: 0,
          speed_improvement: 0,
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          original_model: 'claude-3-opus',
          selected_model: 'claude-3-sonnet',
          reason: 'Latency requirement met by smaller model',
          cost_saved: 0.002,
          speed_improvement: 400,
        },
        {
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          original_model: 'gemini-pro',
          selected_model: 'gpt-3.5-turbo',
          reason: 'Provider API latency spike',
          cost_saved: 0.0005,
          speed_improvement: 150,
        },
      ],
    };
  }

  // Error helper
  handleError(): string {
    return "Mock error";
  }
}

export const mockApi = new MockCognitudeAPI();
export default mockApi;
