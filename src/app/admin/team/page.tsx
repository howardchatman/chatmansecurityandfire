"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  UserPlus,
  Users,
  Shield,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

interface Team {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: "admin" | "manager" | "technician" | "inspector";
  team_id?: string;
  team?: { id: string; name: string };
  is_active: boolean;
  created_at?: string;
}

const roleLabels = {
  admin: "Admin",
  manager: "Manager",
  technician: "Technician",
  inspector: "Inspector",
};

const roleColors = {
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  technician: "bg-green-100 text-green-700",
  inspector: "bg-orange-100 text-orange-700",
};

export default function TeamManagementPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: "",
    full_name: "",
    phone: "",
    role: "technician" as "admin" | "manager" | "technician" | "inspector",
    team_id: "",
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  // Team form state
  const [teamForm, setTeamForm] = useState({ name: "", description: "" });
  const [teamLoading, setTeamLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesRes, teamsRes] = await Promise.all([
        fetch("/api/admin/invite"),
        fetch("/api/admin/teams"),
      ]);

      if (profilesRes.ok) {
        const data = await profilesRes.json();
        setProfiles(data.data || []);
      }

      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to invite user");
      }

      setInviteSuccess(`Invitation sent to ${inviteForm.email}`);
      setInviteForm({
        email: "",
        full_name: "",
        phone: "",
        role: "technician",
        team_id: "",
      });
      fetchData();

      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess("");
      }, 2000);
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : "Failed to invite user");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamLoading(true);

    try {
      const response = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      setTeamForm({ name: "", description: "" });
      setShowTeamModal(false);
      fetchData();
    } catch (error) {
      console.error("Error creating team:", error);
    } finally {
      setTeamLoading(false);
    }
  };

  const handleToggleActive = async (profile: Profile) => {
    try {
      const response = await fetch("/api/admin/invite", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: profile.id,
          is_active: !profile.is_active,
        }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const filteredProfiles =
    roleFilter === "all"
      ? profiles
      : profiles.filter((p) => p.role === roleFilter);

  const roleFilters = [
    { label: "All", value: "all" },
    { label: "Admins", value: "admin" },
    { label: "Managers", value: "manager" },
    { label: "Technicians", value: "technician" },
    { label: "Inspectors", value: "inspector" },
  ];

  const columns = [
    {
      key: "full_name",
      label: "Team Member",
      sortable: true,
      render: (profile: Profile) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-orange-600">
              {profile.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{profile.full_name}</p>
            <span
              className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                roleColors[profile.role]
              }`}
            >
              {roleLabels[profile.role]}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "team",
      label: "Team",
      sortable: true,
      render: (profile: Profile) => (
        <span className="text-gray-600">
          {profile.team?.name || "Unassigned"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (profile: Profile) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Mail className="w-3 h-3" />
            {profile.email}
          </div>
          {profile.phone && (
            <div className="flex items-center gap-1 text-gray-500">
              <Phone className="w-3 h-3" />
              {profile.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      render: (profile: Profile) => (
        <StatusBadge status={profile.is_active ? "active" : "inactive"} />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500 mt-1">
            Invite users, assign roles, and manage teams
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTeamModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
            New Team
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{profiles.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {profiles.filter((p) => p.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Technicians</p>
          <p className="text-2xl font-bold text-blue-600">
            {profiles.filter((p) => p.role === "technician").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Inspectors</p>
          <p className="text-2xl font-bold text-orange-600">
            {profiles.filter((p) => p.role === "inspector").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Teams</p>
          <p className="text-2xl font-bold text-purple-600">{teams.length}</p>
        </div>
      </div>

      {/* Teams Section */}
      {teams.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Teams</h3>
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
              >
                <Users className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-gray-700">{team.name}</span>
                <span className="text-xs text-gray-500">
                  ({profiles.filter((p) => p.team_id === team.id).length} members)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Filter */}
      <div className="flex flex-wrap gap-2">
        {roleFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setRoleFilter(filter.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              roleFilter === filter.value
                ? "bg-orange-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredProfiles}
        searchPlaceholder="Search team members..."
        onRowClick={(profile) => console.log("View profile:", profile.id)}
        actions={(profile) => (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleActive(profile);
              }}
              className={`px-2 py-1 text-xs font-medium rounded ${
                profile.is_active
                  ? "text-red-600 hover:bg-red-50"
                  : "text-green-600 hover:bg-green-50"
              }`}
            >
              {profile.is_active ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Invite User</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-4 space-y-4">
              {inviteError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {inviteError}
                </div>
              )}
              {inviteSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {inviteSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={inviteForm.full_name}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, full_name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={inviteForm.phone}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({
                      ...inviteForm,
                      role: e.target.value as "admin" | "manager" | "technician" | "inspector",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  <option value="technician">Technician</option>
                  <option value="inspector">Inspector</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team
                </label>
                <select
                  value={inviteForm.team_id}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, team_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">No Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {inviteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Invite...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Send Invitation
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Create Team</h2>
              <button
                onClick={() => setShowTeamModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, name: e.target.value })
                  }
                  required
                  placeholder="e.g., Fire Alarm Team"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={teamForm.description}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Brief description of the team's responsibilities"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={teamLoading}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {teamLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Create Team
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
