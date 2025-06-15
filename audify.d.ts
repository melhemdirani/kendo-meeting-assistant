// types/audify.d.ts
declare module "audify" {
  import { EventEmitter } from "events";

  interface AudifyInstance extends EventEmitter {
    start(): void;
    stop(): void;
  }

  export default function Audify(): AudifyInstance;
}
