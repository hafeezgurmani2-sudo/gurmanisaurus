import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, ListMusic, Search, Shuffle, Repeat, Heart, Volume2, VolumeX, Music2, Moon, Sun, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

// ---- Mock Catalog (replace urls with your own tracks/cover art) ----
const CATALOG = [
  {
    id: "t1",
    title: "Midnight Drive",
    artist: "Nova",
    genre: "Synthwave",
    mood: "Chill",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop",
    // Royalty-free sample
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Scott_Holmes_Music/Happy_Music/Scott_Holmes_Music_-_03_-_Driven_To_Success.mp3",
    duration: 204,
  },
  {
    id: "t2",
    title: "City Lights",
    artist: "Echo Kid",
    genre: "Indie",
    mood: "Upbeat",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Komiku/It_Is_the_End_of_the_World/Komiku_-_01_-_Run.mp3",
    duration: 187,
  },
  {
    id: "t3",
    title: "Lo-Fi Breeze",
    artist: "Softstatic",
    genre: "Lo-Fi",
    mood: "Study",
    cover: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kai_Engel/Irsens_Tale/Kai_Engel_-_03_-_Snowmen.mp3",
    duration: 225,
  },
  {
    id: "t4",
    title: "Desert Sun",
    artist: "Ayla",
    genre: "World",
    mood: "Warm",
    cover: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=1200&auto=format&fit=crop",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/BoxCat_Games/Namaste/BoxCat_Games_-_10_-_Epic_Song.mp3",
    duration: 212,
  },
  {
    id: "t5",
    title: "Night Owl",
    artist: "Keenan",
    genre: "Hip-Hop",
    mood: "Focus",
    cover: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1200&auto=format&fit=crop",
    src: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Lobo_Loco/Adventure/LOBO_LOCO_-_01_-_Adventure_Begins_ID_1126.mp3",
    duration: 196,
  },
];

const GENRES = ["All", ...Array.from(new Set(CATALOG.map((t) => t.genre)))];
const MOODS = ["All", ...Array.from(new Set(CATALOG.map((t) => t.mood)))];

