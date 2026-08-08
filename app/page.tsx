import { cn } from "@/utils/cn";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-beige">
      <div className={cn("glass p-12 rounded-2xl text-center animate-fade-in")}>
        <h1 className="text-4xl font-bold text-dark mb-4">
          Huayu Hub
        </h1>
        <p className="text-lg text-dark/70">
          Chinese Learning Community Platform
        </p>
      </div>
    </main>
  );
}
