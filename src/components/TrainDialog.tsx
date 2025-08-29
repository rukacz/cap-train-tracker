import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Train, TrainStatus, CorridorId, STATUS_LABELS, CORRIDORS } from "@/types/train";
import { useToast } from "@/hooks/use-toast";

interface TrainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  train?: Train;
  defaultCorridor?: CorridorId;
  onSave: (train: Omit<Train, "id"> | { id: string } & Partial<Train>) => void;
}

export function TrainDialog({ open, onOpenChange, train, defaultCorridor, onSave }: TrainDialogProps) {
  const { toast } = useToast();
  const [corridor, setCorridor] = useState<CorridorId>(train?.corridor || defaultCorridor || "BRV_OBRNICE");
  const [datetime, setDatetime] = useState(() => {
    if (train?.departureIso) {
      // Convert ISO to local datetime-local format
      const date = new Date(train.departureIso);
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    }
    return "";
  });
  const [status, setStatus] = useState<TrainStatus>(train?.status || "VOLNO");

  const handleSave = () => {
    if (!datetime) {
      toast({
        title: "Chyba",
        description: "Vyberte datum a čas odjezdu",
        variant: "destructive"
      });
      return;
    }

    // Convert local datetime to ISO
    const departureIso = new Date(datetime).toISOString();
    
    // Check if more than 48h from now
    const now = new Date();
    const departure = new Date(departureIso);
    const diffInHours = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours <= 48) {
      toast({
        title: "Chyba",
        description: "Vlak musí odjíždět nejdříve za 48 hodin",
        variant: "destructive"
      });
      return;
    }

    if (train) {
      // Update existing train
      onSave({
        id: train.id,
        corridor,
        departureIso,
        status
      });
    } else {
      // Create new train
      onSave({
        corridor,
        departureIso,
        status
      });
    }

    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setCorridor(defaultCorridor || "BRV_OBRNICE");
      setDatetime("");
      setStatus("VOLNO");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{train ? "Upravit vlak" : "Přidat nový vlak"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="corridor">Koridor</Label>
            <Select value={corridor} onValueChange={(value) => setCorridor(value as CorridorId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CORRIDORS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="datetime">Datum a čas odjezdu</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              min={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16)}
            />
            <p className="text-xs text-muted-foreground">
              Vlak musí odjíždět nejdříve za 48 hodin
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as TrainStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Zrušit
          </Button>
          <Button onClick={handleSave}>
            {train ? "Uložit změny" : "Přidat vlak"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}