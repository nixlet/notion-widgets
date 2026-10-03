import type { Submission, User, UserSummary, Widget, WidgetSummary } from "./types";

/**
 * Storage interface. Two implementations:
 *  - RedisStore: production, backed by Upstash Redis (installed from the
 *    Vercel Marketplace - Vercel's old standalone "KV" product is
 *    deprecated in favor of this).
 *  - FileStore: local development only, backed by a JSON file on disk.
 *
 * Which one is used is decided once, at import time, based on whether
 * Upstash's env vars are present.
 */
interface Store {
  getWidget(id: string): Promise<Widget | null>;
  saveWidget(widget: Widget): Promise<void>;
  deleteWidget(id: string): Promise<void>;
  // Pass an ownerId to get only that owner's widgets; omit to get everyone's
  // (used for the master login, which can see everything).
  listWidgets(ownerId?: string): Promise<WidgetSummary[]>;
  addSubmission(widgetId: string, submission: Submission): Promise<void>;
  listSubmissions(widgetId: string): Promise<Submission[]>;
  deleteSubmissions(widgetId: string): Promise<void>;
  listUsers(): Promise<UserSummary[]>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: User): Promise<void>;
  updateUser(id: string, patch: Partial<Pick<User, "name" | "passwordHash">>): Promise<User | null>;
  deleteUser(id: string): Promise<void>;
}

// The Vercel Marketplace Upstash integration, and the older standalone
// Vercel KV product, have both been seen using either naming - support
// whichever pair of env vars is actually present.
const REDIS_URL =
  process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

// ---------------------------------------------------------------------------
// Redis (Upstash) implementation - used in production / whenever the env
// vars above are present.
// ---------------------------------------------------------------------------
class RedisStore implements Store {
  private clientPromise: Promise<import("@upstash/redis").Redis>;

  constructor() {
    this.clientPromise = import("@upstash/redis").then(
      ({ Redis }) => new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! })
    );
  }

  private async kv() {
    return this.clientPromise;
  }

  async getWidget(id: string): Promise<Widget | null> {
    const kv = await this.kv();
    const widget = await kv.get<Widget>(`widget:${id}`);
    return widget ?? null;
  }

  async saveWidget(widget: Widget): Promise<void> {
    const kv = await this.kv();
    await kv.set(`widget:${widget.id}`, widget);
    await kv.zadd("widgets:index", {
      score: new Date(widget.updatedAt).getTime(),
      member: widget.id,
    });
  }

  async deleteWidget(id: string): Promise<void> {
    const kv = await this.kv();
    await kv.del(`widget:${id}`);
    await kv.zrem("widgets:index", id);
    await this.deleteSubmissions(id);
  }

  async listWidgets(ownerId?: string): Promise<WidgetSummary[]> {
    const kv = await this.kv();
    const ids = await kv.zrange<string[]>("widgets:index", 0, -1, { rev: true });
    if (!ids || ids.length === 0) return [];
    const widgets = await Promise.all(ids.map((id) => this.getWidget(id)));
    const summaries: WidgetSummary[] = [];
    for (const w of widgets) {
      if (!w) continue;
      if (ownerId && (w.ownerId ?? "master") !== ownerId) continue;
      const submissionCount =
        w.type === "form" ? (await this.listSubmissions(w.id)).length : undefined;
      summaries.push({
        id: w.id,
        type: w.type,
        name: w.name,
        updatedAt: w.updatedAt,
        submissionCount,
      });
    }
    return summaries;
  }

  async addSubmission(widgetId: string, submission: Submission): Promise<void> {
    const kv = await this.kv();
    await kv.rpush(`submissions:${widgetId}`, JSON.stringify(submission));
  }

  async listSubmissions(widgetId: string): Promise<Submission[]> {
    const kv = await this.kv();
    const raw = await kv.lrange<string>(`submissions:${widgetId}`, 0, -1);
    return (raw ?? []).map((r) => (typeof r === "string" ? JSON.parse(r) : r));
  }

  async deleteSubmissions(widgetId: string): Promise<void> {
    const kv = await this.kv();
    await kv.del(`submissions:${widgetId}`);
  }

  async listUsers(): Promise<UserSummary[]> {
    const kv = await this.kv();
    const ids = await kv.smembers<string[]>("users:index");
    if (!ids || ids.length === 0) return [];
    const users = await Promise.all(ids.map((id) => kv.get<User>(`user:${id}`)));
    return users
      .filter((u): u is User => Boolean(u))
      .map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt }))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async getUserById(id: string): Promise<User | null> {
    const kv = await this.kv();
    const user = await kv.get<User>(`user:${id}`);
    return user ?? null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const kv = await this.kv();
    const id = await kv.get<string>(`user:by-email:${email}`);
    if (!id) return null;
    const user = await kv.get<User>(`user:${id}`);
    return user ?? null;
  }

  async createUser(user: User): Promise<void> {
    const kv = await this.kv();
    await kv.set(`user:${user.id}`, user);
    await kv.set(`user:by-email:${user.email}`, user.id);
    await kv.sadd("users:index", user.id);
  }

  async updateUser(
    id: string,
    patch: Partial<Pick<User, "name" | "passwordHash">>
  ): Promise<User | null> {
    const kv = await this.kv();
    const user = await kv.get<User>(`user:${id}`);
    if (!user) return null;
    const updated: User = { ...user, ...patch };
    await kv.set(`user:${id}`, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    const kv = await this.kv();
    const user = await kv.get<User>(`user:${id}`);
    await kv.del(`user:${id}`);
    await kv.srem("users:index", id);
    if (user) await kv.del(`user:by-email:${user.email}`);
  }
}

