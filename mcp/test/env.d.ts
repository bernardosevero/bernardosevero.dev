import type { Env as WorkerEnv } from '../src/index';

// Types `env` from `cloudflare:test` with the Worker's own bindings.
declare global {
  namespace Cloudflare {
    interface Env extends WorkerEnv {}
  }
}
