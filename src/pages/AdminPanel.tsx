import { useEffect, useState } from "react";
import { CORRIDORS, Train, CorridorId } from "@/types/train";
import { getTrains, addTrain, updateTrain, deleteTrain } from "@/lib/mockData";
import { CorridorCard } from "@/components/CorridorCard";
import { TrainDialog } from "@/components/TrainDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Settings, TrainIcon, Shield, RefreshCw } from "lucide-react";

export default function AdminPanel() {
  const [trainsByCorridors, setTrainsByCorridors] = useState<Record<string, Train[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState<Train | undefined>();
  const [defaultCorridor, setDefaultCorridor] = useState<CorridorId>();
  const { toast } = useToast();

  const loadData = () => {
    setIsLoading(true);
    const data: Record<string, Train[]> = {};
    CORRIDORS.forEach(corridor => {
      data[corridor.id] = getTrains(corridor.id);
    });
    setTrainsByCorridors(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every minute to clean expired trains
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAddTrain = (corridor: CorridorId) => {
    setEditingTrain(undefined);
    setDefaultCorridor(corridor);
    setDialogOpen(true);
  };

  const handleEditTrain = (train: Train) => {
    setEditingTrain(train);
    setDefaultCorridor(undefined);
    setDialogOpen(true);
  };

  const handleSaveTrain = (trainData: any) => {
    try {
      if ('id' in trainData) {
        // Update existing train
        updateTrain(trainData.id, trainData);
        toast({
          title: "Úspěch",
          description: "Vlak byl úspěšně upraven",
        });
      } else {
        // Add new train
        addTrain(trainData);
        toast({
          title: "Úspěch", 
          description: "Vlak byl úspěšně přidán",
        });
      }
      loadData();
    } catch (error) {
      toast({
        title: "Chyba",
        description: error instanceof Error ? error.message : "Nastala neočekávaná chyba",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTrain = (trainId: string) => {
    if (window.confirm("Opravdu chcete smazat tento vlak?")) {
      try {
        deleteTrain(trainId);
        toast({
          title: "Úspěch",
          description: "Vlak byl úspěšně smazán",
        });
        loadData();
      } catch (error) {
        toast({
          title: "Chyba",
          description: "Nepodařilo se smazat vlak",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Načítání admin panelu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/medlog-logo.svg" 
                alt="Medlog Logo" 
                className="h-10 w-auto"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">Medlog Admin Panel</h1>
                </div>
                <p className="text-sm text-muted-foreground">Správa vlakových kapacit</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={loadData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Obnovit
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info card */}
        <Card className="mb-8 bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <TrainIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-foreground mb-2">Správa vlaků</h2>
                <p className="text-sm text-muted-foreground">
                  Vlaky se automaticky mažou 48 hodin před odjezdem. Nové vlaky musí odjíždět nejdříve za 48 hodin.
                  Klikněte na koridor pro rozbalení, na vlak pro editaci.
                </p>
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
              isPublic={false}
              onTrainClick={handleEditTrain}
              onTrainDelete={handleDeleteTrain}
              onAddTrain={() => handleAddTrain(corridor.id)}
            />
          ))}
        </div>
      </main>

      <TrainDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        train={editingTrain}
        defaultCorridor={defaultCorridor}
        onSave={handleSaveTrain}
      />
    </div>
  );
}