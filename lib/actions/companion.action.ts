"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/utils/supabase/supabase";

// Add UUID validation helper
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const createCompanion = async (FormData: CreateCompanion) => {
  const { userId: author } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .insert({ ...FormData, author })
    .select();

  if (error || !data) {
    throw new Error(error?.message || "Something went wrong");
  }
  return data[0];
};

export const getAllCompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  const supabase = createSupabaseClient();

  let query = supabase.from("companions").select();

  if (subject && topic) {
    query = query
      .ilike("subject", `%${subject}%`)
      .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  } else if (subject) {
    query = query.ilike("subject", `%${subject}%`);
  } else if (topic) {
    query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data: companions, error } = await query;

  if (error) {
    throw new Error(error?.message || "Something went wrong");
  }
  return companions;
};

export const getCompanion = async (id: string) => {
  // Validate UUID format before querying
  if (!isValidUUID(id)) {
    throw new Error("Invalid companion ID format. Please provide a valid UUID.");
  }
  
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("id", id)

  if (error) {
    throw new Error(error?.message || "Something went wrong");
  }
  
  if (!data || data.length === 0) {
    throw new Error("Companion not found");
  }
  
  return data[0];
};