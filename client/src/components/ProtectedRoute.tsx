import { useAuth, RedirectToSignIn } from "@clerk/clerk-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  // 1. Wait for Clerk to securely check the user's token
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#0a0a0a]">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
         <p className="text-gray-400 animate-pulse">Loading your command center...</p>
      </div>
    );
  }

  // 2. If they are NOT logged in, kick them to the Clerk login page
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // 3. If they are logged in, let them through!
  return <>{children}</>;
}