import { createClient } from "@/utils/supabase/server";

export default async function Dashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="py-4 px-6">
            <h1>Dashboard</h1>
        </div>
    )
}