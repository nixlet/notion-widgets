"use client";

import { useEffect, useState } from "react";
import type { UserSummary } from "@/lib/types";
import { field, input, label as labelCls } from "@/components/builder/formClasses";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserSummary[] | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    const res = await fetch("/api/users");
    if (!res.ok) {
      setUsers([]);
      return;
    }
    const body = await res.json();
    setUsers(body.users ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setCreating(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Couldn't add that user.");
      return;
    }
    setEmail("");
    setPassword("");
    load();
  }

  async function handleDelete(id: string, userEmail: string) {
    if (!confirm(`Remove ${userEmail}? They won't be able to log in again.`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">Users</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Anyone you add here can log in and manage widgets, but can&apos;t see or change this
          list - only the master login can do that.
        </p>
      </div>

      <form onSubmit={handleCreate} className={`${field} max-w-sm`}>
        <div>
          <label className={labelCls}>Email</label>
          <input
            type="email"
            required
            className={input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@example.com"
          />
        </div>
        <div>
          <label className={labelCls}>Password</label>
          <input
            type="password"
            required
            minLength={8}
            className={input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={creating}
          className="self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {creating ? "Adding..." : "Add user"}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {users === null && <p className="text-sm text-neutral-500">Loading...</p>}
        {users !== null && users.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No additional users yet - you&apos;re the only one with access, via the master login.
          </p>
        )}
        {users?.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{u.email}</p>
              <p className="mt-0.5 text-xs text-neutral-400">Added {formatDate(u.createdAt)}</p>
            </div>
            <button
              onClick={() => handleDelete(u.id, u.email)}
              className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
