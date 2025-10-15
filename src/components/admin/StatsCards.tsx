import { Card } from '@/components/ui/card';
import { 
  Store, 
  Users, 
  Mail, 
  Trophy,
  Target,
  Calendar
} from 'lucide-react';
import { AdminStats } from '@/types/admin';

interface StatsCardsProps {
  stats: AdminStats;
  onCardClick: (type: string) => void;
}

export default function StatsCards({ stats, onCardClick }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      {/* Total Stores Card */}
      <Card 
        className="p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
        onClick={() => onCardClick('stores')}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total Stores</h3>
          <Store className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{stats.totalStores}</div>
        <div className="text-xs text-muted-foreground mt-1">Click to view details</div>
      </Card>

      {/* Total Promos Card */}
      <Card 
        className="p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
        onClick={() => onCardClick('promos')}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total Promos</h3>
          <Target className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{stats.totalPromos}</div>
        <div className="text-xs text-muted-foreground mt-1">Click to view details</div>
      </Card>

      {/* Total Entries Card */}
      <Card 
        className="p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
        onClick={() => onCardClick('entries')}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total Entries</h3>
          <Users className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{stats.totalEntries}</div>
        <div className="text-xs text-muted-foreground mt-1">Click to view details</div>
      </Card>

      {/* Unique Emails Card */}
      <Card 
        className="p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
        onClick={() => onCardClick('emails')}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Unique Emails</h3>
          <Mail className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{stats.uniqueEmails}</div>
        <div className="text-xs text-muted-foreground mt-1">Click to view details</div>
      </Card>

      {/* Active Promos Card */}
      <Card 
        className="p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
        onClick={() => onCardClick('active')}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Active Promos</h3>
          <Calendar className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{stats.activePromos}</div>
        <div className="text-xs text-muted-foreground mt-1">Click to view details</div>
      </Card>

      {/* Total Winners Card */}
      <Card 
        className="p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105"
        onClick={() => onCardClick('winners')}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total Winners</h3>
          <Trophy className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{stats.totalWinners}</div>
        <div className="text-xs text-muted-foreground mt-1">Click to view details</div>
      </Card>
    </div>
  );
}
