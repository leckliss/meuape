import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://dtgvryvwktidkirzjnfl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Z3ZyeXZ3a3RpZGtpcnpqbmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyODQ0NTcsImV4cCI6MjA4ODg2MDQ1N30.eXL28h11yvXGQDcJl70ZbAEBoFQQS2mygc-l-t6Z-8w');

async function run() {
  const { data } = await supabase.from('transactions').select('*');
  console.log('Transactions:', JSON.stringify(data, null, 2));
}
run();
