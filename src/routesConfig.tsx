import { lazy } from "react";
import type { LazyExoticComponent, ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Database,
  Zap,
  DollarSign,
  AlertCircle,
  Gauge,
  Rocket,
  Shield,
  FileText,
  Book,
} from "lucide-react";

type LazyPage = LazyExoticComponent<ComponentType<unknown>>;

export interface RouteConfig {
  path: string;
  component?: LazyPage;
  protected?: boolean;
  nav?: {
    label: string;
    icon: LucideIcon;
  };
  redirectTo?: string;
}

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProvidersPage = lazy(() => import("./pages/ProvidersPage"));
const CachePage = lazy(() => import("./pages/CachePage"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));
const RateLimitsPage = lazy(() => import("./pages/RateLimitsPage"));
const AutopilotPage = lazy(() => import("./pages/AutopilotPage"));
const SetupPage = lazy(() => import("./pages/SetupPage"));
const DocsPage = lazy(() => import("./pages/DocsPage"));
const CostDashboardEnhanced = lazy(
  () => import("./pages/CostDashboardEnhanced")
);
const ResponseValidatorPage = lazy(
  () => import("./pages/ResponseValidatorPage")
);
const SchemaEnforcementPage = lazy(
  () => import("./pages/SchemaEnforcementPage")
);
const LoginPageEnhanced = lazy(() => import("./pages/LoginPageEnhanced"));

export const routesConfig: RouteConfig[] = [
  {
    path: "/login",
    component: LoginPageEnhanced,
    protected: false,
  },
  {
    path: "/dashboard",
    component: DashboardPage,
    protected: true,
    nav: { label: "Dashboard", icon: LayoutDashboard },
  },
  {
    path: "/providers",
    component: ProvidersPage,
    protected: true,
    nav: { label: "Providers", icon: Database },
  },
  {
    path: "/cache",
    component: CachePage,
    protected: true,
    nav: { label: "Cache", icon: Zap },
  },
  {
    path: "/cost",
    component: CostDashboardEnhanced,
    protected: true,
    nav: { label: "Cost Analytics", icon: DollarSign },
  },
  {
    path: "/alerts",
    component: AlertsPage,
    protected: true,
    nav: { label: "Alerts", icon: AlertCircle },
  },
  {
    path: "/rate-limits",
    component: RateLimitsPage,
    protected: true,
    nav: { label: "Rate Limits", icon: Gauge },
  },
  {
    path: "/autopilot",
    component: AutopilotPage,
    protected: true,
    nav: { label: "Autopilot", icon: Rocket },
  },
  {
    path: "/validator",
    component: ResponseValidatorPage,
    protected: true,
    nav: { label: "Validator", icon: Shield },
  },
  {
    path: "/schemas",
    component: SchemaEnforcementPage,
    protected: true,
    nav: { label: "Schemas", icon: FileText },
  },
  {
    path: "/setup",
    component: SetupPage,
    protected: true,
  },
  {
    path: "/docs",
    component: DocsPage,
    protected: true,
    nav: { label: "API Docs", icon: Book },
  },
  {
    path: "/cost-analytics",
    component: CostDashboardEnhanced,
    protected: true,
  },
  {
    path: "/",
    redirectTo: "/dashboard",
  },
  {
    path: "*",
    redirectTo: "/dashboard",
  },
];

export const navRoutes = routesConfig.filter(
  (route) => route.nav && !route.redirectTo
);

