import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  console.log('Fetching transactions...');
  const { data, error } = await supabase.from('transactions').select('*').limit(5);

  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Success! Found', data?.length, 'transactions:');
    console.log(data);
  }
}

testFetch();
