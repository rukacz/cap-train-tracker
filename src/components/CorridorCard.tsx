import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Train as TrainIcon, MapPin } from "lucide-react";
import { Train, Corridor, STATUS_LABELS, STATUS_COLORS } from "@/types/train";
import { TrainCard } from "@/components/TrainCard";

interface CorridorCardProps {
  corridor: Corridor;
  trains: Train[];
  isPublic?: boolean;
  onTrainClick?: (train: Train) => void;
  onTrainDelete?: (trainId: string) => void;
  onAddTrain?: () => void;
  limit?: number;
}

export function CorridorCard({ 
  corridor, 
  trains, 
  isPublic = false, 
  onTrainClick, 
  onTrainDelete,
  onAddTrain,
  limit 
}: CorridorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const displayTrains = limit && !isExpanded ? trains.slice(0, limit) : trains;
  const hasMoreTrains = limit && trains.length > limit;

  const getStatusCounts = () => {
    const counts = { VOLNO: 0, DOTAZ: 0, PLNO: 0 };
    trains.forEach(train => counts[train.status]++);
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Card className="bg-gradient-to-br from-card to-slate-50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrainIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                {corridor.name}
              </CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />
                <span>{corridor.from} → {corridor.to}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Status indicators */}
            <div className="flex gap-2">
              {Object.entries(statusCounts).map(([status, count]) => {
                if (count === 0) return null;
                const config = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
                return (
                  <Badge 
                    key={status}
                    variant="secondary" 
                    className={`${config.bg} ${config.text} border-none text-xs px-2 py-1`}
                  >
                    {count}× {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                  </Badge>
                );
              })}
            </div>
            
            {hasMoreTrains && !isExpanded && (
              <Badge variant="outline" className="text-xs">
                +{trains.length - limit!} další
              </Badge>
            )}
            
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {(isExpanded || displayTrains.length > 0) && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {displayTrains.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrainIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Žádné vlaky v tomto koridoru</p>
              </div>
            ) : (
              displayTrains.map((train) => (
                <TrainCard
                  key={train.id}
                  train={train}
                  onClick={() => onTrainClick?.(train)}
                  showDelete={!isPublic}
                  onDelete={() => onTrainDelete?.(train.id)}
                />
              ))
            )}
            
            {hasMoreTrains && !isExpanded && (
              <Button 
                variant="ghost" 
                className="w-full mt-2 text-primary hover:text-primary-dark"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
              >
                Zobrazit všech {trains.length} vlaků
              </Button>
            )}
            
            {!isPublic && onAddTrain && (
              <Button 
                variant="outline" 
                className="w-full mt-4 border-dashed border-2 hover:border-primary hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTrain();
                }}
              >
                + Přidat vlak
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}