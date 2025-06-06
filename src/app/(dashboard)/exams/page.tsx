import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function ExamsPage() {
    return (
        <div className="px-6 py-4 space-y-6">
            <h1 className="text-2xl font-bold">Exams</h1>

            <div className="flex">
                <Link href="/exams/subjects">
                    <Button className="bg-primary-500 hover:bg-primary-600 cursor-pointer">
                        <Plus /> <span>Take New Exam</span>
                    </Button>
                </Link>
            </div>
        </div>
    )
}

