  import { Home, Users, Settings, Bell, LogOut } from "lucide-react";
  import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
  import FacultyTab from "../components/faculty/FacultyTab";
  import StudentsTab from "../components/students/StudentsTab";
  import CollegesTab from "../components/academics/CollegesTab";
  import ProgramsTab from "../components/academics/ProgramsTab";
  import SectionsTab from "../components/academics/SectionsTab";
  import "./dashboard.css";
  import udmLogo from "./udmlogo.png";

  export default function RegistrarDashboard() {
    return (
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar flex flex-col items-center justify-between py-4">
          {/* Top: Website logo */}
          <div className="sidebar-top flex flex-col items-center gap-8">
            <img
              src={udmLogo}
              alt="Accla"
              className="sidebar-image"
            />

            {/* Navigation icons */}
            <button className="sidebar-icon">
              <Home href="RegistrarDashboard.tsx" />
            </button>
            <button className="sidebar-icon">
              <Users href=""/>
            </button>
          </div>

          {/* Bottom: Settings */}
          <div className="sidebar-bottom">
            <button className="sidebar-icon">
              <Settings />
            </button>
          </div>
        </div>

        {/* Top bar */}
        <div className="top-bar flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Registrar Dashboard</h1>

          <div className="flex items-center gap-6">
            {/* Notification Icon */}
            <button className="text-gray-600 hover:text-black">
              <Bell size={30} />
            </button>

            {/* Logout Button */}
            <button className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 transition">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <main className="main-content">
          <div className="content-box">
            <Tabs defaultValue="faculty">
              <TabsList>
                <TabsTrigger value="faculty" className="tabs-trigger">Faculty</TabsTrigger>
                <TabsTrigger value="students" className="tabs-trigger">Students</TabsTrigger>
                <TabsTrigger value="colleges" className="tabs-trigger">Colleges</TabsTrigger>
                <TabsTrigger value="programs" className="tabs-trigger">Programs</TabsTrigger>
                <TabsTrigger value="sections" className="tabs-trigger">Sections</TabsTrigger>
              </TabsList>

              <TabsContent value="faculty">
                <FacultyTab />
              </TabsContent>
              <TabsContent value="students">
                <StudentsTab />
              </TabsContent>
              <TabsContent value="colleges">
                <CollegesTab />
              </TabsContent>
              <TabsContent value="programs">
                <ProgramsTab />
              </TabsContent>
              <TabsContent value="sections">
                <SectionsTab />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    );
  }
