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
} from "../types/api";
import {
  dashboardSummaryStatistics,
  autopilotDecisionLogs,
  validationLogs,
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
    return [];
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
    return {
      total_requests: 12345,
      total_cost: 123.45,
      cache_hits: 1234,
      cache_hit_rate: 0.1,
      cost_savings: 12.34,
      breakdown: [],
      daily_usage: [],
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
    return validationLogs;
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
    return [];
  }

  async getFailedValidationLogs() {
    return [];
  }

  async getValidationStats() {
    return {
      success_rate: 0,
      failure_rate: 0,
      autofix_success_rate: 0,
    };
  }

  async getIssueBreakdown() {
    return {
      "Invalid JSON": 0,
      "Schema Mismatch": 0,
    };
  }

  async getAutofixStats(): Promise<AutofixStats> {
    return {
      retries: {
        "0": 100,
        "1": 20,
        "2": 5,
      },
      average_retries: 0.3,
    };
  }

  async getValidationTimeline() {
    return [];
  }

  // Error helper
  handleError(): string {
    return "Mock error";
  }
}

export const mockApi = new MockCognitudeAPI();
export default mockApi;
