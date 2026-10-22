import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Cliente do Supabase com os tipos gerados (`npm run db:types`). Os repositórios recebem-no por parâmetro. */
export type ClienteBD = SupabaseClient<Database>;
