// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rgacsmfkbcrazwhizyas.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnYWNzbWZrYmNyYXp3aGl6eWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODYxOTgsImV4cCI6MjA3NTE2MjE5OH0.EsxyjDQN8FntgIgQaqsZyHQKSBWLG8VRGXwsrXvf0zI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
