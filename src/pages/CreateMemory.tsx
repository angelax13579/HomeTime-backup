import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFamily } from '@/contexts/FamilyContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { 
  PenLine, Image, Lock, Users, User, Sparkles, X, 
  MessageCircleQuestion, Send, Bell, Mail, ArrowLeft
} from 'lucide-react';

type Visibility = 'private' | 'family' | 'specific';
type CreateMode = 'memory' | 'prompt';

const PROMPT_SUGGESTIONS = [
  "What's your favorite family tradition?",
  "Share a childhood memory that makes you laugh.",
  "What does 'home' mean to you?",
  "What's something you're grateful for today?",
  "Describe a moment when you felt most loved.",
  "What's a lesson you learned from a family member?",
];

export default function CreateMemory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addMemory, addFamilyPrompt, user, familyMembers } = useFamily();
  
  const promptId = location.state?.promptId;
  const promptText = location.state?.promptText;

  const [mode, setMode] = useState<CreateMode>(promptId ? 'memory' : 'memory');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>(user.defaultVisibility);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [promptQuestion, setPromptQuestion] = useState('');

  const handleSubmitMemory = () => {
    if (!content.trim()) {
      toast.error('Please write something about this moment');
      return;
    }

    addMemory({
      authorId: user.id,
      authorName: user.name,
      content: content.trim(),
      photos,
      visibility,
      visibleTo: visibility === 'specific' ? selectedMembers : undefined,
      promptId,
    });

    toast.success('Memory saved!');
    navigate('/memories');
  };

  const handleSubmitPrompt = () => {
    if (!promptQuestion.trim()) {
      toast.error('Please write a question for your family');
      return;
    }

    addFamilyPrompt({
      authorId: user.id,
      authorName: user.name,
      question: promptQuestion.trim(),
    });

    navigate('/memories');
  };

  const handlePhotoUpload = () => {
    toast.info('Photo upload coming soon!');
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const useSuggestion = (suggestion: string) => {
    setPromptQuestion(suggestion);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/30">
        <div className="px-5 py-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/memories')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Memory Board</span>
            </button>
            <Button 
              variant="warm" 
              size="sm" 
              onClick={mode === 'memory' ? handleSubmitMemory : handleSubmitPrompt}
            >
              {mode === 'memory' ? 'Save' : 'Send'}
            </Button>
          </div>
        </div>
      </header>

      <main className="px-5 py-6 max-w-lg mx-auto space-y-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {mode === 'memory' ? (
              <PenLine className="w-5 h-5 text-primary" />
            ) : (
              <MessageCircleQuestion className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">
              {mode === 'memory' ? 'Create Memory' : 'Ask Family'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === 'memory' ? 'Share a moment' : 'Send a reflection prompt'}
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        {!promptId && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/50 rounded-xl">
            <button
              onClick={() => setMode('memory')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'memory'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PenLine className="w-4 h-4" />
              Memory
            </button>
            <button
              onClick={() => setMode('prompt')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'prompt'
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageCircleQuestion className="w-4 h-4" />
              Ask Family
            </button>
          </div>
        )}

        {mode === 'memory' ? (
          <>
            {/* Prompt Card */}
            {promptText && (
              <Card className="p-4 gradient-warm border-0">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-primary-foreground/80 mb-1">Responding to:</p>
                    <p className="text-sm font-medium text-primary-foreground">{promptText}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/create', { replace: true })}
                    className="text-primary-foreground/60 hover:text-primary-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            )}

            {/* Content */}
            <div className="space-y-3">
              <Label className="font-display font-semibold">Your Reflection</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share a moment, a feeling, or a memory..."
                className="min-h-[200px] rounded-xl resize-none text-base"
              />
            </div>

            {/* Photos */}
            <div className="space-y-3">
              <Label className="font-display font-semibold">Photos</Label>
              <div className="flex gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={handlePhotoUpload}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Image className="w-5 h-5" />
                  <span className="text-xs">Add</span>
                </button>
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-3">
              <Label className="font-display font-semibold">Who can see this?</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setVisibility('private')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    visibility === 'private'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Lock className={`w-5 h-5 mx-auto mb-1 ${visibility === 'private' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-xs font-medium ${visibility === 'private' ? 'text-primary' : 'text-muted-foreground'}`}>
                    Only Me
                  </p>
                </button>
                
                <button
                  onClick={() => setVisibility('family')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    visibility === 'family'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Users className={`w-5 h-5 mx-auto mb-1 ${visibility === 'family' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-xs font-medium ${visibility === 'family' ? 'text-primary' : 'text-muted-foreground'}`}>
                    Family
                  </p>
                </button>
                
                <button
                  onClick={() => setVisibility('specific')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    visibility === 'specific'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <User className={`w-5 h-5 mx-auto mb-1 ${visibility === 'specific' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-xs font-medium ${visibility === 'specific' ? 'text-primary' : 'text-muted-foreground'}`}>
                    Select
                  </p>
                </button>
              </div>
            </div>

            {/* Member Selection */}
            {visibility === 'specific' && (
              <div className="space-y-3 animate-fade-in">
                <Label className="text-sm text-muted-foreground">Select family members:</Label>
                <div className="flex flex-wrap gap-2">
                  {familyMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedMembers.includes(member.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Prompt Creation Mode */}
            <Card className="p-4 bg-secondary/30 border-border/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Send className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                    Ask your family to reflect
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Create a question that all family members can answer. They'll be notified and can respond with their own memories.
                  </p>
                </div>
              </div>
            </Card>

            {/* Notification Preview */}
            <div className="flex items-center gap-3 px-4 py-3 bg-accent/30 rounded-xl">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Bell className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                {familyMembers.length} family member{familyMembers.length !== 1 ? 's' : ''} will be notified
              </p>
            </div>

            {/* Question Input */}
            <div className="space-y-3">
              <Label className="font-display font-semibold">Your Question</Label>
              <Textarea
                value={promptQuestion}
                onChange={(e) => setPromptQuestion(e.target.value)}
                placeholder="What would you like your family to reflect on?"
                className="min-h-[120px] rounded-xl resize-none text-base"
              />
            </div>

            {/* Suggestions */}
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">Need inspiration?</Label>
              <div className="flex flex-wrap gap-2">
                {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => useSuggestion(suggestion)}
                    className="px-3 py-2 text-xs bg-card border border-border/50 rounded-xl text-left text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients Preview */}
            <div className="space-y-3">
              <Label className="font-display font-semibold">Will be sent to</Label>
              <div className="flex flex-wrap gap-2">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-secondary text-secondary-foreground"
                  >
                    {member.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Backend Notice */}
            <Card className="p-4 border-dashed border-primary/30 bg-primary/5">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Enable notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Connect Lovable Cloud to send email and push notifications when you create prompts.
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
