"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface Entry {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export default function Home() {
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("memoir-entries");
    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries);

        // Handle migration from old string format to new Entry format
        const migratedEntries = parsedEntries.map(
          (entry: string | Partial<Entry>, index: number) => {
            if (typeof entry === "string") {
              // Old format - convert to new Entry format
              return {
                id: `migrated-${Date.now()}-${index}`,
                title: `Entry ${parsedEntries.length - index}`,
                content: entry,
                timestamp:
                  Date.now() - (parsedEntries.length - index) * 86400000, // Approximate dates
              };
            }
            // New format - ensure it has all required fields
            return {
              id: entry.id || `entry-${Date.now()}-${index}`,
              title: entry.title || "Untitled",
              content: entry.content || String(entry),
              timestamp: entry.timestamp || Date.now(),
            };
          }
        );

        setEntries(migratedEntries);
      } catch (error) {
        console.error("Error loading entries from localStorage:", error);
      }
    }
    setMounted(true);
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("memoir-entries", JSON.stringify(entries));
    }
  }, [entries, mounted]);

  const handleAddEntry = () => {
    if (entryContent.trim() && entryTitle.trim()) {
      const newEntry: Entry = {
        id: Date.now().toString(),
        title: entryTitle.trim(),
        content: entryContent.trim(),
        timestamp: Date.now(),
      };
      setEntries([newEntry, ...entries]);
      setEntryTitle("");
      setEntryContent("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleAddEntry();
    }
  };

  const handleDeleteEntry = (id: string) => {
    const newEntries = entries.filter((entry) => entry.id !== id);
    setEntries(newEntries);
  };

  const handleLogin = () => {
    // Simple password check - you can change this password
    if (password === "miguel2024") {
      setIsAuthor(true);
      setShowLogin(false);
      setPassword("");
    } else {
      alert("Incorrect password");
    }
  };

  const handleLogout = () => {
    setIsAuthor(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#ead8c2] dark:bg-[#543f3f] relative">
      {/* Geometric Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#765555]"></div>
        <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#765555]"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#765555]"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#765555]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[#765555] rotate-45"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Header Section */}
        <header
          className={`text-center mb-16 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-block mb-8">
            <div className="w-24 h-1 bg-gradient-to-r from-[#765555] to-[#ae866c] mx-auto mb-4"></div>
            <h1 className="text-6xl md:text-8xl font-black text-[#543f3f] dark:text-[#ead8c2] tracking-tight">
              MEMOIR
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#ae866c] to-[#765555] mx-auto mt-4"></div>
          </div>
          <p className="text-xl md:text-2xl text-[#765555] dark:text-[#ae866c] max-w-3xl mx-auto font-light leading-relaxed">
            A collection of moments, thoughts, and stories.
            <br />
            <span className="font-medium">
              Your digital legacy begins here.
            </span>
          </p>

          {/* Author Status */}
          <div className="mt-8 flex justify-center gap-4">
            {isAuthor ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#765555] dark:text-[#ae866c]">
                  ✍️ Author Mode
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-[#765555] text-[#765555] hover:bg-[#765555] hover:text-white dark:border-[#ae866c] dark:text-[#ae866c] dark:hover:bg-[#ae866c] dark:hover:text-[#543f3f]"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#765555] dark:text-[#ae866c]">
                  👁️ Read Only
                </span>
                <Button
                  onClick={() => setShowLogin(true)}
                  variant="outline"
                  size="sm"
                  className="border-[#765555] text-[#765555] hover:bg-[#765555] hover:text-white dark:border-[#ae866c] dark:text-[#ae866c] dark:hover:bg-[#ae866c] dark:hover:text-[#543f3f]"
                >
                  Author Login
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Writing Section - Only visible to author */}
          {isAuthor && (
            <div
              className={`transition-all duration-1000 delay-200 ${
                mounted
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <Card className="bg-white/90 dark:bg-[#765555]/90 backdrop-blur-sm border-0 shadow-2xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#ae866c] rounded-full"></div>
                    <CardTitle className="text-2xl font-bold text-[#543f3f] dark:text-[#ead8c2]">
                      New Entry
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-[#765555] dark:text-[#ae866c] mb-2 block">
                      Title
                    </label>
                    <input
                      type="text"
                      value={entryTitle}
                      onChange={(e) => setEntryTitle(e.target.value)}
                      placeholder="Give your story a title..."
                      className="w-full p-3 border-2 border-[#e3ddc5] focus:border-[#ae866c] dark:border-[#765555] dark:focus:border-[#ead8c2] bg-transparent text-[#543f3f] dark:text-[#ead8c2] placeholder-[#765555]/50 dark:placeholder-[#ae866c]/50 rounded-md text-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#765555] dark:text-[#ae866c] mb-2 block">
                      Story
                    </label>
                    <Textarea
                      value={entryContent}
                      onChange={(e) => setEntryContent(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Begin your story... (⌘+Enter to save)"
                      className="min-h-[200px] border-2 border-[#e3ddc5] focus:border-[#ae866c] dark:border-[#765555] dark:focus:border-[#ead8c2] bg-transparent text-[#543f3f] dark:text-[#ead8c2] placeholder-[#765555]/50 dark:placeholder-[#ae866c]/50 resize-none text-lg leading-relaxed"
                    />
                  </div>
                  <Button
                    onClick={handleAddEntry}
                    disabled={!entryContent.trim() || !entryTitle.trim()}
                    className="w-full h-14 bg-[#765555] hover:bg-[#543f3f] dark:bg-[#ae866c] dark:hover:bg-[#765555] text-white font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">✍️</span>
                      Save Entry
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Entries Display */}
          <div
            className={`transition-all duration-1000 delay-400 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            } ${!isAuthor ? "lg:col-span-2" : ""}`}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#543f3f] dark:text-[#ead8c2] mb-2">
                {isAuthor ? "Your Stories" : "Miguel's Stories"}
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-[#ae866c] to-[#765555]"></div>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#765555] to-[#ae866c] rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl">📖</span>
                </div>
                <h3 className="text-xl font-semibold text-[#765555] dark:text-[#ae866c] mb-2">
                  {isAuthor ? "No entries yet" : "No stories shared yet"}
                </h3>
                <p className="text-[#765555]/70 dark:text-[#ae866c]/70">
                  {isAuthor
                    ? "Start writing to see your stories here"
                    : "Check back later for new stories"}
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {entries.map((entry, i) => (
                  <Card
                    key={entry.id}
                    className="bg-white/80 dark:bg-[#765555]/80 backdrop-blur-sm border-l-4 border-l-[#ae866c] hover:border-l-[#765555] transition-all duration-300 hover:shadow-lg group"
                    style={{
                      animationDelay: `${i * 150}ms`,
                      animation: "slideInRight 0.6s ease-out forwards",
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-2 h-2 bg-[#ae866c] rounded-full mt-3 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-[#543f3f] dark:text-[#ead8c2] mb-2">
                              {entry.title}
                            </h3>
                            <p className="text-sm text-[#765555]/60 dark:text-[#ae866c]/60">
                              {formatDate(entry.timestamp)}
                            </p>
                          </div>
                          <p className="text-[#543f3f] dark:text-[#ead8c2] leading-relaxed whitespace-pre-line text-lg">
                            {entry.content}
                          </p>
                          {isAuthor && (
                            <div className="mt-4 pt-4 border-t border-[#e3ddc5]/50 dark:border-[#765555]/50">
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#765555] hover:text-[#543f3f] dark:text-[#ae866c] dark:hover:text-[#ead8c2] text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer
          className={`text-center mt-20 transition-all duration-1000 delay-600 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="w-32 h-1 bg-gradient-to-r from-[#765555] to-[#ae866c] mx-auto mb-4"></div>
          <p className="text-[#765555] dark:text-[#ae866c] font-light">
            Every story matters. Every moment counts.
          </p>
        </footer>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#543f3f] dark:text-[#ead8c2]">
                Author Login
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#765555] dark:text-[#ae866c] mb-2 block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full p-3 border-2 border-[#e3ddc5] focus:border-[#ae866c] dark:border-[#765555] dark:focus:border-[#ead8c2] bg-transparent text-[#543f3f] dark:text-[#ead8c2] rounded-md"
                  placeholder="Enter password"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleLogin}
                  className="flex-1 bg-[#765555] hover:bg-[#543f3f] dark:bg-[#ae866c] dark:hover:bg-[#765555] text-white"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setShowLogin(false);
                    setPassword("");
                  }}
                  variant="outline"
                  className="flex-1 border-[#765555] text-[#765555] hover:bg-[#765555] hover:text-white dark:border-[#ae866c] dark:text-[#ae866c] dark:hover:bg-[#ae866c] dark:hover:text-[#543f3f]"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