// ---------------------------------------------------------------------------
// Local file implementation - zero-setup dev storage. NOT suitable for
// production (serverless filesystems are ephemeral / read-only).
// ---------------------------------------------------------------------------
interface FileDb {
  widgets: Record<string, Widget>;
  submissions: Record<string, Submission[]>;
  users: Record<string, User>;
}

class FileStore implements Store {
  private dbPath = require("path").join(process.cwd(), ".data", "db.json");

  private async read(): Promise<FileDb> {
    const fs = await import("fs/promises");
    try {
      const raw = await fs.readFile(this.dbPath, "utf-8");
      // Spread onto defaults so a db.json written before `users` existed
      // (or before this field was added) still loads cleanly.
      return { widgets: {}, submissions: {}, users: {}, ...JSON.parse(raw) } as FileDb;
    } catch {
      return { widgets: {}, submissions: {}, users: {} };
    }
  }

  private async write(db: FileDb): Promise<void> {
    const fs = await import("fs/promises");
    const path = await import("path");
    await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
    await fs.writeFile(this.dbPath, JSON.stringify(db, null, 2), "utf-8");
  }

  async getWidget(id: string): Promise<Widget | null> {
    const db = await this.read();
    return db.widgets[id] ?? null;
  }

  async saveWidget(widget: Widget): Promise<void> {
    const db = await this.read();
    db.widgets[widget.id] = widget;
    await this.write(db);
  }

  async deleteWidget(id: string): Promise<void> {
    const db = await this.read();
    delete db.widgets[id];
    delete db.submissions[id];
    await this.write(db);
  }

  async listWidgets(ownerId?: string): Promise<WidgetSummary[]> {
    const db = await this.read();
    return Object.values(db.widgets)
      .filter((w) => !ownerId || (w.ownerId ?? "master") === ownerId)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .map((w) => ({
        id: w.id,
        type: w.type,
        name: w.name,
        updatedAt: w.updatedAt,
        submissionCount: w.type === "form" ? (db.submissions[w.id] ?? []).length : undefined,
      }));
  }

  async addSubmission(widgetId: string, submission: Submission): Promise<void> {
    const db = await this.read();
    if (!db.submissions[widgetId]) db.submissions[widgetId] = [];
    db.submissions[widgetId].push(submission);
    await this.write(db);
  }

  async listSubmissions(widgetId: string): Promise<Submission[]> {
    const db = await this.read();
    return db.submissions[widgetId] ?? [];
  }

  async deleteSubmissions(widgetId: string): Promise<void> {
    const db = await this.read();
    db.submissions[widgetId] = [];
    await this.write(db);
  }

  async listUsers(): Promise<UserSummary[]> {
    const db = await this.read();
    return Object.values(db.users)
      .map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.createdAt }))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  async getUserById(id: string): Promise<User | null> {
    const db = await this.read();
    return db.users[id] ?? null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.read();
    return Object.values(db.users).find((u) => u.email === email) ?? null;
  }

  async createUser(user: User): Promise<void> {
    const db = await this.read();
    db.users[user.id] = user;
    await this.write(db);
  }

  async updateUser(
    id: string,
    patch: Partial<Pick<User, "name" | "passwordHash">>
  ): Promise<User | null> {
    const db = await this.read();
    const user = db.users[id];
    if (!user) return null;
    const updated = { ...user, ...patch };
    db.users[id] = updated;
    await this.write(db);
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    const db = await this.read();
    delete db.users[id];
    await this.write(db);
  }
}

const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);

export const store: Store = useRedis ? new RedisStore() : new FileStore();
export const storageBackend: "redis" | "file" = useRedis ? "redis" : "file";
