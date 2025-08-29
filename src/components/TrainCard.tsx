import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Train, STATUS_LABELS, STATUS_COLORS } from "@/types/train";
import { Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

interface TrainCardProps {
  train: Train;
  onClick?: () => void;
  showDelete?: boolean;
  onDelete?: () => void;
}

export function TrainCard({ train, onClick, showDelete = false, onDelete }: TrainCardProps) {
  const departureDate = new Date(train.departureIso);
  const statusConfig = STATUS_COLORS[train.status];

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-[var(--shadow-elevated)] cursor-pointer border-l-4 ${statusConfig.indicator.replace('bg-', 'border-l-')}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${statusConfig.indicator}`} />
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{format(departureDate, "d.M.yyyy", { locale: cs })}</span>
                <span className="font-medium">{format(departureDate, "HH:mm")}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${statusConfig.bg} ${statusConfig.text} border-none font-medium`}
            >
              {STATUS_LABELS[train.status]}
            </Badge>
            
            {showDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded transition-colors"
                title="Smazat vlak"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}