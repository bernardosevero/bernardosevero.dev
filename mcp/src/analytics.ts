import { instrument } from '@posthog/mcp';
import type { McpServer } from '@modelcontextprotocol/server';
import { PostHog } from 'posthog-node';

export interface AnalyticsSettings {
  key: string;
  host: string;
  /** Overridable so tests can observe what would be sent. */
  fetch?: typeof fetch;
}

export interface Analytics {
  instrument(server: McpServer): void;
  /** Sends queued events. Call once the response is ready. */
  flush(): Promise<void>;
}

/**
 * Basic analytics only (docs/mcp.md, invariant 8): tool name, validated
 * parameters, timing, and error state. Agent intent, conversation IDs, the
 * calling model, and tool responses are never captured.
 */
export function createAnalytics(settings: AnalyticsSettings): Analytics {
  const posthog = new PostHog(settings.key, {
    host: settings.host,
    // A Worker invocation may end right after the response: send, do not batch.
    flushAt: 1,
    flushInterval: 0,
    ...(settings.fetch && { fetch: settings.fetch }),
  });

  return {
    instrument(server) {
      instrument(server, posthog, {
        context: false,
        enableConversationId: false,
        captureModel: false,
        enableExceptionAutocapture: false,
        beforeSend(event) {
          if (event.properties) delete event.properties.$mcp_response;
          return event;
        },
      });
    },
    flush: () => posthog.flush(),
  };
}

/** Analytics are off unless both public PostHog values are configured. */
export function analyticsFromEnv(env: { POSTHOG_KEY?: string; POSTHOG_HOST?: string }) {
  if (!env.POSTHOG_KEY || !env.POSTHOG_HOST) return undefined;
  return createAnalytics({ key: env.POSTHOG_KEY, host: env.POSTHOG_HOST });
}