// ---- Utility ----
function formatTime(secs) {
  if (Number.isNaN(secs) || secs == null) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// ---- Main App ----
export default function MusicSite() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [mood, setMood] = useState("All");
  const [dark, setDark] = useState(true);

  const [queue, setQueue] = useState(CATALOG.map((t) => t.id));
  const [currentId, setCurrentId] = useState(queue[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [progress, setProgress] = useState(0);
  const [vol, setVol] = useState(0.9);

  const audioRef = useRef(null);
  const progressRef = useRef(null);

  const currentTrack = useMemo(
    () => CATALOG.find((t) => t.id === currentId) || CATALOG[0],
    [currentId]
  );

  const filtered = useMemo(() => {
    return CATALOG.filter((t) => {
      const q = query.trim().toLowerCase();
      const matchQ = q
        ? `${t.title} ${t.artist} ${t.genre} ${t.mood}`.toLowerCase().includes(q)
        : true;
      const matchG = genre === "All" ? true : t.genre === genre;
      const matchM = mood === "All" ? true : t.mood === mood;
      return matchQ && matchG && matchM;
    });
  }, [query, genre, mood]);

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.play();
  };
  const pause = () => audioRef.current?.pause();

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      play();
    } else {
      pause();
    }
  };

  const next = () => {
    setProgress(0);
    setIsPlaying(false);
    setTimeout(() => {
      setIsPlaying(true);
    }, 0);

    setCurrentId((prev) => {
      const ids = [...queue];
      const idx = ids.indexOf(prev);
      if (shuffle) {
        const others = ids.filter((id) => id !== prev);
        return others[Math.floor(Math.random() * others.length)] || ids[0];
      }
      const nextIdx = idx === ids.length - 1 ? 0 : idx + 1;
      return ids[nextIdx];
    });
  };

  const prev = () => {
    setCurrentId((prevId) => {
      const ids = [...queue];
      const idx = ids.indexOf(prevId);
      const prevIdx = idx <= 0 ? ids.length - 1 : idx - 1;
      return ids[prevIdx];
    });
  };

  // Handle audio events
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = vol;
    const onTime = () => setProgress(el.currentTime || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (repeat) {
        el.currentTime = 0;
        el.play();
      } else {
        next();
      }
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, [repeat, vol, queue, shuffle]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const setSeek = (value) => {
    const t = Array.isArray(value) ? value[0] : value;
    if (!audioRef.current) return;
    audioRef.current.currentTime = t;
    setProgress(t);
  };

  const addToQueue = (id) => {
    setQueue((q) => (q.includes(id) ? q : [...q, id]));
  };

  const removeFromQueue = (id) => {
    setQueue((q) => q.filter((x) => x !== id));
  };

  const clearQueue = () => setQueue([currentId]);

  const isInQueue = (id) => queue.includes(id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black text-zinc-900 dark:text-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-zinc-200 dark:bg-zinc-800 grid place-items-center shadow-sm">
              <Music2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">GrooveSphere</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 pr-2 border-r border-zinc-200 dark:border-zinc-800">
              <Search className="h-4 w-4 opacity-60" />
              <Input
                placeholder="Search songs, artists, moods..."
                className="w-72"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={() => setDark((d) => !d)}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Search className="h-4 w-4 opacity-60 md:hidden" />
            <Input
              placeholder="Search..."
              className="flex-1 md:hidden"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {GENRES.map((g) => (
              <Button
                key={g}
                variant={g === genre ? "default" : "outline"}
                className="rounded-2xl whitespace-nowrap"
                onClick={() => setGenre(g)}
              >
                {g}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {MOODS.map((m) => (
              <Button
                key={m}
                variant={m === mood ? "default" : "outline"}
                className="rounded-2xl whitespace-nowrap"
                onClick={() => setMood(m)}
              >
                {m}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured + List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured card */}
          <Card className="rounded-3xl overflow-hidden lg:col-span-2">
            <div className="grid md:grid-cols-2">
              <div className="relative">
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-70">
                    <span>{currentTrack.genre}</span>
                    <ChevronRight className="h-3 w-3" />
                    <span>{currentTrack.mood}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-2">{currentTrack.title}</h2>
                  <p className="opacity-80">by {currentTrack.artist}</p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button size="lg" className="rounded-2xl" onClick={togglePlay}>
                    {isPlaying ? (
                      <Pause className="h-5 w-5 mr-1" />
                    ) : (
                      <Play className="h-5 w-5 mr-1" />
                    )}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button variant="outline" className="rounded-2xl" onClick={prev}>
                    <SkipBack className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" className="rounded-2xl" onClick={next}>
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                {/* Progress */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs opacity-70 mb-1">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(currentTrack.duration)}</span>
                  </div>
                  <Slider
                    ref={progressRef}
                    value={[Math.min(progress, currentTrack.duration)]}
                    max={currentTrack.duration}
                    step={1}
                    onValueChange={(v) => setSeek(v)}
                  />
                </div>

                {/* Audio element */}
                <audio
                  ref={audioRef}
                  src={currentTrack.src}
                  preload="metadata"
                  autoPlay={isPlaying}
                />
              </div>
            </div>
          </Card>

          {/* Queue / Controls */}
          <Card className="rounded-3xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Queue</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant={shuffle ? "default" : "outline"} className="rounded-2xl" onClick={() => setShuffle((s) => !s)}>
                    <Shuffle className="h-4 w-4 mr-1" />Shuffle
                  </Button>
                  <Button variant={repeat ? "default" : "outline"} className="rounded-2xl" onClick={() => setRepeat((r) => !r)}>
                    <Repeat className="h-4 w-4 mr-1" />Repeat
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-auto pr-2">
                <AnimatePresence>
                  {queue.map((id) => {
                    const t = CATALOG.find((x) => x.id === id)!;
                    const active = id === currentId;
                    return (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`flex items-center gap-3 p-2 rounded-2xl mb-2 cursor-pointer ${
                          active
                            ? "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                        }`}
                        onClick={() => setCurrentId(id)}
                      >
                        <img src={t.cover} alt={t.title} className="h-10 w-10 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{t.title}</div>
                          <div className="truncate text-sm opacity-70">{t.artist}</div>
                        </div>
                        <div className="text-sm opacity-70 mr-2">{formatTime(t.duration)}</div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-2xl" onClick={clearQueue}>
                    Clear
                  </Button>
                </div>
                <div className="flex items-center gap-2 w-40">
                  {vol === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <Slider value={[vol]} max={1} step={0.01} onValueChange={(v) => setVol(Array.isArray(v) ? v[0] : v)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Library */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <ListMusic className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Browse Library</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((t) => {
              const active = t.id === currentId;
              return (
                <Card key={t.id} className={`rounded-3xl overflow-hidden group ${active ? "border-2 border-zinc-300 dark:border-zinc-700" : ""}`}>
                  <div className="relative">
                    <img src={t.cover} alt={t.title} className="h-44 w-full object-cover" />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/30 grid place-items-center"
                    >
                      <Button
                        size="icon"
                        className="rounded-2xl h-12 w-12"
                        onClick={() => {
                          if (currentId !== t.id) setCurrentId(t.id);
                          setIsPlaying(true);
                          setTimeout(() => play(), 0);
                        }}
                      >
                        {active && isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>
                    </motion.div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{t.title}</div>
                        <div className="text-sm opacity-70 truncate">{t.artist}</div>
                        <div className="text-xs opacity-60 mt-1">{t.genre} • {t.mood}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant={isInQueue(t.id) ? "default" : "outline"}
                          className="rounded-xl"
                          onClick={() => (isInQueue(t.id) ? removeFromQueue(t.id) : addToQueue(t.id))}
                          title={isInQueue(t.id) ? "Remove from queue" : "Add to queue"}
                        >
                          {isInQueue(t.id) ? <X className="h-4 w-4" /> : "+"}
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-xl" title="Like">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer Player (mobile friendly) */}
        <div className="fixed left-0 right-0 bottom-0 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-zinc-950/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <img src={currentTrack.cover} alt={currentTrack.title} className="h-10 w-10 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{currentTrack.title}</div>
                <div className="truncate text-xs opacity-70">{currentTrack.artist}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="rounded-xl" onClick={prev}>
                  <SkipBack className="h-5 w-5" />
                </Button>
                <Button size="icon" className="rounded-xl" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button size="icon" variant="ghost" className="rounded-xl" onClick={next}>
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="mt-2">
              <Slider value={[Math.min(progress, currentTrack.duration)]} max={currentTrack.duration} step={1} onValueChange={(v) => setSeek(v)} />
            </div>
          </div>
        </div>
      </div>

      {/* Page padding for bottom player */}
      <div className="h-24" />
    </div>
  );
}

// --- Notes ---
// 1) Replace CATALOG entries with your own tracks and cover art. Remote MP3 links work.
// 2) This is a front-end only demo. For uploads, auth, or playlists per user, add a backend (Supabase, Firebase, or your own API).
// 3) Uses Tailwind utility classes, shadcn/ui components, lucide icons, and framer-motion for small animations.
