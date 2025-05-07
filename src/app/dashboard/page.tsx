import { Button } from "@/components/ui/button";
import { SignedOut, SignInButton } from "@clerk/nextjs";

export default async function Dashboard() {
    return(
        <SignedOut>
            <main className="flex flex-col items-center justify-center h-screen">
            <SignInButton>
                <Button>
                Sign in to access dashboard
                </Button>
            </SignInButton>
            </main>
        </SignedOut>
    )
}