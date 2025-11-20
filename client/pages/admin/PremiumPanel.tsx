import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BadgeCheck, User, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import * as api from "@/lib/api";

interface PremiumUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const AdminPremiumPanel: React.FC = () => {
  const [users, setUsers] = useState<PremiumUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetch("/api/admin/premium-users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async (id: string) => {
    await fetch(`/api/admin/upgrade/${id}`, { method: "POST" });
    setUsers(users => users.map(u => u.id === id ? { ...u, role: "premium" } : u));
  };
  const handleDowngrade = async (id: string) => {
    await fetch(`/api/admin/downgrade/${id}`, { method: "POST" });
    setUsers(users => users.map(u => u.id === id ? { ...u, role: "normal" } : u));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BadgeCheck className="w-6 h-6 text-primary" /> Premium Subscriptions
      </h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="w-full bg-white dark:bg-[#232325] rounded-xl shadow-xl overflow-hidden">
          <thead>
            <tr className="bg-primary/10">
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b last:border-b-0">
                <td className="p-3 flex items-center gap-2"><User className="w-4 h-4" /> {user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  {user.role === "premium" ? (
                    <span className="text-green-600 font-semibold">Premium</span>
                  ) : (
                    <span className="text-gray-500">Normal</span>
                  )}
                </td>
                <td className="p-3 flex gap-2">
                  {user.role === "premium" ? (
                    <Button size="sm" variant="outline" onClick={() => handleDowngrade(user.id)}>
                      <ArrowDownLeft className="w-4 h-4 mr-1" /> Downgrade
                    </Button>
                  ) : (
                    <Button size="sm" variant="default" onClick={() => handleUpgrade(user.id)}>
                      <ArrowUpRight className="w-4 h-4 mr-1" /> Upgrade
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPremiumPanel;
