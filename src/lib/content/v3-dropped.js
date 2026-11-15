/* eslint-disable */
// The v2 ids that v3 does not place (roadmap v3 spec, "v2 content → v3"). Reason: 'owner choice' (the owner removed the
// thread) or 'duplicate' (the same session is already in the plan). Every other v2 id is a track item or in a row's
// `covers`; scripts/test-v3-coverage.ts checks that against the frozen v2 id list.

const drop = (reason, ids) => ids.map((id) => ({ id, reason }));

export const DROPPED = [
  // No Python (AIB / AIB_MOVED).
  ...drop('owner choice', ['aib:python-for-js', 'aib:pandas']),
  // No hand-built data structures (FOUNDATIONS).
  ...drop('owner choice', ['dsa:foundations-build-1', 'dsa:foundations-build-2', 'dsa:foundations-build-3']),
  // The memo thread: decisions become ADRs in the flagship.
  ...drop('owner choice', ['jt:memo-ssr-vs-csr', 'jt:memo-postgres-vs-dynamodb', 'jt:memo-rag-vs-fine-tuning', 'jt:memo-build-vs-buy-auth',
    'jt:memo-websocket-vs-sse', 'jt:memo-monolith-vs-services', 'jt:memo-polling-vs-webhooks', 'jt:memo-ship-vs-tech-debt',
    'jt:memo-one-model-vs-routing', 'jt:memo-sync-vs-queue', 'jt:memo-flag-vs-branch', 'jt:memo-cache-vs-read-replica', 'jt:memo-offline-first']),
  // The open-source thread (OSS_FIXES, OSS_REPOS).
  ...drop('owner choice', ['jt:oss-fix-1', 'jt:oss-fix-2', 'jt:oss-fix-3', 'jt:oss-fix-4', 'jt:oss-fix-5', 'jt:oss-fix-6', 'jt:oss-fix-7',
    'oss:posthog', 'oss:calcom', 'oss:excalidraw']),
  // Basic widget builds (MC; the 12 kept builds live in Frontend) and the screenshot builds.
  ...drop('owner choice', ['mc:todo-vanilla', 'mc:accordion', 'mc:tabs', 'mc:star-rating', 'mc:debounced-search', 'mc:pagination',
    'mc:image-carousel', 'mc:toast', 'mc:form-wizard', 'mc:tic-tac-toe', 'mc:kanban', 'mc:date-picker', 'mc:otp-input', 'mc:tooltip',
    'mc:virtualized-list', 'mc:combobox', 'mc:spreadsheet-lite', 'mc:undo-redo-editor', 'mc:like-button', 'mc:email-client', 'mc:chat-ui',
    'mc:streaming-ai-chat', 'mc:screenshot-product-card', 'mc:screenshot-rating', 'mc:screenshot-newsletter']),
  // The 36 UX lessons, compressed into the 6 product basics of the flagship.
  ...drop('owner choice', ['ux:laws-of-ux', 'ux:nielsen-heuristics', 'ux:visual-hierarchy', 'ux:typography', 'ux:color', 'ux:layout-responsive',
    'ux:gestalt', 'ux:forms-ux', 'ux:every-state', 'ux:perceived-performance', 'ux:motion', 'ux:design-systems', 'ux:apple-hig',
    'ux:level-calibration', 'ux:accessible-patterns', 'ux:teardown-linear', 'ux:teardown-stripe-checkout', 'ux:teardown-airbnb-search',
    'ux:teardown-figma-notion', 'ux:product-thinking', 'ux:prd', 'ux:metrics', 'ux:experimentation', 'ux:feature-flags',
    'ux:analytics-instrumentation', 'ux:prioritization', 'ux:ai-product-ux', 'ux:product-sense-maps', 'ux:product-sense-remote-managers',
    'ux:engineering-judgment', 'ux:ux-writing', 'ux:dashboards-dataviz', 'ux:onboarding', 'ux:i18n', 'ux:flagship-prep', 'ux:figma-for-engineers']),
  // LLD mocks that repeat an LLD Saturday session (they stay on the seeded "LLD question bank" page).
  ...drop('duplicate', ['sdm:lld-book-management', 'sdm:lld-google-authenticator', 'sdm:lld-android-unlock', 'sdm:lld-tetris']),
];
