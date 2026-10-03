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

function ResetPasswordRow({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setError(null);
    setSaving(true);
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Couldn't reset that password.");
      return;
    }
    onDone();
  }

  return (
    <div className="flex items-end gap-2 border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
      <div className="flex-1">
        <label className={labelCls}>New password</label>
        <input
          type="password"
          minLength={8}
          className={input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
      </div>
      <button
        type="button"
        onClick={save}
        disabled={saving || password.length < 8}
        className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Saving..." : "Set password"}
      </button>
      <button
        type="button"
        onClick={onDone}
        className="rounded-md border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        Cancel
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserSummary[] | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);

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
      body: JSON.stringify({ name, email, password }),
    });
    setCreating(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Couldn't add that user.");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    load();
  }

  async function handleDelete(id: string, userName: string) {
    if (!confirm(`Delete ${userName}? They won't be able to log in again.`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">Users</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Anyone you add here can log in and manage their own widgets, but can&apos;t see
          anyone else&apos;s widgets or this user list - only the master login can do that.
        </p>
      </div>

      <form onSubmit={handleCreate} className={`${field} max-w-sm`}>
        <div>
          <label className={labelCls}>Name</label>
          <input
            required
            className={input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jamie Rivera"
          />
        </div>
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
            className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{u.name}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{u.email}</p>
                <p className="mt-0.5 text-xs text-neutral-400">Added {formatDate(u.createdAt)}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  onClick={() => setResettingId(resettingId === u.id ? null : u.id)}
                  className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  Reset password
                </button>
                <button
                  onClick={() => handleDelete(u.id, u.name)}
                  className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              </div>
            </div>
            {resettingId === u.id && (
              <ResetPasswordRow userId={u.id} onDone={() => setResettingId(null)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
