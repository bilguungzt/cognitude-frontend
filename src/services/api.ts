import axios from "axios";
import type { AxiosInstance, AxiosError } from "axios";
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
  APIError,
  Model,
  CreateModelRequest,
  SchemaStat,
  ValidationLog,
  AutopilotClassificationBreakdown,
  AutopilotModelRouting,
  AutopilotSavings,
  AutopilotLog,
  AutopilotSavingsBreakdown,
  AutopilotCostComparison,
  ValidationStats,
  IssueBreakdown,
  AutofixStats,
  ValidationTimelineEvent,
  RetryAttemptsData,
  DashboardSummaryStats,
  AutopilotDashboardData,
  EnhancedDashboardData,
  ReconciliationReportResponse,
} from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5175";

class CognitudeAPI {
  private client: AxiosInstance;
  private apiKey: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Load API key from localStorage
    this.apiKey = localStorage.getItem("cognitude_api_key");
    if (this.apiKey) {
      this.setApiKey(this.apiKey);
    }

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<APIError>) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear API key and redirect to login
          this.clearApiKey();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== Auth Methods ====================

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem("cognitude_api_key", apiKey);
    this.client.defaults.headers.common["X-API-Key"] = apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem("cognitude_api_key");
    delete this.client.defaults.headers.common["X-API-Key"];
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  isAuthenticated(): boolean {
    return !!this.apiKey;
  }

  async register(name: string): Promise<Organization> {
    const response = await this.client.post<Organization>("/auth/register", {
      name,
    });
    return response.data;
  }

  // ==================== Provider Management ====================

  async getProviders(): Promise<Provider[]> {
    const response = await this.client.get<Provider[]>("/providers/");
    return response.data;
  }

  async getProvider(providerId: number): Promise<Provider> {
    const response = await this.client.get<Provider>(
      `/providers/${providerId}`
    );
    return response.data;
  }

  async createProvider(provider: ProviderCreate): Promise<Provider> {
    const response = await this.client.post<Provider>("/providers/", provider);
    return response.data;
  }

  async updateProvider(
    providerId: number,
    update: ProviderUpdate
  ): Promise<Provider> {
    const response = await this.client.put<Provider>(
      `/providers/${providerId}`,
      update
    );
    return response.data;
  }

  async deleteProvider(providerId: number): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(
      `/providers/${providerId}`
    );
    return response.data;
  }

  // ==================== Chat Completions ====================

  async chatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const response = await this.client.post<ChatCompletionResponse>(
      "/v1/chat/completions",
      request
    );
    return response.data;
  }

  async smartCompletion(
    request: Omit<ChatCompletionRequest, "model">
  ): Promise<ChatCompletionResponse> {
    const response = await this.client.post<ChatCompletionResponse>(
      "/v1/smart/completions",
      request
    );
    return response.data;
  }

  // ==================== Analytics ====================

  async getUsageStats(params?: {
    start_date?: string;
    end_date?: string;
    group_by?: "day" | "model" | "provider";
  }): Promise<UsageStats> {
    const response = await this.client.get<UsageStats>("/analytics/usage", {
      params,
    });
    return response.data;
  }

  // ==================== Reconciliation ====================
  async getReconciliationReports(params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<ReconciliationReportResponse> {
    const response = await this.client.get<ReconciliationReportResponse>(
      "/reconciliation/reports",
      {
        params,
      }
    );
    return response.data;
  }

  async getRecommendations(): Promise<RecommendationsResponse> {
    const response = await this.client.get<RecommendationsResponse>(
      "/analytics/recommendations"
    );
    return response.data;
  }

  async getUsageAnalytics(
    start_date: string,
    end_date: string
  ): Promise<UsageStats> {
    return this.getUsageStats({ start_date, end_date });
  }

  // ==================== Cache Management ====================

  async getCacheStats(): Promise<CacheStats> {
    const response = await this.client.get<CacheStats>("/cache/stats");
    return response.data;
  }

  async clearCache(request?: CacheClearRequest): Promise<CacheClearResponse> {
    const response = await this.client.post<CacheClearResponse>(
      "/cache/clear",
      request || {}
    );
    return response.data;
  }

  // ==================== Alert Management ====================

  async getAlertChannels(): Promise<AlertChannel[]> {
    const response = await this.client.get<AlertChannel[]>("/alerts/channels");
    return response.data;
  }

  async createAlertChannel(channel: AlertChannelCreate): Promise<AlertChannel> {
    const response = await this.client.post<AlertChannel>(
      "/alerts/channels",
      channel
    );
    return response.data;
  }

  async updateAlertChannel(
    channelId: number,
    update: Partial<AlertChannelCreate>
  ): Promise<AlertChannel> {
    const response = await this.client.put<AlertChannel>(
      `/alerts/channels/${channelId}`,
      update
    );
    return response.data;
  }

  async deleteAlertChannel(channelId: number): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(
      `/alerts/channels/${channelId}`
    );
    return response.data;
  }

  async getAlertConfig(): Promise<AlertConfig> {
    const response = await this.client.get<AlertConfig>("/alerts/config");
    return response.data;
  }

  async updateAlertConfig(config: AlertConfig): Promise<AlertConfig> {
    const response = await this.client.post<AlertConfig>(
      "/alerts/config",
      config
    );
    return response.data;
  }

  // ==================== Rate Limiting ====================

  async getRateLimitConfig(): Promise<RateLimitConfig> {
    const response = await this.client.get<RateLimitConfig>(
      "/rate-limits/config"
    );
    return response.data;
  }

  async updateRateLimitConfig(
    config: RateLimitUpdate
  ): Promise<RateLimitConfig> {
    const response = await this.client.put<RateLimitConfig>(
      "/rate-limits/config",
      config
    );
    return response.data;
  }

  // ==================== Model Management ====================

  async getModels(): Promise<Model[]> {
    const response = await this.client.get<Model[]>("/models/");
    return response.data;
  }

  async getModel(modelId: number): Promise<Model> {
    const response = await this.client.get<Model>(`/models/${modelId}`);
    return response.data;
  }

  async createModel(model: CreateModelRequest): Promise<Model> {
    const response = await this.client.post<Model>("/models/", model);
    return response.data;
  }

  // ==================== Schema Enforcement ====================

  async getActiveSchemas(): Promise<SchemaStat[]> {
    const response = await this.client.get<SchemaStat[]>("/api/schemas/active");
    return response.data;
  }

  async getFailedValidationLogs(): Promise<ValidationLog[]> {
    const response = await this.client.get<ValidationLog[]>(
      "/api/schemas/validation-logs/failed"
    );
    return response.data;
  }

  async getRetryAttemptsData(): Promise<RetryAttemptsData> {
    const response = await this.client.get<RetryAttemptsData>(
      "/api/schemas/retry-attempts"
    );
    return response.data;
  }

  async uploadSchema(
    name: string,
    schema: { schema_data: object }
  ): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      "/api/schemas/upload",
      { name, ...schema }
    );
    return response.data;
  }

  // ==================== Schema Management (Legacy) ====================

  async getSchemaStats(): Promise<{ top_5_most_used: SchemaStat[] }> {
    const response = await this.client.get<{ top_5_most_used: SchemaStat[] }>(
      "/api/v1/dashboard/schema-stats"
    );
    return response.data;
  }

  // ==================== Validation Logs (Legacy) ====================

  async getValidationLogs(): Promise<ValidationLog[]> {
    const response = await this.client.get<ValidationLog[]>(
      "/validation-logs/"
    );
    return response.data;
  }

  async getDashboardSummaryStatistics(): Promise<DashboardSummaryStats> {
    const response = await this.client.get<DashboardSummaryStats>(
      "/api/v1/dashboard/summary"
    );
    return response.data;
  }

  // ==================== Autopilot Methods ====================

  async getAutopilotClassificationBreakdown(): Promise<AutopilotClassificationBreakdown> {
    const response = await this.client.get(
      "/autopilot/classification-breakdown"
    );
    return response.data;
  }

  async getAutopilotModelRouting(): Promise<AutopilotModelRouting> {
    const response = await this.client.get("/autopilot/model-routing");
    return response.data;
  }

  async getAutopilotSavings(): Promise<AutopilotSavings> {
    const response = await this.client.get("/autopilot/savings");
    return response.data;
  }

  async getAutopilotLogs(): Promise<AutopilotLog[]> {
    const response = await this.client.get("/autopilot/logs");
    return response.data;
  }

  async getAutopilotSavingsBreakdown(params: {
    start_date: string;
    end_date: string;
  }): Promise<AutopilotSavingsBreakdown> {
    const response = await this.client.get("/autopilot/savings/breakdown", {
      params,
    });
    return response.data;
  }

  async getAutopilotCostComparison(params: {
    start_date: string;
    end_date: string;
  }): Promise<AutopilotCostComparison> {
    const response = await this.client.get("/autopilot/savings/comparison", {
      params,
    });
    return response.data;
  }

  async getAutopilotDashboardData(): Promise<AutopilotDashboardData> {
    const response = await this.client.get("/autopilot/dashboard");
    return response.data;
  }

  async getEnhancedDashboardData(): Promise<EnhancedDashboardData> {
    const response = await this.client.get<EnhancedDashboardData>(
      "/api/v1/dashboard/enhanced"
    );
    return response.data;
  }
  // ==================== Response Validator ====================

  async getValidationStats(): Promise<ValidationStats> {
    const response = await this.client.get<ValidationStats>("/validator/stats");
    return response.data;
  }

  async getIssueBreakdown(): Promise<IssueBreakdown> {
    const response = await this.client.get<IssueBreakdown>(
      "/validator/issue-breakdown"
    );
    return response.data;
  }

  async getAutofixStats(): Promise<AutofixStats> {
    const response = await this.client.get<AutofixStats>(
      "/validator/autofix-stats"
    );
    return response.data;
  }

  async getValidationTimeline(params?: {
    status?: "all" | "success" | "failure";
    error_type?: string;
  }): Promise<ValidationTimelineEvent[]> {
    const response = await this.client.get<ValidationTimelineEvent[]>(
      "/validator/timeline",
      { params }
    );
    return response.data;
  }

  // ==================== Error Handling Helper ====================

  public handleError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<APIError>;
      if (axiosError.response?.data?.error) {
        return axiosError.response.data.error.message;
      }
      return axiosError.message;
    }
    return "An unexpected error occurred";
  }
}

// Export singleton instance
import { mockApi } from "./mockApi";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

export const api = useMock ? mockApi : new CognitudeAPI();
export default api;
