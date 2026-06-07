import { getLlmsTxt } from "@/app/lib/llms-txt";

export function GET() {
    return new Response(getLlmsTxt(), {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}
