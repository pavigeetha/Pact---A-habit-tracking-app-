import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://doirtynciwfqqecxtskn.supabase.co';
const supabaseAnonKey = 'sb_publishable_vQ5bJ60zK_GD0A0s-TONDQ_Zh0giKd8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
