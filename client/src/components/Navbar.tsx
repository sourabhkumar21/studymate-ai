import { NavLink, useNavigate } from "react-router-dom";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { 
  Sparkle as SparkleIcon,
  FolderEdit as FolderEditIcon,
  GalleryHorizontalEnd
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { openSignIn, openSignUp } = useClerk(); 

  if (!isLoaded) return null; // Wait for user data to load

  // 🧹 CLEANED: Removed "Plans" from navigation
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Create", path: "/generate" },
    { name: "Community", path: "/community" },
    { name: "Dashboard", path: "/dashboard" }
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 border-b border-white/5 bg-black/30 backdrop-blur-xl">
      
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <NavLink
          to="/"
          className="text-xl font-bold tracking-wide text-white"
        >
          StudyMate AI
        </NavLink>

        {/* Navigation Links */}
        <div className="flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? "text-white"
                  : "text-gray-400 hover:text-white transition"
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
         
        {/* Auth & Profile Section */}
        {!user ? (
          <div className="flex items-center gap-4">
            <button onClick={() => openSignIn()} className="text-sm text-gray-300 hover:text-white transition">
              Sign in
            </button>
            <button onClick={() => openSignUp()} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition">
              Get Started
            </button>
          </div>
        ) : (
          <div className='flex gap-4 items-center'>
            {/* 🧹 CLEANED: Removed the Credits Button completely */}
            
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action 
                  label='Create Roadmap' 
                  labelIcon={<SparkleIcon size={14}/>} 
                  onClick={() => navigate('/generate')}
                />
                
                {/* 🧹 CLEANED: Fixed path to point to /dashboard instead of /my-generations */}
                <UserButton.Action 
                  label='Dashboard' 
                  labelIcon={<FolderEditIcon size={14}/>} 
                  onClick={() => navigate('/dashboard')}
                />

                <UserButton.Action 
                  label='Community' 
                  labelIcon={<GalleryHorizontalEnd size={14}/>} 
                  onClick={() => navigate('/community')}
                />
                {/* 🧹 CLEANED: Removed Plans Action from dropdown */}
              </UserButton.MenuItems>
            </UserButton>
          </div>
        )}

      </div>
    </nav>
  );
}