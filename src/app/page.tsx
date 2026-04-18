import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import FlowCanvas from "@/components/flow/FlowCanvas";
import Inspector from "@/components/Inspector";

export default function Home() {
  return (
    <div className="cs-app-shell">
      <Topbar />
      <Sidebar />
      <main className="cs-canvas">
        <FlowCanvas />
      </main>
      <Inspector />
    </div>
  );
}
