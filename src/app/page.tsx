"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ImageUpload from "@/components/ImageUpload";
import { RotateCw, Edit, X, Save } from "lucide-react";

interface Entry {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  image_url_2?: string;
  timestamp: number;
  image_rotation?: number;
}

export default function Home() {
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [entryImage, setEntryImage] = useState<string>("");
  const [entryImage2, setEntryImage2] = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState<string>("");
  const [editImage2, setEditImage2] = useState<string>("");

  // Load entries from API on component mount
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        console.log("Fetching entries...");
        const response = await fetch("/api/entries");
        console.log("Response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Entries loaded:", data);
          setEntries(data);
        } else {
          console.error("Failed to fetch entries:", response.status);
        }
      } catch (error) {
        console.error("Error loading entries:", error);
      }
    };

    fetchEntries();
    setMounted(true);
  }, []);

  const handleAddEntry = async () => {
    if (entryContent.trim() && entryTitle.trim()) {
      try {
        const response = await fetch("/api/entries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: entryTitle.trim(),
            content: entryContent.trim(),
            image_url: entryImage || null,
            image_url_2: entryImage2 || null,
          }),
        });

        if (response.ok) {
          const newEntry = await response.json();
          setEntries([newEntry, ...entries]);
          setEntryTitle("");
          setEntryContent("");
          setEntryImage("");
          setEntryImage2("");
        } else {
          console.error("Failed to save entry");
        }
      } catch (error) {
        console.error("Error saving entry:", error);
      }
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry || !editContent.trim() || !editTitle.trim()) return;

    try {
      const response = await fetch("/api/entries", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingEntry.id,
          title: editTitle.trim(),
          content: editContent.trim(),
          image_url: editImage || null,
          image_url_2: editImage2 || null,
        }),
      });

      if (response.ok) {
        const updatedEntry = await response.json();
        setEntries(
          entries.map((entry) =>
            entry.id === editingEntry.id ? updatedEntry : entry
          )
        );
        handleCancelEdit();
      } else {
        console.error("Failed to update entry");
      }
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const response = await fetch(`/api/entries?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const newEntries = entries.filter((entry) => entry.id !== id);
        setEntries(newEntries);
      } else {
        console.error("Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditImage(entry.image_url || "");
    setEditImage2(entry.image_url_2 || "");
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditTitle("");
    setEditContent("");
    setEditImage("");
    setEditImage2("");
  };

  const handleImageUpload = (imageUrl: string, imageIndex?: number) => {
    if (editingEntry) {
      if (imageIndex === 1) {
        setEditImage2(imageUrl);
      } else {
        setEditImage(imageUrl);
      }
    } else {
      if (imageIndex === 1) {
        setEntryImage2(imageUrl);
      } else {
        setEntryImage(imageUrl);
      }
    }
  };

  const handleRemoveImage = (imageIndex?: number) => {
    if (editingEntry) {
      if (imageIndex === 1) {
        setEditImage2("");
      } else {
        setEditImage("");
      }
    } else {
      if (imageIndex === 1) {
        setEntryImage2("");
      } else {
        setEntryImage("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      if (editingEntry) {
        handleUpdateEntry();
      } else {
        handleAddEntry();
      }
    }
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

  const handleRotateImage = async (id: string) => {
    const entryToRotate = entries.find((entry) => entry.id === id);
    if (entryToRotate && entryToRotate.image_url) {
      try {
        const response = await fetch(`/api/entries/rotate-image?id=${id}`, {
          method: "POST",
        });

        if (response.ok) {
          const updatedEntry = await response.json();
          setEntries(
            entries.map((entry) => (entry.id === id ? updatedEntry : entry))
          );
          alert("Image rotated successfully!");
        } else {
          console.error("Failed to rotate image");
          alert("Failed to rotate image. Please try again.");
        }
      } catch (error) {
        console.error("Error rotating image:", error);
        alert("Failed to rotate image. Please try again.");
      }
    }
  };

  const renderImage = (
    imageUrl: string,
    entryId: string,
    isSecondImage = false
  ) => (
    <div className="mb-3 sm:mb-4 flex justify-center">
      <div className="relative inline-block rounded-lg overflow-hidden border-2 border-[#a39170]/30 shadow-lg group max-w-full sm:max-w-lg md:max-w-xl">
        <div
          className="transition-all duration-500 ease-in-out"
          style={{
            transform: isSecondImage ? "none" : "none", // You can add rotation logic for second image if needed
            maxWidth: "100%",
            maxHeight: "400px",
          }}
        >
          <img
            src={imageUrl}
            alt={`Story image ${isSecondImage ? "2" : "1"}`}
            className="w-full h-full object-contain transition-all duration-500"
            loading="lazy"
            style={{ background: "transparent" }}
          />
        </div>
        {isAuthor && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => handleRotateImage(entryId)}
              className="bg-[#948363]/80 hover:bg-[#948363] text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300"
              title="Rotate image"
            >
              <RotateCw className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dfdac4] via-[#c9c1a7] to-[#b0a384] relative">
      {/* Modern Background Design */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Geometric Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              linear-gradient(90deg, #2d1f0f 1px, transparent 1px),
              linear-gradient(0deg, #2d1f0f 1px, transparent 1px)
            `,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Floating Geometric Shapes - Hidden on mobile for performance */}
        <div className="absolute top-20 left-10 w-16 h-16 md:w-32 md:h-32 border-2 border-[#2d1f0f]/10 rounded-full opacity-30 float-animation hidden sm:block"></div>
        <div className="absolute top-40 right-20 w-12 h-12 md:w-24 md:h-24 bg-[#2d1f0f]/5 rounded-full opacity-40 drift-animation hidden sm:block"></div>
        <div
          className="absolute bottom-40 left-20 w-10 h-10 md:w-20 md:h-20 border-2 border-[#2d1f0f]/15 transform rotate-45 opacity-30 float-animation hidden sm:block"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-8 h-8 md:w-16 md:h-16 bg-[#2d1f0f]/8 rounded-full opacity-50 drift-animation hidden sm:block"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Modern Gradient Orbs - Responsive sizing */}
        <div
          className="absolute top-1/4 left-1/4 w-24 h-24 md:w-48 md:h-48 bg-gradient-to-br from-[#2d1f0f]/5 to-transparent rounded-full blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-gradient-to-tl from-[#2d1f0f]/3 to-transparent rounded-full blur-2xl opacity-15 animate-pulse"
          style={{ animationDelay: "0.8s" }}
        ></div>

        {/* Subtle Lines - Responsive positioning */}
        <div className="absolute top-1/3 left-0 w-16 md:w-32 h-px bg-gradient-to-r from-transparent via-[#2d1f0f]/20 to-transparent"></div>
        <div className="absolute bottom-1/3 right-0 w-16 md:w-32 h-px bg-gradient-to-l from-transparent via-[#2d1f0f]/20 to-transparent"></div>

        {/* Corner Accents - Responsive sizing */}
        <div className="absolute top-0 left-0 w-8 h-8 md:w-16 md:h-16 border-l-2 border-t-2 border-[#2d1f0f]/20"></div>
        <div className="absolute top-0 right-0 w-8 h-8 md:w-16 md:h-16 border-r-2 border-t-2 border-[#2d1f0f]/20"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 md:w-16 md:h-16 border-l-2 border-b-2 border-[#2d1f0f]/20"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 md:w-16 md:h-16 border-r-2 border-b-2 border-[#2d1f0f]/20"></div>

        {/* Modern Dots Pattern - Responsive sizing */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-96 md:h-96 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, #2d1f0f 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        {/* Floating Particles - Hidden on mobile */}
        <div
          className="absolute top-1/4 right-1/3 w-2 h-2 bg-[#2d1f0f]/30 rounded-full animate-ping hidden sm:block"
          style={{ animationDelay: "0.3s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-[#2d1f0f]/40 rounded-full animate-ping hidden sm:block"
          style={{ animationDelay: "1.2s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/4 w-1.5 h-1.5 bg-[#2d1f0f]/25 rounded-full animate-ping hidden sm:block"
          style={{ animationDelay: "0.7s" }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Header Section */}
        <header
          className={`text-center mb-8 sm:mb-16 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-block mb-6 sm:mb-8">
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-[#948363] to-[#a39170] mx-auto mb-3 sm:mb-4"></div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-[#2d1f0f] tracking-tight leading-tight">
              MEMOIR
            </h1>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-[#a39170] to-[#948363] mx-auto mt-3 sm:mt-4"></div>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-[#2d1f0f] max-w-3xl mx-auto font-light leading-relaxed px-4">
            A collection of moments, thoughts, and stories.
            <br />
            <span className="font-medium text-[#2d1f0f]">
              Your digital legacy begins here.
            </span>
          </p>

          {/* Author Status */}
          <div className="mt-6 sm:mt-8 flex justify-center gap-3 sm:gap-4">
            {isAuthor ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-[#2d1f0f] font-medium">
                  ✍️ Author Mode
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-[#948363] text-[#948363] hover:bg-[#948363] hover:text-white transition-all duration-300 text-xs sm:text-sm"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-[#2d1f0f] font-medium">
                  👁️ Read Only
                </span>
                <Button
                  onClick={() => setShowLogin(true)}
                  variant="outline"
                  size="sm"
                  className="border-[#948363] text-[#948363] hover:bg-[#948363] hover:text-white transition-all duration-300 text-xs sm:text-sm"
                >
                  Author Login
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Grid - Responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 xl:gap-12 max-w-8xl mx-auto">
          {/* Writing Section - Only visible to author */}
          {isAuthor && (
            <div
              className={`transition-all duration-1000 delay-200 order-2 xl:order-1 ${
                mounted
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl border-l-4 border-l-[#a39170]">
                <CardHeader className="pb-4 sm:pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-[#a39170] rounded-full"></div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-[#2d1f0f]">
                      {editingEntry ? "Edit Story" : "New Entry"}
                    </CardTitle>
                    {editingEntry && (
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        size="sm"
                        className="ml-auto border-[#948363] text-[#948363] hover:bg-[#948363] hover:text-white transition-all duration-300"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="text-sm font-medium text-[#2d1f0f] mb-2 block">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingEntry ? editTitle : entryTitle}
                      onChange={(e) =>
                        editingEntry
                          ? setEditTitle(e.target.value)
                          : setEntryTitle(e.target.value)
                      }
                      placeholder="Give your story a title..."
                      className="w-full p-3 border-2 border-[#c9c1a7] focus:border-[#a39170] bg-transparent text-[#2d1f0f] placeholder-[#2d1f0f]/50 rounded-md text-base sm:text-lg transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#2d1f0f] mb-2 block">
                      Story
                    </label>
                    <Textarea
                      value={editingEntry ? editContent : entryContent}
                      onChange={(e) =>
                        editingEntry
                          ? setEditContent(e.target.value)
                          : setEntryContent(e.target.value)
                      }
                      onKeyDown={handleKeyPress}
                      placeholder="Begin your story... (⌘+Enter to save)"
                      className="min-h-[150px] sm:min-h-[200px] border-2 border-[#c9c1a7] focus:border-[#a39170] bg-transparent text-[#2d1f0f] placeholder-[#2d1f0f]/50 resize-none text-base sm:text-lg leading-relaxed transition-all duration-300"
                    />
                  </div>

                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    currentImage={editingEntry ? editImage : entryImage}
                    currentImage2={editingEntry ? editImage2 : entryImage2}
                    onRemoveImage={handleRemoveImage}
                    allowMultiple={true}
                  />

                  <div className="flex gap-3">
                    <Button
                      onClick={
                        editingEntry ? handleUpdateEntry : handleAddEntry
                      }
                      disabled={!entryContent.trim() || !entryTitle.trim()}
                      className="flex-1 h-12 sm:h-14 bg-[#948363] hover:bg-[#a39170] text-white font-semibold text-base sm:text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <span className="flex items-center gap-2">
                        {editingEntry ? (
                          <>
                            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                            Update Story
                          </>
                        ) : (
                          <>
                            <span className="text-lg sm:text-xl">✍️</span>
                            Save Entry
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Entries Display */}
          <div
            className={`transition-all duration-1000 delay-400 order-1 xl:order-2 ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            } ${!isAuthor ? "xl:col-span-2" : ""}`}
          >
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2d1f0f] mb-2">
                {isAuthor ? "Your Stories" : "Miguel's Stories"}
              </h2>
              <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-[#a39170] to-[#948363]"></div>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-12 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-[#948363] to-[#a39170] rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl sm:text-3xl">📖</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#2d1f0f] mb-2">
                  {isAuthor ? "No entries yet" : "No stories shared yet"}
                </h3>
                <p className="text-[#2d1f0f] text-sm sm:text-base">
                  {isAuthor
                    ? "Start writing to see your stories here"
                    : "Check back later for new stories"}
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 pr-2">
                {entries.map((entry, i) => (
                  <Card
                    key={entry.id}
                    className="bg-white/90 backdrop-blur-sm border-l-4 border-l-[#a39170] hover:border-l-[#948363] transition-all duration-300 hover:shadow-lg group shadow-md"
                    style={{
                      animationDelay: `${i * 150}ms`,
                      animation: "slideInRight 0.6s ease-out forwards",
                    }}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-2 h-2 bg-[#a39170] rounded-full mt-2 sm:mt-3 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="mb-3 sm:mb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-bold text-[#2d1f0f] mb-1 sm:mb-2">
                                  {entry.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-[#2d1f0f]/70">
                                  {formatDate(entry.timestamp)}
                                </p>
                              </div>
                              {isAuthor && (
                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    onClick={() => handleEditEntry(entry)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#2d1f0f] hover:text-[#a39170] p-1"
                                    title="Edit story"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#2d1f0f] hover:text-red-500 p-1"
                                    title="Delete story"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* First Image */}
                          {entry.image_url &&
                            renderImage(entry.image_url, entry.id, false)}

                          {/* Second Image */}
                          {entry.image_url_2 &&
                            renderImage(entry.image_url_2, entry.id, true)}

                          <p className="text-[#2d1f0f] leading-relaxed whitespace-pre-line text-base sm:text-lg">
                            {entry.content}
                          </p>
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
          className={`text-center mt-12 sm:mt-20 transition-all duration-1000 delay-600 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="w-20 sm:w-32 h-1 bg-gradient-to-r from-[#948363] to-[#a39170] mx-auto mb-3 sm:mb-4"></div>
          <p className="text-[#2d1f0f] font-medium text-sm sm:text-base px-4">
            Every story matters. Every moment counts.
          </p>
        </footer>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-l-4 border-l-[#a39170]">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-bold text-[#2d1f0f]">
                Author Login
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#2d1f0f] mb-2 block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full p-3 border-2 border-[#c9c1a7] focus:border-[#a39170] bg-transparent text-[#2d1f0f] rounded-md transition-all duration-300 text-base"
                  placeholder="Enter password"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleLogin}
                  className="flex-1 bg-[#948363] hover:bg-[#a39170] text-white transition-all duration-300 text-sm sm:text-base"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setShowLogin(false);
                    setPassword("");
                  }}
                  variant="outline"
                  className="flex-1 border-[#948363] text-[#948363] hover:bg-[#948363] hover:text-white transition-all duration-300 text-sm sm:text-base"
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

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes drift {
          0% {
            transform: translateX(0px) translateY(0px);
          }
          33% {
            transform: translateX(5px) translateY(-5px);
          }
          66% {
            transform: translateX(-3px) translateY(3px);
          }
          100% {
            transform: translateX(0px) translateY(0px);
          }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        .drift-animation {
          animation: drift 8s ease-in-out infinite;
        }

        /* Mobile-specific optimizations */
        @media (max-width: 640px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
