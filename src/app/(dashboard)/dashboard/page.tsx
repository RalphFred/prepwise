import { createClient } from "@/utils/supabase/server";

export default async function Dashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="py-4 px-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
    )
}