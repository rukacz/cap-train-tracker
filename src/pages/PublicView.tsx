import { useEffect, useState } from "react";
import { CORRIDORS, Train } from "@/types/train";
import { getPublicCapacity } from "@/lib/mockData";
import { CorridorCard } from "@/components/CorridorCard";
import { Card, CardContent } from "@/components/ui/card";
import { TrainIcon, Info } from "lucide-react";

export default function PublicView() {
  const [trainsByCorridors, setTrainsByCorridors] = useState<Record<string, Train[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const data: Record<string, Train[]> = {};
      CORRIDORS.forEach(corridor => {
        data[corridor.id] = getPublicCapacity(corridor.id, 5);
      });
      setTrainsByCorridors(data);
      setIsLoading(false);
    };

    loadData();
    // Refresh data every minute to check for expired trains
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <TrainIcon className="w-8 h-8 animate-pulse mx-auto mb-4 text-yellow-600" />
          <p className="text-gray-600">Načítání kapacit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-100 to-yellow-200/90 backdrop-blur-sm border-b border-yellow-300 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <img 
              src="/medlog-logo.svg" 
              alt="Medlog Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Medlog CapTrain</h1>
              <p className="text-sm text-gray-600">Aktuální kapacity vlakových spojů</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info card */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-100 to-yellow-200/70 border-yellow-300 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-yellow-700 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-gray-800 mb-2">Jak číst kapacity</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-status-available"></div>
                    <span className="text-gray-700"><strong>Volno:</strong> Kapacita dostupná</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-status-inquiry"></div>
                    <span className="text-gray-700"><strong>Na dotaz:</strong> Kontaktujte nás</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-status-full"></div>
                    <span className="text-gray-700"><strong>Plno:</strong> Kapacita vyčerpána</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Corridors grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {CORRIDORS.map((corridor) => (
            <CorridorCard
              key={corridor.id}
              corridor={corridor}
              trains={trainsByCorridors[corridor.id] || []}
              isPublic={true}
              limit={5}
            />
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>Data se automaticky aktualizují. Zobrazují se pouze spoje odjíždějící za více než 48 hodin.</p>
          <p className="mt-1">Pro objednávku nebo dotaz nás prosím kontaktujte.</p>
        </div>
      </main>
    </div>
  );
}