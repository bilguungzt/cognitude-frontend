import {
  useState,
  useRef,
  useEffect,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services";

export default function LoginPageEnhanced() {
  const [mode, setMode] = useState("login");
  const [apiKey, setApiKey] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      try {
        inputRef.current.focus();
        const len = inputRef.current.value.length;
        try {
          inputRef.current.setSelectionRange(len, len);
        } catch {
          /* ignore */
        }
      } catch {
        /* ignore */
      }
    }
  }, [isEditing]);

  const handleLogin = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your API key");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Persist the API key in the shared api client and auth context
      login(apiKey);

      // Verify the key by calling a lightweight authenticated endpoint
      // If this throws (401), the key is invalid
      await api.getProviders();

      setSuccess("Login successful! Redirecting...");

      // small delay so user sees the success message
      setTimeout(() => {
        navigate("/dashboard");
        setLoading(false);
        setSuccess("");
      }, 800);
    } catch {
      // If verification failed, clear stored key and show error
      // clear stored key if any
      try {
        api.clearApiKey();
      } catch {
        // ignore
      }
      setError("Invalid API key or unable to reach server");
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!orgName.trim()) {
      setError("Please enter your organization name");
      return;
    }

    if (orgName.length < 3) {
      setError("Organization name must be at least 3 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call backend register endpoint
      const org = await api.register(orgName);
      // OrganizationWithAPIKey type includes api_key, but keep a safe accessor
      const generatedKey =
        (org as unknown as { api_key?: string }).api_key || "";

      // Mirror previous UI behavior: switch to login and show key + copy UI
      setMode("login");
      setApiKey(generatedKey);
      setShowKey(true);
      setShowApiKey(true);
      setIsEditing(true);
      setSuccess(
        "Registration successful! Your API key is displayed below. Please save it securely."
      );
    } catch (err) {
      // axios error shape - defensively extract message
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyErr = err as any;
      const message =
        anyErr?.response?.data?.detail ||
        anyErr?.message ||
        "Registration failed";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setApiKey("");
    setOrgName("");
    setError("");
    setSuccess("");
    setShowKey(false);
    setShowApiKey(false);
    setIsEditing(true);
  };

  const toggleShowApiKey = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowApiKey(!showApiKey);
  };

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setSuccess("API key copied to clipboard");
      setTimeout(() => setSuccess(""), 1800);
    } catch {
      setError("Unable to copy API key");
      setTimeout(() => setError(""), 1800);
    }
  };

  const handleKeyPress = (
    e: KeyboardEvent<HTMLInputElement>,
    handler: () => void
  ) => {
    if ((e as KeyboardEvent<HTMLInputElement>).key === "Enter") {
      handler();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Cognitude AI
          </h1>
          <p className="text-gray-600 text-lg">
            {mode === "login"
              ? "Monitor your ML models for drift"
              : "Create your account to get started"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
            <button
              onClick={() => {
                setMode("login");
                resetForm();
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                mode === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode("register");
                resetForm();
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                mode === "register"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Register
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Login */}
          {mode === "login" && (
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="apiKey"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  API Key
                </label>
                <div className="relative">
                  <input
                    id="apiKey"
                    ref={inputRef}
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleLogin)}
                    onFocus={() => setIsEditing(true)}
                    placeholder="Enter your API key"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    disabled={loading}
                    autoComplete="off"
                    readOnly={!isEditing}
                    onPaste={(e) => {
                      // Ensure full pasted value is captured (some browsers may paste before React's onChange)
                      const pasted = e.clipboardData?.getData("text") ?? "";
                      if (pasted) {
                        e.preventDefault();
                        setApiKey(pasted);
                        // ensure the input gets focus and cursor placed at end
                        setIsEditing(true);
                        setTimeout(() => {
                          try {
                            inputRef.current?.focus();
                            const len = (inputRef.current?.value || "").length;
                            inputRef.current?.setSelectionRange(len, len);
                          } catch {
                            /* ignore */
                          }
                        }, 0);
                      }
                    }}
                  />

                  {/* Masked view - only shown when NOT editing */}
                  {!isEditing && apiKey && (
                    <div
                      onClick={() => {
                        // Switch to editing and ensure the input receives focus so paste/caret work
                        setIsEditing(true);
                        setTimeout(() => {
                          try {
                            inputRef.current?.focus();
                            const len = (inputRef.current?.value || "").length;
                            inputRef.current?.setSelectionRange(len, len);
                          } catch {
                            /* ignore */
                          }
                        }, 0);
                      }}
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 bg-white cursor-text hover:border-gray-400 transition-colors flex items-center"
                    >
                      <span
                        className={`flex-1 ${
                          showApiKey ? "" : "truncate"
                        } text-gray-900`}
                      >
                        {showApiKey
                          ? apiKey
                          : apiKey.replace(/.(?=.{4})/g, "•")}
                      </span>
                    </div>
                  )}

                  {/* Eye icon - always visible */}
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent input blur
                      toggleShowApiKey(e);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 z-10"
                    aria-label={showApiKey ? "Hide API key" : "Show API key"}
                  >
                    {showApiKey ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {showKey && (
                  <div className="mt-3">
                    <p className="text-sm text-amber-600 mb-2 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Save this API key securely. You won't be able to see it
                        again after you leave this page.
                      </span>
                    </p>

                    <div className="flex gap-2 items-center">
                      <input
                        readOnly
                        value={apiKey}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 font-mono text-sm overflow-x-auto whitespace-nowrap"
                        onFocus={(e) => e.currentTarget.select()}
                      />
                      <button
                        type="button"
                        onClick={copyApiKey}
                        className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogin}
                disabled={loading || !apiKey.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          )}

          {/* Register */}
          {mode === "register" && (
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="orgName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Organization Name
                </label>
                <input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleRegister)}
                  placeholder="Enter your organization name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Choose a unique name for your organization
                </p>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading || !orgName.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("register");
                      resetForm();
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Register now
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      resetForm();
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Real-time Monitoring
            </h3>
            <p className="text-sm text-gray-600">
              Track model performance continuously
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Smart Alerts</h3>
            <p className="text-sm text-gray-600">
              Get notified of drift instantly
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Easy Integration
            </h3>
            <p className="text-sm text-gray-600">Simple API to get started</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Cognitude AI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
