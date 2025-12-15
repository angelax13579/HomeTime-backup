import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '@/contexts/FamilyContext';
import { MemoryPoster } from '@/components/MemoryPoster';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookHeart, Calendar, Plus } from 'lucide-react';

type TimeFilter = 'all' | 'day' | 'month' | 'year';
type AuthorFilter = 'all' | 'mine' | string;

// Generate consistent rotation for each memory based on its id
const getRotation = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ((hash % 7) - 3); // Range: -3 to 3 degrees
};

export default function Memories() {
  const navigate = useNavigate();
  const { memories, familyMembers, user } = useFamily();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [authorFilter, setAuthorFilter] = useState<AuthorFilter>('all');

  const filteredMemories = memories.filter((memory) => {
    // Filter by author
    if (authorFilter === 'mine' && memory.authorId !== user.id) return false;
    if (authorFilter !== 'all' && authorFilter !== 'mine' && memory.authorId !== authorFilter) return false;

    // Filter by time
    const now = new Date();
    const memoryDate = new Date(memory.createdAt);
    
    if (timeFilter === 'day') {
      return memoryDate.toDateString() === now.toDateString();
    }
    if (timeFilter === 'month') {
      return (
        memoryDate.getMonth() === now.getMonth() &&
        memoryDate.getFullYear() === now.getFullYear()
      );
    }
    if (timeFilter === 'year') {
      return memoryDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  return (
    <div className="min-h-screen pb-24 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2Y1ZjBkYyIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIiBmaWxsPSIjZTBlMGRjIi8+Cjwvc3ZnPg==')] bg-repeat">
      {/* Cork board texture overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-br from-amber-900/5 via-transparent to-orange-900/5" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-secondary/95 backdrop-blur-lg border-b-4 border-amber-800/30 shadow-md">
        <div className="px-5 py-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookHeart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">Memory Board</h1>
                <p className="text-xs text-muted-foreground">Your family's shared moments</p>
              </div>
            </div>
            <Button variant="warm" size="sm" className="rounded-xl" onClick={() => navigate('/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
              <SelectTrigger className="flex-1 rounded-xl h-9 text-sm bg-card">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={authorFilter} onValueChange={(v) => setAuthorFilter(v as AuthorFilter)}>
              <SelectTrigger className="flex-1 rounded-xl h-9 text-sm bg-card">
                <SelectValue placeholder="Author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone</SelectItem>
                <SelectItem value="mine">Just Mine</SelectItem>
                {familyMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="relative px-4 py-8 max-w-2xl mx-auto">
        {/* Bulletin board frame effect */}
        <div className="absolute inset-x-2 top-4 bottom-4 border-4 border-amber-800/20 rounded-lg pointer-events-none" />
        
        {/* Masonry-style grid for posters */}
        <div className="grid grid-cols-2 gap-6 pt-4">
          {filteredMemories.map((memory) => (
            <MemoryPoster 
              key={memory.id} 
              memory={memory} 
              rotation={getRotation(memory.id)}
            />
          ))}
        </div>

        {filteredMemories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <BookHeart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">
              No memories yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {authorFilter === 'mine'
                ? "You haven't shared any memories yet"
                : "No memories match your filters"}
            </p>
            <Button variant="warm" onClick={() => navigate('/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create a Memory
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
