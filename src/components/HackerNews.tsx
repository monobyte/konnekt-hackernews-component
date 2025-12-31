import React, { useEffect, useState } from 'react';
import { ExternalLink, MessageSquare, ArrowUp, RefreshCw, ChevronUp, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface HNStory {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  time: number;
  score: number;
  descendants: number;
  type: string;
}

export interface HackerNewsProps {
  initialLimit?: number;
  autoRefresh?: boolean;
}

export function HackerNews({ initialLimit = 30, autoRefresh = false }: HackerNewsProps) {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);

    try {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const storyIds = await response.json();
      
      const storyPromises = storyIds.slice(0, initialLimit).map(async (id: number) => {
        const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        return storyResponse.json();
      });

      const storyResults = await Promise.all(storyPromises);
      setStories(storyResults.filter(Boolean));
    } catch (err) {
      setError('Failed to fetch Hacker News stories. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStories();
    
    if (autoRefresh) {
      const interval = setInterval(() => fetchStories(true), 60000 * 5); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getHostname = (url?: string) => {
    if (!url) return '';
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f6f6ef] text-[#222] font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-[#ff6600] p-1 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 px-1">
          <div className="border border-white w-5 h-5 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold leading-none">Y</span>
          </div>
          <h1 className="font-bold text-sm sm:text-base">Hacker News</h1>
          <nav className="hidden sm:flex items-center gap-2 text-sm ml-2">
            <span className="text-black/60">|</span>
            <button className="hover:text-white transition-colors">new</button>
            <span className="text-black/60">|</span>
            <button className="hover:text-white transition-colors">past</button>
            <span className="text-black/60">|</span>
            <button className="hover:text-white transition-colors">comments</button>
            <span className="text-black/60">|</span>
            <button className="hover:text-white transition-colors">ask</button>
            <span className="text-black/60">|</span>
            <button className="hover:text-white transition-colors">show</button>
            <span className="text-black/60">|</span>
            <button className="hover:text-white transition-colors">jobs</button>
          </nav>
        </div>
        <button 
          onClick={() => fetchStories(true)}
          disabled={loading || refreshing}
          className="p-1.5 hover:bg-black/10 rounded-full transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {loading && !refreshing ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
            <div className="w-8 h-8 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500">Loading stories...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchStories()}
              className="px-4 py-2 bg-[#ff6600] text-white rounded font-medium hover:bg-[#e65c00] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto w-full">
            <ul className="divide-y divide-transparent">
              {stories.map((story, index) => (
                <li key={story.id} className="p-2 sm:p-3 flex gap-2 group hover:bg-[#efefef] transition-colors">
                  <div className="flex flex-col items-center w-8 pt-0.5 flex-shrink-0">
                    <span className="text-[#828282] text-sm text-right w-full">{index + 1}.</span>
                    <button className="mt-1 text-[#828282] hover:text-[#ff6600] transition-colors">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline flex-wrap gap-x-2">
                      <a 
                        href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm sm:text-base font-medium leading-tight hover:underline decoration-[#828282]"
                      >
                        {story.title}
                      </a>
                      {story.url && (
                        <span className="text-[10px] sm:text-xs text-[#828282] truncate max-w-[150px] sm:max-w-xs">
                          ({getHostname(story.url)})
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-[#828282]">
                      <span className="flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" />
                        {story.score} points
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        by {story.by}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(story.time * 1000))} ago
                      </span>
                      <a 
                        href={`https://news.ycombinator.com/item?id=${story.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {story.descendants || 0} comments
                      </a>
                      <a 
                        href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-black/5 rounded group-hover:opacity-100 opacity-0 transition-opacity"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="p-6 bg-white/50 border-t border-gray-200">
              <button 
                onClick={() => fetchStories()}
                className="text-sm font-bold text-gray-600 hover:text-black transition-colors flex items-center gap-2"
              >
                More Stories
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-[#f6f6ef] border-t-2 border-[#ff6600] p-4 text-center flex-shrink-0">
        <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-[#828282] mb-2">
          <a href="#" className="hover:underline">Guidelines</a>
          <span>|</span>
          <a href="#" className="hover:underline">FAQ</a>
          <span>|</span>
          <a href="#" className="hover:underline">Lists</a>
          <span>|</span>
          <a href="#" className="hover:underline">API</a>
          <span>|</span>
          <a href="#" className="hover:underline">Security</a>
          <span>|</span>
          <a href="#" className="hover:underline">Legal</a>
          <span>|</span>
          <a href="#" className="hover:underline">Apply to YC</a>
          <span>|</span>
          <a href="#" className="hover:underline">Contact</a>
        </nav>
        <div className="flex justify-center mt-3">
          <div className="relative max-w-xs w-full">
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full px-3 py-1 bg-white border border-gray-300 text-sm focus:outline-none focus:border-[#ff6600]"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
