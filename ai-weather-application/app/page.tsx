import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BackgroundShader } from "@/components/ui/background-shader";
import { ChatInterface } from "@/components/chat-interface";

export default function Home() {
  return (
    <>
      <BackgroundShader />
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 h-screen min-h-0 overflow-hidden w-full md:w-[calc(100%-300px)]">
        <Header />
        <ChatInterface />
      </main>
    </>
  );
}
