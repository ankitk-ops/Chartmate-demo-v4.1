import { Stethoscope } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full border-b bg-card">
      <div className="max-w-screen-2xl mx-auto flex items-center gap-3 p-4">
        <Stethoscope className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          ChartMate <span className="text-primary">PRO</span>
        </h1>
      </div>
    </header>
  );
}
