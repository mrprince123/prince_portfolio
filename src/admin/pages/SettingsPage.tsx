import React, { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  getApiBaseUrl,
  setApiBaseUrl,
  adminApi,
  getAdminToken,
} from "../lib/adminApi";
import {
  Server,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  RefreshCw,
  Lock,
  User,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const SettingsPage: React.FC = () => {
  const { user, logout, refreshProfile } = useAdminAuth();
  const navigate = useNavigate();

  // Profile Edit State
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Backend URL State
  const [apiUrl, setApiUrlState] = useState(getApiBaseUrl());
  const [testingPing, setTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{
    ok: boolean;
    latencyMs?: number;
    dbStatus?: string;
    message?: string;
  } | null>(null);

  const activeToken = getAdminToken();

  // Password Complexity Validation Helpers
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isPasswordValid =
    hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() && !email.trim()) {
      toast.error("Please provide a username or email to update");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await adminApi.auth.updateProfile({
        username: username.trim(),
        email: email.trim(),
      });
      await refreshProfile();
      toast.success("Profile credentials updated successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!isPasswordValid) {
      toast.error("New password does not meet complexity requirements");
      return;
    }

    if (!passwordsMatch) {
      toast.error("New password and confirmation do not match");
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await adminApi.auth.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success(res.message || "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      toast.error(msg);
    } finally {
      setIsChangingPass(false);
    }
  };

  // API Backend URL handlers
  const handleSaveApiUrl = () => {
    if (!apiUrl.trim()) {
      toast.error("API URL cannot be empty");
      return;
    }
    setApiBaseUrl(apiUrl.trim());
    toast.success("API Base URL saved to local configuration");
  };

  const handleResetApiUrl = () => {
    const defaultUrl = "http://localhost:5001/api/v1";
    setApiUrlState(defaultUrl);
    setApiBaseUrl(defaultUrl);
    toast.info("Reset to default local backend (http://localhost:5001/api/v1)");
  };

  const handleTestConnection = async () => {
    setTestingPing(true);
    setPingResult(null);
    const start = performance.now();

    try {
      const stats = await adminApi.overview.getStats();
      const latency = Math.round(performance.now() - start);
      setPingResult({
        ok: true,
        latencyMs: latency,
        dbStatus: stats.systemInfo.dbStatus,
      });
      toast.success(`Connected successfully in ${latency}ms`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      setPingResult({
        ok: false,
        message: msg,
      });
      toast.error(`Connection failed: ${msg}`);
    } finally {
      setTestingPing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Security & Settings</h1>
        <p className="text-xs text-muted-foreground">
          Manage administrator credentials, enforce strong passwords, and inspect backend architecture
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security & Password Change */}
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Lock className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-xs font-medium">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPass ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter existing password"
                  className="h-8 text-xs pr-8"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-medium">
                New Strong Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters, uppercase, lowercase, digit, symbol"
                  className="h-8 text-xs pr-8"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Live Password Complexity Checklist */}
            <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 space-y-1.5 text-[11px]">
              <div className="font-medium text-foreground/80 text-[10px] uppercase tracking-wider">
                Complexity Requirements
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                  {hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  8+ characters
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                  {hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  1+ uppercase (A-Z)
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                  {hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  1+ lowercase (a-z)
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                  {hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  1+ number (0-9)
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                  {hasSpecial ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  1+ symbol (!@#$...)
                </div>
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-500 font-medium" : "text-muted-foreground"}`}>
                  {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  Passwords match
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="h-8 text-xs"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isChangingPass || !isPasswordValid || !passwordsMatch || !currentPassword}
              size="sm"
              className="w-full h-8 text-xs font-medium"
            >
              {isChangingPass ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                  Updating Password...
                </>
              ) : (
                "Save New Password"
              )}
            </Button>
          </form>
        </div>

        {/* Profile Details & Update */}
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">Admin Profile</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-medium">
                Display Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Prince"
                className="h-8 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yourname@domain.com"
                className="h-8 text-xs"
                required
              />
              <p className="text-[10px] text-muted-foreground">
                This email is used to log into the administrative management console.
              </p>
            </div>

            <div className="space-y-2 pt-1 border-t border-border/40 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account Role</span>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-500/30">
                  {user?.role?.toUpperCase() || "ADMIN"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lockout Protection</span>
                <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
                  Active (5-attempt threshold)
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Database User ID</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {user?.id || user?._id || "68e1f70f897a7ae74196b00e"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="submit"
                disabled={isUpdatingProfile}
                size="sm"
                className="flex-1 h-8 text-xs font-medium"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : (
                  "Update Profile Info"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refreshProfile()}
                className="h-8 text-xs gap-1 border-border/60"
              >
                <RefreshCw className="h-3 w-3" />
                Sync
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backend API Configuration */}
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Server className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">API Backend Routing</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="apiBaseUrl" className="text-xs font-medium">
                Active API Base URL
              </Label>
              <Input
                id="apiBaseUrl"
                value={apiUrl}
                onChange={(e) => setApiUrlState(e.target.value)}
                placeholder="http://localhost:5001/api/v1"
                className="h-8 font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Configured with IP sliding-window rate limiters & strict CORS policies.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" onClick={handleSaveApiUrl} className="h-8 text-xs flex-1">
                Save Endpoint
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testingPing}
                className="h-8 text-xs gap-1 border-border/60 flex-1"
              >
                {testingPing ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" />
                    Test Ping
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetApiUrl}
                className="h-8 text-xs text-muted-foreground"
              >
                Reset
              </Button>
            </div>

            {pingResult && (
              <div
                className={`rounded-lg p-3 text-xs border ${
                  pingResult.ok
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {pingResult.ok ? (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Server reachable ({pingResult.dbStatus})
                    </span>
                    <span className="font-mono text-[11px]">{pingResult.latencyMs}ms latency</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{pingResult.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Authentication Credentials & Session Termination */}
        <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Key className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">Session Security</h2>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground">
              Current bearer token signed by backend JWT secret and verified with user existence & lockout checks:
            </p>
            <div className="rounded-lg bg-muted/40 p-3 font-mono text-[11px] break-all border border-border/50 text-foreground/80">
              {activeToken ? (
                `${activeToken.substring(0, 30)}••••••••••••••••••••••••••••••••${activeToken.substring(
                  Math.max(0, activeToken.length - 20)
                )}`
              ) : (
                <span className="text-muted-foreground">No active token present</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-muted-foreground">
                Tokens automatically expire after 2 hours.
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="h-8 text-xs gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out of Console
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
