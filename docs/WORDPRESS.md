# Embedding into WordPress

The app is deployed standalone (see `DEPLOYMENT.md`) and embedded into WordPress
pages via an auto-resizing iframe. This is the cleanest, lowest-risk integration:
WordPress owns the surrounding page/SEO/navigation, while the questionnaire keeps
full design fidelity and its own release cycle.

## Step 1 — Deploy the app

Deploy to a public HTTPS URL (e.g. `https://sis-app.yourdomain.org`) and set:

```
NEXT_PUBLIC_APP_URL=https://sis-app.yourdomain.org
WORDPRESS_EMBED_ORIGIN=https://your-wordpress-site.org
```

`WORDPRESS_EMBED_ORIGIN` sets the `frame-ancestors` CSP on `/embed/*` so only your
WordPress site may iframe the questionnaire.

## Step 2 — Install the shortcode plugin

Copy [`wordpress/sis-questionnaire-embed.php`](../wordpress/sis-questionnaire-embed.php) into either:

- `wp-content/mu-plugins/` — loads automatically (recommended), **or**
- `wp-content/plugins/` — then activate it under **Plugins**.

Set your app URL once, in `wp-config.php`:

```php
define('SIS_APP_URL', 'https://sis-app.yourdomain.org');
```

(or edit the fallback constant at the top of the plugin file).

## Step 3 — Add the shortcode to a page

In the WordPress block editor, add a **Shortcode** block:

```
[sis_questionnaire id="pre-teens-13-17"]
```

Options:

```
[sis_questionnaire id="pre-teens-13-17" height="900" title="SIS Pre-Test (Teens)"]
```

| Attribute | Default | Notes |
|---|---|---|
| `id` | `pre-teens-13-17` | Questionnaire slug (must be a *live* questionnaire) |
| `height` | `850` | Iframe height in px |
| `title` | `SIS Skills Questionnaire` | Accessible iframe title |

That's it — the questionnaire renders inside your page, autosaves locally, submits
to the app's API, and links the student to their PDF report on completion.

## Alternative integrations (documented, not used)

- **Headless WordPress:** keep WP as a content API (WPGraphQL/REST) and let this
  Next.js app fetch page copy. Overkill for a questionnaire; adds moving parts.
- **Full plugin bundle:** compile the app into a plugin that enqueues the JS bundle.
  Tighter coupling but brittle build pipeline and CSS-collision risk.

The iframe-embed approach was chosen for reliability, security isolation (CSP), and
zero styling conflicts with the active WordPress theme.

## Direct links (no WordPress)

You can also share questionnaire links directly:
`https://sis-app.yourdomain.org/q/pre-teens-13-17`
