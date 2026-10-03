# Notion Widgets

Build custom widgets - buttons, forms, image galleries, progress bars/rings,
countdowns, and counters - in a simple builder UI, and get back a clean URL
for each one that you can embed directly into a Notion page.

## How it works

- You build a widget in the dashboard (`/`) and save it.
- Saving gives you a URL like `https://your-app.vercel.app/w/ab12cd34`.
- Paste that URL into Notion using the `/embed` command (see "Using it in
  Notion" below). Notion loads it in an iframe, so it looks like a native
  part of the page.
- Form widgets store every submission, which you can view or export as CSV
  from the dashboard.

Everything (widget definitions and form submissions) is stored in a small
key-value database (Vercel KV) so your widgets keep working and keep
collecting data even when you're not around.

## 1. Run it locally (no setup required)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no environment
variables set, the app automatically stores everything in a local file at
`.data/db.json` so you can try it out immediately. This local file storage
is for development only - it won't work once deployed, which is why step 2
below sets up real storage.

Note: a widget's embed URL won't actually load inside Notion while it's
only running on localhost, since Notion can't reach your computer. You can
still preview exactly how each widget will look using the live preview
pane in the builder; deploy (next section) to get a URL Notion can embed.

## 2. Deploy it

The easiest path is Vercel, since it hosts the app and its database with
no extra accounts.

1. Push this folder to a new GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import that repo.
   Use the default build settings - no changes needed.
3. Click Deploy. You'll get a URL like `https://notion-widgets-yourname.vercel.app`.
4. In your new Vercel project, go to **Storage → Create Database** and add
   an **Upstash Redis** database (Vercel's older standalone "KV" product has
   been folded into this Marketplace integration). Connect it to the
   project - Vercel will automatically add the right Redis environment
   variables for you.
5. Redeploy the project once (Deployments → ⋯ → Redeploy) so it picks up
   the new environment variables.

That's it - your dashboard is now at your Vercel URL, and every widget you
save there gets a permanent embeddable URL.

### Optional: lock the dashboard with a password

Anyone who finds your Vercel URL can open the builder dashboard and create
or delete widgets (the `/w/...` widget pages themselves are always public,
since that's what lets Notion load them). To require a password for
everything else:

1. In Vercel, go to **Settings → Environment Variables** and add:
   - `ADMIN_PASSWORD` - whatever password you want to use.
   - `AUTH_SECRET` - any random string (e.g. run `openssl rand -hex 32`).
2. Redeploy.

Leave both blank if you don't want a password gate.

## 3. Using it in Notion

1. Open the dashboard, build a widget, and copy its embed URL.
2. In any Notion page, type `/embed` and press enter.
3. Paste the URL. If Notion shows a preview card instead of embedding it
   directly, click the three-dot menu on the block and choose "Convert to
   embed" (wording varies slightly by Notion version).
4. Resize the embed block by dragging its corner - all widgets are
   responsive and will adapt to whatever width you give them.

If you ever change a widget in the dashboard, Notion's embed will pick up
the change automatically next time the page loads - the URL always points
to the current version.

## Widget types

- **Button** - a styled link/button, with solid/outline/ghost styles, a
  custom color, and optional helper text.
- **Form** - any mix of text, email, number, paragraph, dropdown, and
  checkbox fields. Submissions are stored and viewable/exportable from the
  dashboard. Includes a basic spam honeypot.
- **Gallery** - a grid or horizontally-scrolling row of images, each with
  an optional caption and click-through link.
- **Progress / counter / tracker** - a progress bar, progress ring,
  live-updating countdown timer, or a plain counter.

## Project structure

```
app/
  (builder)/        the dashboard + widget editor (password-gated if ADMIN_PASSWORD is set)
  w/[id]/            the public, embeddable widget page Notion loads
  api/widgets/       CRUD + form-submission API routes
components/
  widgets/           the actual widget UI (shared between the builder preview and the public page)
  builder/           the editor forms used in the dashboard
lib/
  types.ts           widget config shapes (zod schemas)
  store.ts           storage adapter - Vercel KV in production, a local JSON file in dev
```

## Notes & limitations

- Gallery images are linked by URL, not uploaded - paste a link to an image
  that's already hosted somewhere (e.g. an Imgur, S3, or Notion-hosted
  image link).
- There's no built-in image upload or file storage; adding one later would
  mean wiring up something like Vercel Blob storage.
- The password gate is intentionally simple (a single shared password) -
  fine for personal/small-team use, not meant for anything handling
  sensitive data.
