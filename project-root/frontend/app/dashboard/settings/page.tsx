"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailUpdates: true,
    dataCollection: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const currentUser = api.getUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
    }
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      
      localStorage.setItem("career_mentor_user", JSON.stringify({
        ...user,
        ...formData,
      }));
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-muted">Manage your account and preferences</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              message.type === "success"
                ? "bg-success/10 border-success/20 text-success"
                : "bg-danger/10 border-danger/20 text-danger"
            }`}
          >
            {message.text}
          </div>
        )}

        {}
        <div className="glass rounded-3xl p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleProfileChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-muted mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleProfileChange}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted mt-1">Email cannot be changed</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-premium"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {}
        <div className="glass rounded-3xl p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Preferences</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div>
                <p className="font-semibold">Push Notifications</p>
                <p className="text-sm text-muted">Receive notifications about your progress</p>
              </div>
              <ToggleSwitch
                checked={preferences.notifications}
                onChange={() => handlePreferenceChange("notifications")}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div>
                <p className="font-semibold">Email Updates</p>
                <p className="text-sm text-muted">Receive weekly summary emails</p>
              </div>
              <ToggleSwitch
                checked={preferences.emailUpdates}
                onChange={() => handlePreferenceChange("emailUpdates")}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div>
                <p className="font-semibold">Data Collection</p>
                <p className="text-sm text-muted">Allow us to collect usage analytics</p>
              </div>
              <ToggleSwitch
                checked={preferences.dataCollection}
                onChange={() => handlePreferenceChange("dataCollection")}
              />
            </div>
          </div>
        </div>

        {}
        <div className="glass rounded-3xl p-6 md:p-8 border border-danger/20">
          <h2 className="text-2xl font-bold mb-6 text-danger">Danger Zone</h2>

          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger font-semibold hover:bg-danger/20 transition-premium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-white/10"
      }`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}
