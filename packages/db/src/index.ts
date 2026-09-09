import { env } from "@sticker_pop/env/server";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

export function createDb() {
  return drizzle(env.DB, { schema });
}
