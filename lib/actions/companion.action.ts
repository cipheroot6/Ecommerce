"use server";

import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/utils/supabase/server";

export const createCompanion = async (FormData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = createClient();
    
    const { data, error } = await supabase.from('companion').insert({...FormData, author}).select();

    if(error || !data) {
        throw new Error(error?.message || 'Something went wrong');
    }
    return data[0];
}