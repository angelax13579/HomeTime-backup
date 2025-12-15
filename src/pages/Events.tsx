import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { 
  CalendarDays, Plus, Mail, Compass, Clock, Users, 
  Check, X, Send, MapPin, ChevronRight, Sparkles,
  Bell, User
} from 'lucide-react';
import { FamilyEvent, ActivitySuggestion } from '@/types/family';

type EventTab = 'create' | 'invitations' | 'explore';

const REMINDER_OPTIONS = [
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
  { value: 10080, label: '1 week before' },
];

const ACTIVITY_SUGGESTIONS: ActivitySuggestion[] = [
  {
    id: '1',
    title: 'Family Game Night',
    description: 'Gather around for board games, card games, or video games. Perfect for rainy days or cozy evenings.',
    category: 'games',
    minPeople: 2,
    maxPeople: 10,
    ageRange: { min: 5, max: 99 },
    duration: '2-3 hours',
  },
  {
    id: '2',
    title: 'Picnic in the Park',
    description: 'Pack some sandwiches, fruits, and snacks for a relaxing outdoor meal together.',
    category: 'outdoor',
    minPeople: 2,
    maxPeople: 20,
    ageRange: { min: 0, max: 99 },
    duration: '2-4 hours',
  },
  {
    id: '3',
    title: 'Cooking Together',
    description: 'Choose a recipe and cook a meal together. Everyone can have a role!',
    category: 'food',
    minPeople: 2,
    maxPeople: 6,
    ageRange: { min: 8, max: 99 },
    duration: '1-2 hours',
  },
  {
    id: '4',
    title: 'Arts & Crafts Session',
    description: 'Get creative with painting, drawing, or DIY projects.',
    category: 'creative',
    minPeople: 1,
    maxPeople: 8,
    ageRange: { min: 3, max: 99 },
    duration: '1-3 hours',
  },
  {
    id: '5',
    title: 'Nature Walk / Hike',
    description: 'Explore a local trail or nature reserve together.',
    category: 'outdoor',
    minPeople: 2,
    maxPeople: 15,
    ageRange: { min: 5, max: 80 },
    duration: '1-4 hours',
  },
  {
    id: '6',
    title: 'Movie Marathon',
    description: 'Pick a theme or series and watch movies together with popcorn.',
    category: 'indoor',
    minPeople: 2,
    maxPeople: 10,
    ageRange: { min: 5, max: 99 },
    duration: '4-6 hours',
  },
  {
    id: '7',
    title: 'Weekend Getaway',
    description: 'Plan a short trip to a nearby destination for quality family time.',
    category: 'travel',
    minPeople: 2,
    maxPeople: 10,
    ageRange: { min: 0, max: 99 },
    duration: '1-3 days',
  },
  {
    id: '8',
    title: 'Photo Album Creation',
    description: 'Gather old photos and create a family album or scrapbook together.',
    category: 'creative',
    minPeople: 2,
    maxPeople: 6,
    ageRange: { min: 10, max: 99 },
    duration: '2-4 hours',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  outdoor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  indoor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  creative: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  travel: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  games: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

export default function Events() {
  const { familyMembers, user, events, invitations, addEvent, respondToInvitation } = useFamily();
  const [activeTab, setActiveTab] = useState<EventTab>('create');
  
  // Create event state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [eventTime, setEventTime] = useState('12:00');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [reminderBefore, setReminderBefore] = useState(60);
  const [isPersonalReminder, setIsPersonalReminder] = useState(false);
  
  // Explore filters
  const [peopleFilter, setPeopleFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Decline dialog
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineEventId, setDeclineEventId] = useState<string | null>(null);
  const [declineMessage, setDeclineMessage] = useState('');
  
  // Activity detail dialog
  const [selectedActivity, setSelectedActivity] = useState<ActivitySuggestion | null>(null);

  const handleCreateEvent = () => {
    if (!eventTitle.trim()) {
      toast.error('Please enter an event title');
      return;
    }
    if (!eventDate) {
      toast.error('Please select a date');
      return;
    }

    const [hours, minutes] = eventTime.split(':').map(Number);
    const dateTime = new Date(eventDate);
    dateTime.setHours(hours, minutes);

    addEvent({
      creatorId: user.id,
      creatorName: user.name,
      title: eventTitle.trim(),
      description: eventDescription.trim(),
      dateTime,
      invitedMembers: isPersonalReminder ? [] : selectedMembers,
      reminderBefore,
      isPersonalReminder,
    });

    // Reset form
    setEventTitle('');
    setEventDescription('');
    setEventDate(undefined);
    setEventTime('12:00');
    setSelectedMembers([]);
    setIsPersonalReminder(false);
    
    toast.success(isPersonalReminder ? 'Reminder created!' : 'Event created & invitations sent!');
  };

  const handleAcceptInvitation = (eventId: string, customReminder?: number) => {
    respondToInvitation(eventId, 'accepted');
    toast.success('Event added to your calendar!');
  };

  const handleDeclineInvitation = (eventId: string) => {
    setDeclineEventId(eventId);
    setDeclineDialogOpen(true);
  };

  const confirmDecline = () => {
    if (declineEventId) {
      respondToInvitation(declineEventId, 'declined', declineMessage || undefined);
      toast.info('Invitation declined');
      setDeclineDialogOpen(false);
      setDeclineEventId(null);
      setDeclineMessage('');
    }
  };

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const createEventFromActivity = (activity: ActivitySuggestion) => {
    setEventTitle(activity.title);
    setEventDescription(activity.description);
    setSelectedActivity(null);
    setActiveTab('create');
    toast.info('Activity added to event form. Set a date and invite members!');
  };

  const filteredActivities = ACTIVITY_SUGGESTIONS.filter(activity => {
    if (categoryFilter !== 'all' && activity.category !== categoryFilter) return false;
    if (peopleFilter !== 'all') {
      const count = parseInt(peopleFilter);
      if (count < activity.minPeople || count > activity.maxPeople) return false;
    }
    return true;
  });

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/30">
        <div className="px-5 py-4 max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">Events</h1>
              <p className="text-xs text-muted-foreground">Plan time together</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-secondary/50 rounded-xl">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'create'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`relative flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'invitations'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="w-4 h-4" />
              Invites
              {pendingInvitations.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {pendingInvitations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'explore'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore
            </button>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto space-y-6">
        {activeTab === 'create' && (
          <>
            {/* Event Type Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsPersonalReminder(false)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  !isPersonalReminder
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Users className={`w-6 h-6 mx-auto mb-2 ${!isPersonalReminder ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className={`text-sm font-medium ${!isPersonalReminder ? 'text-primary' : 'text-muted-foreground'}`}>
                  Family Event
                </p>
                <p className="text-xs text-muted-foreground mt-1">Invite members</p>
              </button>
              <button
                onClick={() => setIsPersonalReminder(true)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isPersonalReminder
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <User className={`w-6 h-6 mx-auto mb-2 ${isPersonalReminder ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className={`text-sm font-medium ${isPersonalReminder ? 'text-primary' : 'text-muted-foreground'}`}>
                  Personal Reminder
                </p>
                <p className="text-xs text-muted-foreground mt-1">Just for you</p>
              </button>
            </div>

            {/* Event Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-display font-semibold">Event Title</Label>
                <Input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="What are you planning?"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-display font-semibold">Description (Optional)</Label>
                <Textarea
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Add more details about this event..."
                  className="rounded-xl resize-none min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-display font-semibold">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start rounded-xl">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        {eventDate ? format(eventDate, 'MMM d, yyyy') : 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={eventDate}
                        onSelect={setEventDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="font-display font-semibold">Time</Label>
                  <Input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-display font-semibold">Remind me</Label>
                <Select value={reminderBefore.toString()} onValueChange={(v) => setReminderBefore(parseInt(v))}>
                  <SelectTrigger className="rounded-xl">
                    <Bell className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!isPersonalReminder && (
                <div className="space-y-3">
                  <Label className="font-display font-semibold">Invite Family Members</Label>
                  <div className="flex flex-wrap gap-2">
                    {familyMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => toggleMember(member.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          selectedMembers.includes(member.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {member.name}
                      </button>
                    ))}
                  </div>
                  {selectedMembers.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} will receive an invitation
                    </p>
                  )}
                </div>
              )}

              <Button 
                variant="warm" 
                size="lg" 
                className="w-full rounded-xl"
                onClick={handleCreateEvent}
              >
                <Send className="w-4 h-4 mr-2" />
                {isPersonalReminder ? 'Create Reminder' : 'Send Invitations'}
              </Button>
            </div>
          </>
        )}

        {activeTab === 'invitations' && (
          <>
            {pendingInvitations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  No pending invitations
                </h3>
                <p className="text-sm text-muted-foreground">
                  When family members invite you to events, they'll appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInvitations.map((invitation) => (
                  <Card key={invitation.eventId} className="p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-foreground">
                          {invitation.event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          From {invitation.event.creatorName}
                        </p>
                      </div>
                    </div>
                    
                    {invitation.event.description && (
                      <p className="text-sm text-muted-foreground">
                        {invitation.event.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" />
                        {format(new Date(invitation.event.dateTime), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {format(new Date(invitation.event.dateTime), 'h:mm a')}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="warm" 
                        className="flex-1 rounded-xl"
                        onClick={() => handleAcceptInvitation(invitation.eventId)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 rounded-xl"
                        onClick={() => handleDeclineInvitation(invitation.eventId)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'explore' && (
          <>
            {/* Filters */}
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="flex-1 rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="indoor">Indoor</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="games">Games</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={peopleFilter} onValueChange={setPeopleFilter}>
                <SelectTrigger className="flex-1 rounded-xl">
                  <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="People" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Size</SelectItem>
                  <SelectItem value="2">2 people</SelectItem>
                  <SelectItem value="4">4 people</SelectItem>
                  <SelectItem value="6">6 people</SelectItem>
                  <SelectItem value="10">10+ people</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Cards */}
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <Card 
                  key={activity.id} 
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display font-semibold text-foreground">
                          {activity.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[activity.category]}`}>
                          {activity.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {activity.minPeople}-{activity.maxPeople}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.duration}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>

            {filteredActivities.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No activities match your filters
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Decline Dialog */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Invitation</DialogTitle>
            <DialogDescription>
              Would you like to send a message to the organizer? (Optional)
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={declineMessage}
            onChange={(e) => setDeclineMessage(e.target.value)}
            placeholder="I can't make it because... / How about another time?"
            className="min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeclineDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={confirmDecline}>
              Decline
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity Detail Dialog */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent>
          {selectedActivity && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle>{selectedActivity.title}</DialogTitle>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[selectedActivity.category]}`}>
                    {selectedActivity.category}
                  </span>
                </div>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                {selectedActivity.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {selectedActivity.minPeople}-{selectedActivity.maxPeople} people
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {selectedActivity.duration}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedActivity(null)}
                >
                  Close
                </Button>
                <Button 
                  variant="warm" 
                  className="flex-1"
                  onClick={() => createEventFromActivity(selectedActivity)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
