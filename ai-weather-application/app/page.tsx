import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BackgroundShader } from "@/components/ui/background-shader";
import { ChatInterface } from "@/components/chat-interface";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <BackgroundShader />
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <main
        className="flex-1 flex flex-col relative z-10 h-screen min-h-0 overflow-hidden w-full md:w-[calc(100%-300px)]">
        <Header />
        <Suspense fallback={null}>
          <ChatInterface />
        </Suspense>
      </main>
    </>
  );
}
