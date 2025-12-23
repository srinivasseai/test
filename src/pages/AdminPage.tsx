import { GrafanaSidebar } from "@/components/grafana/GrafanaSidebar";
import { SearchModal } from "@/components/grafana/modals/SearchModal";
import { DashboardProvider } from "@/contexts/DashboardContext";
import { useState } from "react";
import React from "react";
import { Users, Plus, Search, Shield, Mail, MoreVertical, UserCog, Key, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const users = [
  { name: "Admin User", email: "admin@grafana.local", role: "Admin", lastSeen: "Online", avatar: "A" },
  { name: "John Doe", email: "john@example.com", role: "Editor", lastSeen: "2 hours ago", avatar: "J" },
  { name: "Jane Smith", email: "jane@example.com", role: "Viewer", lastSeen: "1 day ago", avatar: "J" },
  { name: "Bob Wilson", email: "bob@example.com", role: "Editor", lastSeen: "3 days ago", avatar: "B" },
];

const teams = [
  { name: "Platform Team", members: 5, email: "platform@grafana.local" },
  { name: "DevOps", members: 8, email: "devops@grafana.local" },
  { name: "SRE", members: 4, email: "sre@grafana.local" },
];

const tabs = ["Users", "Teams", "Service accounts", "Org settings"];

function AdminContent() {
  const [activeTab, setActiveTab] = useState("Users");
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKeys, setApiKeys] = useState([]);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyRole, setKeyRole] = useState("Editor");
  const [createdKey, setCreatedKey] = useState("");

  const loadApiKeys = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/keys');
      if (response.ok) {
        const keys = await response.json();
        setApiKeys(keys);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const createApiKey = async () => {
    if (!keyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName, role: keyRole })
      });

      if (response.ok) {
        const result = await response.json();
        setCreatedKey(result.key);
        setKeyName('');
        setShowCreateKey(false);
        loadApiKeys();
        toast.success('API key created successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create API key');
      }
    } catch (error) {
      toast.error('Failed to create API key');
    }
  };

  const deleteApiKey = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/auth/keys/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadApiKeys();
        toast.success('API key deleted');
      } else {
        toast.error('Failed to delete API key');
      }
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  React.useEffect(() => {
    if (activeTab === 'Service accounts') {
      loadApiKeys();
    }
  }, [activeTab]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <GrafanaSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-foreground">Administration</h1>
        </header>

        <main className="flex-1 overflow-auto">
          {/* Tabs */}
          <div className="border-b border-border px-6">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                    activeTab === tab
                      ? "text-primary border-primary"
                      : "text-muted-foreground hover:text-foreground border-transparent"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "Users" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="relative max-w-md flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users..."
                      className="w-full pl-10 pr-4 py-2 grafana-input"
                    />
                  </div>
                  <button
                    onClick={() => toast.success("Invite user dialog opened")}
                    className="grafana-btn grafana-btn-primary"
                  >
                    <Plus size={16} />
                    Invite user
                  </button>
                </div>

                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Last seen</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((user) => (
                        <tr key={user.email} className="hover:bg-secondary/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                                {user.avatar}
                              </div>
                              <span className="font-medium text-foreground">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "grafana-badge",
                              user.role === "Admin" && "bg-grafana-red/20 text-grafana-red",
                              user.role === "Editor" && "bg-grafana-blue/20 text-grafana-blue",
                              user.role === "Viewer" && "bg-muted text-muted-foreground"
                            )}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{user.lastSeen}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toast.info(`Managing ${user.name}...`)}
                              className="p-1 rounded hover:bg-secondary text-muted-foreground"
                            >
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === "Teams" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">Manage teams and their permissions</p>
                  <button
                    onClick={() => toast.success("Create team dialog opened")}
                    className="grafana-btn grafana-btn-primary"
                  >
                    <Plus size={16} />
                    New team
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team) => (
                    <div
                      key={team.name}
                      onClick={() => toast.info(`Opening team: ${team.name}`)}
                      className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-secondary rounded">
                          <Users size={20} className="text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{team.name}</div>
                          <div className="text-sm text-muted-foreground">{team.members} members</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail size={14} />
                        {team.email}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === "Service accounts" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-medium text-foreground">API Keys</h2>
                    <p className="text-muted-foreground">API keys are used for machine-to-machine access</p>
                  </div>
                  <button
                    onClick={() => setShowCreateKey(true)}
                    className="grafana-btn grafana-btn-primary"
                  >
                    <Plus size={16} />
                    Create API key
                  </button>
                </div>

                {showCreateKey && (
                  <div className="bg-card border border-border rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-foreground mb-4">Create API Key</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                        <input
                          type="text"
                          value={keyName}
                          onChange={(e) => setKeyName(e.target.value)}
                          placeholder="My Dashboard API"
                          className="w-full grafana-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                        <select
                          value={keyRole}
                          onChange={(e) => setKeyRole(e.target.value)}
                          className="w-full grafana-input"
                        >
                          <option value="Viewer">Viewer</option>
                          <option value="Editor">Editor</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={createApiKey} className="grafana-btn grafana-btn-primary">
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateKey(false);
                          setKeyName('');
                        }}
                        className="grafana-btn grafana-btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {createdKey && (
                  <div className="bg-grafana-green/10 border border-grafana-green/20 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-foreground mb-2">API Key Created</h3>
                    <p className="text-sm text-muted-foreground mb-3">Save this key - it won't be shown again!</p>
                    <div className="flex items-center gap-2 bg-background border border-border rounded p-2">
                      <code className="flex-1 text-sm font-mono">{createdKey}</code>
                      <button
                        onClick={() => copyToClipboard(createdKey)}
                        className="p-1 hover:bg-secondary rounded"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => setCreatedKey('')}
                      className="mt-3 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {apiKeys.length > 0 ? (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Used</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {apiKeys.map((key) => (
                          <tr key={key.id} className="hover:bg-secondary/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Key size={16} className="text-muted-foreground" />
                                <span className="font-medium text-foreground">{key.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "grafana-badge",
                                key.role === "Admin" && "bg-grafana-red/20 text-grafana-red",
                                key.role === "Editor" && "bg-grafana-blue/20 text-grafana-blue",
                                key.role === "Viewer" && "bg-muted text-muted-foreground"
                              )}>
                                {key.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(key.created).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => deleteApiKey(key.id)}
                                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-grafana-red"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  !showCreateKey && (
                    <div className="text-center py-12">
                      <Key size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No API keys</h3>
                      <p className="text-muted-foreground mb-4">Create API keys for machine-to-machine access</p>
                    </div>
                  )
                )}
              </>
            )}

            {activeTab === "Org settings" && (
              <div className="max-w-xl space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Organization name</label>
                  <input type="text" defaultValue="Main Org." className="w-full grafana-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Organization ID</label>
                  <input type="text" value="1" disabled className="w-full grafana-input opacity-50" />
                </div>
                <button
                  onClick={() => toast.success("Organization settings saved")}
                  className="grafana-btn grafana-btn-primary"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      <SearchModal />
    </div>
  );
}

export default function AdminPage() {
  return (
    <DashboardProvider>
      <AdminContent />
    </DashboardProvider>
  );
}
