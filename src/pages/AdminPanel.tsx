import { useEffect, useState, useRef } from "react";
import { CORRIDORS, Train, CorridorId } from "@/types/train";
import { getTrains, addTrain, updateTrain, deleteTrain, getAllTrains, resetToDefaultData, importTrainsFromJSON } from "@/lib/mockData";
import { CorridorCard } from "@/components/CorridorCard";
import { TrainDialog } from "@/components/TrainDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Settings, TrainIcon, Shield, RefreshCw, Upload, Download, RotateCcw } from "lucide-react";

export default function AdminPanel() {
  const [trainsByCorridors, setTrainsByCorridors] = useState<Record<string, Train[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrain, setEditingTrain] = useState<Train | undefined>();
  const [defaultCorridor, setDefaultCorridor] = useState<CorridorId>();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importTrainsFromJSON(content);
        loadData();
        toast({
          title: "Úspěch",
          description: "Data byla úspěšně importována",
        });
      } catch (error) {
        toast({
          title: "Chyba",
          description: error instanceof Error ? error.message : "Nepodařilo se importovat data",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleExportData = () => {
    try {
      const allTrains = getAllTrains();
      const dataStr = JSON.stringify(allTrains, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `captrain-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      toast({
        title: "Úspěch",
        description: "Data byla úspěšně exportována",
      });
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se exportovat data",
        variant: "destructive"
      });
    }
  };

  const handleResetData = () => {
    if (window.confirm("Opravdu chcete resetovat všechna data na výchozí hodnoty? Tato akce je nevratná!")) {
      try {
        resetToDefaultData();
        loadData();
        toast({
          title: "Úspěch",
          description: "Data byla resetována na výchozí hodnoty",
        });
      } catch (error) {
        toast({
          title: "Chyba",
          description: "Nepodařilo se resetovat data",
          variant: "destructive"
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
          <p className="text-gray-600">Načítání admin panelu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-100 to-yellow-200/90 backdrop-blur-sm border-b border-yellow-300 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/medlog-logo.svg" 
                alt="Medlog Logo" 
                className="h-12 w-auto"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-yellow-700" />
                  <h1 className="text-2xl font-bold text-gray-800">Medlog Admin Panel</h1>
                </div>
                <p className="text-sm text-gray-600">Správa vlakových kapacit</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleImportData}
                className="flex items-center gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-800"
              >
                <Upload className="w-4 h-4" />
                Import
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="flex items-center gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-800"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleResetData}
                className="flex items-center gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-800"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              
              <Button 
                variant="outline" 
                onClick={loadData}
                className="flex items-center gap-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-800"
              >
                <RefreshCw className="w-4 h-4" />
                Obnovit
              </Button>
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
              <TrainIcon className="w-6 h-6 text-yellow-700 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-gray-800 mb-2">Správa vlaků</h2>
                <p className="text-sm text-gray-600">
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

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}