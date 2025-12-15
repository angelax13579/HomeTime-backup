import { useState, useEffect } from 'react';
import { Prompt } from '@/types/family';
import { Sparkles, Quote, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

interface PromptCardProps {
  prompt: Prompt;
  allPrompts?: Prompt[];
}

type ReflectionMode = 'prompt' | 'quote';

interface DailyQuote {
  quote: string;
  author: string;
}

const MAX_REFRESHES = 3;

export function PromptCard({ prompt, allPrompts = [] }: PromptCardProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ReflectionMode>('prompt');
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteRefreshCount, setQuoteRefreshCount] = useState(0);
  const [promptRefreshCount, setPromptRefreshCount] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>(prompt);

  const fetchDailyQuote = async () => {
    if (quoteRefreshCount >= MAX_REFRESHES && dailyQuote) return;
    
    setIsLoadingQuote(true);
    try {
      // Use random endpoint for refreshes to get different quotes
      const { data, error } = await supabase.functions.invoke('get-daily-quote');
      
      if (error) {
        console.error('Error fetching quote:', error);
        return;
      }
      
      if (data?.success) {
        setDailyQuote({
          quote: data.quote,
          author: data.author
        });
        if (dailyQuote) {
          setQuoteRefreshCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const refreshPrompt = () => {
    if (promptRefreshCount >= MAX_REFRESHES) return;
    if (allPrompts.length <= 1) return;
    
    // Get a different prompt
    const otherPrompts = allPrompts.filter(p => p.id !== currentPrompt.id);
    const randomPrompt = otherPrompts[Math.floor(Math.random() * otherPrompts.length)];
    setCurrentPrompt(randomPrompt);
    setPromptRefreshCount(prev => prev + 1);
  };

  useEffect(() => {
    if (mode === 'quote' && !dailyQuote) {
      fetchDailyQuote();
    }
  }, [mode, dailyQuote]);

  const remainingPromptRefreshes = MAX_REFRESHES - promptRefreshCount;
  const remainingQuoteRefreshes = MAX_REFRESHES - quoteRefreshCount;

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-soft animate-slide-up">
      {/* Mode Toggle */}
      <div className="bg-primary/90 px-4 py-2">
        <Tabs value={mode} onValueChange={(v) => setMode(v as ReflectionMode)} className="w-full">
          <TabsList className="w-full bg-primary-foreground/15 p-1 h-9">
            <TabsTrigger 
              value="prompt" 
              className="flex-1 text-xs h-7 text-primary-foreground/80 data-[state=active]:bg-primary-foreground/25 data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              Daily Prompt
            </TabsTrigger>
            <TabsTrigger 
              value="quote" 
              className="flex-1 text-xs h-7 text-primary-foreground/80 data-[state=active]:bg-primary-foreground/25 data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
            >
              Inspiration
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-5 gradient-warm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary-foreground/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          {mode === 'prompt' ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-foreground/80" />
                  <span className="text-xs font-medium text-primary-foreground/80 uppercase tracking-wide">
                    Today's Reflection
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshPrompt}
                  disabled={remainingPromptRefreshes <= 0 || allPrompts.length <= 1}
                  className="h-7 px-2 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 disabled:opacity-40"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  <span className="text-[10px]">{remainingPromptRefreshes}</span>
                </Button>
              </div>
              
              <p className="text-lg font-display font-semibold text-primary-foreground mb-4">
                {currentPrompt.text}
              </p>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/create', { state: { promptId: currentPrompt.id, promptText: currentPrompt.text } })}
                className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
              >
                Share a Memory
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-primary-foreground/80" />
                  <span className="text-xs font-medium text-primary-foreground/80 uppercase tracking-wide">
                    Daily Inspiration
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchDailyQuote}
                  disabled={isLoadingQuote || remainingQuoteRefreshes <= 0}
                  className="h-7 px-2 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 disabled:opacity-40"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isLoadingQuote ? 'animate-spin' : ''}`} />
                  <span className="text-[10px]">{remainingQuoteRefreshes}</span>
                </Button>
              </div>
              
              {isLoadingQuote && !dailyQuote ? (
                <div className="animate-pulse">
                  <div className="h-5 bg-primary-foreground/20 rounded mb-2 w-3/4" />
                  <div className="h-5 bg-primary-foreground/20 rounded w-1/2" />
                </div>
              ) : dailyQuote ? (
                <>
                  <p className="text-lg font-display font-semibold text-primary-foreground mb-2 italic">
                    "{dailyQuote.quote}"
                  </p>
                  <p className="text-sm text-primary-foreground/70">
                    — {dailyQuote.author}
                  </p>
                </>
              ) : (
                <p className="text-lg font-display font-semibold text-primary-foreground">
                  Loading inspiration...
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
