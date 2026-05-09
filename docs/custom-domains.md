# Custom domains

LinkChat uses Cloudflare Custom Hostnames for SaaS-style domains. Users add a
domain in the dashboard, copy the CNAME instructions, and click retry
verification after DNS propagates.

## User DNS model

Subdomains use a single CNAME:

```text
type  CNAME
name  links
value linkchat.sarthakagrawal927.workers.dev
```

Apex domains also show CNAME instructions. If the DNS provider does not support
apex CNAMEs, use CNAME flattening, ALIAS, or ANAME.

Set `NEXT_PUBLIC_CUSTOM_DOMAIN_CNAME_TARGET` or
`CLOUDFLARE_CUSTOM_HOSTNAME_CNAME_TARGET` to show a branded CNAME target such as
`customers.example.com`. That target should point at the Cloudflare fallback
origin for the SaaS zone.

## Provider configuration

The provider is inert unless both values are configured:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ZONE_ID
```

When configured, `src/lib/cloudflare-domains.ts` creates and checks Cloudflare
Custom Hostnames via `/zones/:zone_id/custom_hostnames`. Without those values,
domains are still stored locally as `pending` and the dashboard remains useful
for collecting the desired hostname and showing DNS setup.

Do not put token values in this repository. Configure them as deployment
secrets.
