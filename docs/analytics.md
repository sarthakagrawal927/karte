# Analytics Event Map

This document tracks how product usage and visitor behavior are measured in LinkChat.

## Internal Product Analytics (PostHog)

We use PostHog to understand activation, retention, and feature usage for authenticated users.

**Privacy Mandate:**
- No PII (names, emails) is sent to PostHog.
- No private content (DMs, chat history, memory blocks, scraped text) is sent to PostHog.
- Users are identified by their database ID only.

| Event Name | Description | Location |
|------------|-------------|----------|
| `user_signup` | User signs up for the first time | Detected in AnalyticsProvider |
| `user_login` | User logs in | Detected in AnalyticsProvider |
| `dashboard_activated` | User lands on the main dashboard | Dashboard layout/page |
| `page_created` | User successfully creates their first profile page | PageSettings (POST) |
| `linktree_import_preview` | User previews an import from another profile | LinkEditor |
| `linktree_import_complete` | User completes an import of links | LinkEditor |
| `ai_profile_revamp_generate` | User generates an AI revamp plan | ProfileRevampAssistant |
| `ai_profile_revamp_apply` | User applies an AI revamp plan | ProfileRevampAssistant |
| `profile_enrichment_run` | User runs the auto-enrichment process | InfoEditor/Enrich API |
| `profile_mode_generated` | User generates an Encyclopedia/Newspaper/Roast mode | EncyclopediaEditor/etc. |

## Public Visitor Analytics (Native/D1)

Visitor interactions on public profile pages are tracked in our own database to provide analytics to creators.

| Event Name | Description | Location |
|------------|-------------|----------|
| `page_view` | Visitor views a public profile page | PageAnalyticsTracker |
| `outbound_click` | Visitor clicks an external link on a profile | PageAnalyticsTracker |
| `chat_message_sent` | Visitor sends a message to the AI chatbot | Chat API |
| `contact_form_submit` | Visitor submits the contact form | Contact API |
