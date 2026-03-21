import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Navbar (temporary) */}
      {/*<header className="p-4 border-b border-white/10">
        <h1>UGC.AI Navbar</h1> 
      </header>*/}
      <Navbar />

      {/* Dynamic Page */}
      <main className="flex-grow pt-24">
        <Outlet />
      </main>

      

    </div>
  );
}