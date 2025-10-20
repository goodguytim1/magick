import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useMemo } from "react";
import {
  Animated,
  FlatList,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RecommendedNearby from "../../components/RecommendedNearby";
import { MISSIONS, QUESTIONS } from "../../content";
import { getLocation } from "../../lib/location";
import { recommendNearby, setMonetizationMode } from "../../lib/recommendations";

/** ==== THEME ==== */
const DARK = {
  name: "dark",
  bg: "#0c0a12",
  card: "#171427",
  text: "#f5f5f7",
  sub: "#c9c7d1",
  line: "#2a2740",
  accent: "#8b5cf6",
  accentDim: "#6d28d9",
  pill: "#2a2440",
};
const LIGHT = {
  name: "light",
  bg: "#f7f5ff",
  card: "#ffffff",
  text: "#1a1530",
  sub: "#4b4764",
  line: "#e6e2f3",
  accent: "#7c3aed",
  accentDim: "#a78bfa",
  pill: "#efeafd",
};

const TILE_COLORS = {
  "Spark Questions": "#f59e0b",
  "Mirror Moments": "#7c3aed",
  "Playful Sparks": "#ea580c",
  "Bond Builders": "#ef4444",
  "Adventure Sparks": "#3b82f6",
  "Creative Charms": "#0ea5e9",
  "Mirror Quests": "#8b5cf6",
  "Bond Quests": "#dc2626",
  "Date Ideas": "#a855f7",
  "The Connection Deck": "#b45309",
  "Date Night Deck": "#d97706",
  "The Challenge Deck": "#334155",
};

const Q_CATS = Object.keys(QUESTIONS);
const M_CATS = Object.keys(MISSIONS);

/** Helpers */
const allQuestions = () =>
  Q_CATS.flatMap((c) => QUESTIONS[c].map((t) => ({ type: "Question", category: c, text: t })));
const allMissions = () =>
  M_CATS.flatMap((c) => MISSIONS[c].map((t) => ({ type: "Mission", category: c, text: t })));
const ALL = () => [...allQuestions(), ...allMissions()];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const keyOf = (item) => `${item.type}:${item.category}:${item.text}`;

function seededDailyItem(date = new Date()) {
  const pool = ALL();
  const ds = date.toISOString().slice(0, 10); // YYYY-MM-DD
  let h = 0;
  for (let i = 0; i < ds.length; i++) h = (h * 31 + ds.charCodeAt(i)) >>> 0;
  const idx = h % pool.length;
  return pool[idx];
}

/** Favorites persistence */
async function loadFavs() {
  try {
    const raw = await AsyncStorage.getItem("magick.favs");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
async function saveFavs(favs) {
  try {
    await AsyncStorage.setItem("magick.favs", JSON.stringify(favs));
  } catch {}
}
async function loadTheme() {
  const raw = await AsyncStorage.getItem("magick.theme");
  return raw === "light" ? LIGHT : DARK;
}
async function saveTheme(t) {
  await AsyncStorage.setItem("magick.theme", t.name);
}
async function loadMonetizationMode() {
  const raw = await AsyncStorage.getItem("magick.monetizationMode");
  return raw === "sponsor" ? "sponsor" : "affiliate";
}
async function saveMonetizationMode(mode) {
  await AsyncStorage.setItem("magick.monetizationMode", mode);
}

/** UI */
export default function App() {
  // ========= State =========
  const [theme, setTheme] = React.useState(DARK);
  const [screen, setScreen] = React.useState("home"); // home | draw | favorites | daily | dateCats
  const [current, setCurrent] = React.useState(null); // {type, category, text}
  const [mode, setMode] = React.useState("category"); // category | all | dateIdeas
  const [favs, setFavs] = React.useState([]);
  const [geo, setGeo] = React.useState({ city: null, region: null, coord: null });
  const [recommendations, setRecommendations] = React.useState([]);
  const [monetizationMode, setMonetizationModeState] = React.useState("affiliate");

  // ========= Refs & derived =========
  const flip = React.useRef(new Animated.Value(0)).current;
  const [flipSide, setFlipSide] = React.useState(0);
  const flipInterpolate = flip.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });

  // Date Ideas deck (sub-categories)
  const DATE_IDEAS = useMemo(() => ({
    "Enchanted Nights ✨": [
      ...MISSIONS["Bond Quests"],
      ...MISSIONS["Creative Charms"],
    ].map((t) => ({ type: "Mission", category: "Date Ideas", text: t })),
    "Starlit Adventures 🌌": MISSIONS["Adventure Sparks"].map((t) => ({
      type: "Mission", category: "Date Ideas", text: t,
    })),
    "Cosmic Connection 🌠": [
      ...QUESTIONS["Mirror Moments"],
      ...QUESTIONS["Spark Questions"],
      ...MISSIONS["Mirror Quests"],
    ].map((t) => ({
      type: t.includes("?") ? "Question" : "Mission",
      category: "Date Ideas",
      text: t,
    })),
  }), []);
  const DATE_CAT_KEYS = Object.keys(DATE_IDEAS);

  // ========= Memos =========
  const inFav = useMemo(
    () => (current ? favs.some((f) => keyOf(f) === keyOf(current)) : false),
    [current, favs]
  );

  // ========= Callbacks (declare BEFORE effects that use them) =========
  const drawFromCategory = React.useCallback((cat, type) => {
    const data =
      type === "Question"
        ? QUESTIONS[cat].map((t) => ({ type, category: cat, text: t }))
        : MISSIONS[cat].map((t) => ({ type, category: cat, text: t }));
    const next = pick(data);
    setMode("category");
    setCurrent(next);
    setScreen("draw");
    setFlipSide(0);
    flip.setValue(0);
  }, [flip]);

  const toggleFav = React.useCallback(async () => {
    if (!current) return;
    const exists = favs.find((f) => keyOf(f) === keyOf(current));
    const next = exists ? favs.filter((f) => keyOf(f) !== keyOf(current)) : [current, ...favs];
    setFavs(next);
    await saveFavs(next);
  }, [current, favs]);

  const drawAgain = React.useCallback(() => {
    if (!current) return;
    const half = Animated.timing(flip, { toValue: 180, duration: 180, useNativeDriver: true });
    const back = Animated.timing(flip, { toValue: 0, duration: 180, useNativeDriver: true });

    half.start(() => {
      if (mode === "all") {
        setCurrent(pick(ALL()));
      } else if (mode === "dateIdeas") {
        const pool = [].concat(...DATE_CAT_KEYS.map((k) => DATE_IDEAS[k]));
        setCurrent(pick(pool));
      } else {
        // same category
        drawFromCategory(current.category, current.type);
        return; // drawFromCategory already reset flip
      }
      setFlipSide((s) => 1 - s);
      back.start();
    });
  }, [current, mode, flip, DATE_CAT_KEYS, DATE_IDEAS, drawFromCategory]);

  const loadLocationAndRecommendations = React.useCallback(async () => {
    try {
      const location = await getLocation();
      setGeo(location);
      
      const recs = await recommendNearby({ 
        userCity: location.city, 
        userCoord: location.coord, 
        card: current,
        userLocation: location
      });
      setRecommendations(recs);
    } catch (error) {
      console.log('Error loading location/recommendations:', error);
      // Fallback to Jacksonville recommendations
      const recs = await recommendNearby({ 
        userCity: 'Jacksonville', 
        userCoord: null, 
        card: current 
      });
      setRecommendations(recs);
    }
  }, [current]);

  const setThemeToggle = async (checked) => {
    const next = checked ? LIGHT : DARK;
    setTheme(next);
    await saveTheme(next);
  };

  const setMonetizationToggle = async (checked) => {
    const mode = checked ? "sponsor" : "affiliate";
    setMonetizationModeState(mode);
    setMonetizationMode(mode);
    await saveMonetizationMode(mode);
    if (current) {
      loadLocationAndRecommendations();
    }
  };


  const drawConnectionDeck = () => {
    const next = pick(allQuestions());
    setMode("all");
    setCurrent(next);
    setScreen("draw");
    setFlipSide(0);
    flip.setValue(0);
  };

  const drawChallengeDeck = () => {
    const next = pick(allMissions());
    setMode("all");
    setCurrent(next);
    setScreen("draw");
    setFlipSide(0);
    flip.setValue(0);
  };

  const drawDateIdea = (subCat) => {
    const next = pick(DATE_IDEAS[subCat]);
    setMode("dateIdeas");
    setCurrent(next);
    setScreen("draw");
    setFlipSide(0);
    flip.setValue(0);
  };

  // ========= Effects (safe now; callbacks exist) =========
  React.useEffect(() => {
    (async () => {
      setFavs(await loadFavs());
      setTheme(await loadTheme());
      const mode = await loadMonetizationMode();
      setMonetizationModeState(mode);
      setMonetizationMode(mode);
    })();
  }, []);

  React.useEffect(() => {
    if (current) loadLocationAndRecommendations();
  }, [current, loadLocationAndRecommendations]);

  React.useEffect(() => {
    if (Platform.OS === "web") {
      document.documentElement.style.overflowY = "auto";
      document.body.style.overflowY = "auto";
    }
  }, []);

  // Web-specific keyboard shortcuts
  React.useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyPress = (event) => {
      // Space bar to draw again when on draw screen
      if (event.code === "Space" && screen === "draw" && current) {
        event.preventDefault();
        drawAgain();
      }
      // Escape to go back
      if (event.code === "Escape" && screen !== "home") {
        setScreen("home");
      }
      // F key to toggle favorite
      if (event.code === "KeyF" && screen === "draw" && current) {
        event.preventDefault();
        toggleFav();
      }
      // D key for daily card
      if (event.code === "KeyD" && screen === "home") {
        event.preventDefault();
        setScreen("daily");
      }
      // S key for shuffle all
      if (event.code === "KeyS" && screen === "home") {
        event.preventDefault();
        setMode("all");
        setCurrent(pick(ALL()));
        setScreen("draw");
        flip.setValue(0);
        setFlipSide(0);
      }
      // T key to toggle theme
      if (event.code === "KeyT" && screen === "home") {
        event.preventDefault();
        setThemeToggle(theme.name === "dark");
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [screen, current, theme.name, drawAgain, toggleFav]);

  // ========= Local UI components (can safely reference state now) =========
  const Header = ({ title, showBack }) => (
    <View style={[styles.header, { borderBottomColor: theme.line }]}>
      <View style={{ width: 80 }}>
        {showBack && (
          <TouchableOpacity
            onPress={() => setScreen("home")}
            style={[styles.backBtn, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.backTxt, { color: theme.sub }]}>‹ Back</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
      <View style={{ width: 80 }} />
    </View>
  );

  const Tile = ({ label, onPress }) => {
    const icons = {
      "Spark Questions": "⚡",
      "Mirror Moments": "🪞",
      "Playful Sparks": "🎭",
      "Bond Builders": "💝",
      "Adventure Sparks": "🌍",
      "Creative Charms": "🎨",
      "Mirror Quests": "🔮",
      "Bond Quests": "❤️",
    };
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.tile,
          {
            backgroundColor: TILE_COLORS[label] || theme.accent,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
        activeOpacity={0.9}
      >
        <View style={styles.tileBadge}>
          <Text style={styles.tileIcon}>{icons[label] || "✨"}</Text>
        </View>
        <Text style={[styles.tileText, { color: "white" }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const Hero = ({ label, onPress }) => {
    const icons = {
      "The Connection Deck": "💝",
      "Date Night Deck": "🌙",
      "The Challenge Deck": "⚔️",
    };
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.hero,
          {
            backgroundColor: TILE_COLORS[label] || theme.accent,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 12,
          },
        ]}
        activeOpacity={0.93}
      >
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconText}>{icons[label] || "✨"}</Text>
        </View>
        <Text style={[styles.heroTxt, { color: "white" }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const KeyboardShortcuts = () => {
    if (Platform.OS !== "web") return null;
    return (
      <View style={[styles.shortcutsContainer, { backgroundColor: theme.pill }]}>
        <Text style={[styles.shortcutsTitle, { color: theme.text }]}>⌨️ Keyboard Shortcuts</Text>
        <View style={styles.shortcutsGrid}>
          <Text style={[styles.shortcut, { color: theme.sub }]}>
            <Text style={{ fontWeight: "800" }}>Space</Text> - Draw Again
          </Text>
          <Text style={[styles.shortcut, { color: theme.sub }]}>
            <Text style={{ fontWeight: "800" }}>F</Text> - Toggle Favorite
          </Text>
          <Text style={[styles.shortcut, { color: theme.sub }]}>
            <Text style={{ fontWeight: "800" }}>D</Text> - Daily Card
          </Text>
          <Text style={[styles.shortcut, { color: theme.sub }]}>
            <Text style={{ fontWeight: "800" }}>S</Text> - Shuffle All
          </Text>
          <Text style={[styles.shortcut, { color: theme.sub }]}>
            <Text style={{ fontWeight: "800" }}>T</Text> - Toggle Theme
          </Text>
          <Text style={[styles.shortcut, { color: theme.sub }]}>
            <Text style={{ fontWeight: "800" }}>Esc</Text> - Go Back
          </Text>
        </View>
      </View>
    );
  };

  // ========= Screens =========
  if (screen === "favorites") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.name === "dark" ? "light-content" : "dark-content"} />
        <Header title="Favorites" showBack />
        <FlatList
          style={{ flex: 1 }}
          data={favs}
          keyExtractor={(it, idx) => `${idx}-${keyOf(it)}`}
          contentContainerStyle={styles.listPad}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          bounces
          renderItem={({ item }) => (
            <View
              style={[
                styles.favRow,
                { backgroundColor: theme.card, borderColor: theme.line },
              ]}
            >
              <View style={styles.favBadge}>
                <Text style={{ color: "white", fontWeight: "800" }}>
                  {item.type === "Question" ? "Q" : "M"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTxt, { color: theme.text }]}>{item.text}</Text>
                <Text style={{ color: theme.sub, marginTop: 4 }}>{item.category}</Text>
              </View>
              <TouchableOpacity
                onPress={async () => {
                  const next = favs.filter((f) => keyOf(f) !== keyOf(item));
                  setFavs(next);
                  await saveFavs(next);
                }}
                style={[styles.removeBtn, { borderColor: theme.line }]}
              >
                <Text style={{ color: theme.sub }}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  if (screen === "daily") {
    const today = new Date();
    const item = seededDailyItem(today);
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.name === "dark" ? "light-content" : "dark-content"} />
        <Header title="Daily Card" showBack />
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.sub, marginBottom: 8 }}>{today.toDateString()}</Text>
          <View
            style={[
              styles.detailCard,
              { backgroundColor: theme.card, borderColor: theme.line },
            ]}
          >
            <Text style={[styles.detailBadge, { backgroundColor: theme.accent }]}>{item.type}</Text>
            <Text style={[styles.detailText, { color: theme.text }]}>{item.text}</Text>
            <Text style={{ color: theme.sub, marginTop: 10 }}>{item.category}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "dateCats") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.name === "dark" ? "light-content" : "dark-content"} />
        <Header title="Date Ideas" showBack />
        <View style={{ padding: 16, gap: 12 }}>
          {DATE_CAT_KEYS.map((k) => (
            <Tile key={k} label={k} onPress={() => drawDateIdea(k)} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "draw" && current) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar barStyle={theme.name === "dark" ? "light-content" : "dark-content"} />
        <Header
          title={`Magick!  ·  ${
            current.type === "Question"
              ? "The Connection Deck"
              : current.category === "Date Ideas"
              ? "Date Night Deck"
              : "The Challenge Deck"
          }`}
          showBack
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.detailWrap}
          showsVerticalScrollIndicator={false}
          bounces
        >
          <Animated.View
            style={[
              styles.detailCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.line,
                transform: [{ rotateY: flipInterpolate }],
              },
            ]}
          >
            <Text style={[styles.detailBadge, { backgroundColor: theme.accent }]}>
              {current.type}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === "web") {
                  navigator.clipboard.writeText(current.text);
                }
              }}
              style={Platform.OS === "web" ? { cursor: "pointer" } : {}}
            >
              <Text style={[styles.detailText, { color: theme.text }]}>{current.text}</Text>
            </TouchableOpacity>
            <Text style={{ color: theme.sub, marginTop: 8 }}>
              {current.category}
              {Platform.OS === "web" && (
                <Text style={{ fontSize: 12, opacity: 0.7 }}> • Click text to copy</Text>
              )}
            </Text>
            {geo.city && (
              <Text style={{ color: theme.sub, marginTop: 4, fontSize: 12 }}>
                📍 {geo.city}, {geo.region}
              </Text>
            )}
          </Animated.View>

          <View style={{ height: 16 }} />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={drawAgain}
              style={[styles.primaryBtn, { backgroundColor: theme.pill }]}
            >
              <Text style={[styles.primaryTxt, { color: theme.text }]}>⟳  Draw Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleFav}
              style={[styles.secondaryBtn, { borderColor: theme.line }]}
            >
              <Text style={{ color: theme.text }}>
                {inFav ? "★ Favorited" : "☆ Favorite"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recommended Nearby Section */}
          <RecommendedNearby items={recommendations} theme={theme} userLocation={geo} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ========= HOME =========
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.name === "dark" ? "light-content" : "dark-content"} />

      {Platform.OS === "web" ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          bounces
        >
          <View style={styles.webContainer}>
            <View style={styles.webContent}>
              <View style={[styles.headerHome]}>
                <View style={styles.orb} />
                <Text style={[styles.logo, { color: theme.text }]}>Magick!</Text>
                <Text style={{ color: theme.sub, marginTop: 2 }}>
                  Icebreaker Questions & Missions
                </Text>
              </View>

              <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
                {/* Hero row */}
                <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                  <Hero label="The Connection Deck" onPress={drawConnectionDeck} />
                  <Hero label="Date Night Deck" onPress={() => setScreen("dateCats")} />
                  <Hero label="The Challenge Deck" onPress={drawChallengeDeck} />
                </View>

                {/* Category grid */}
                <Text style={[styles.sectionTitle, { color: theme.sub }]}>
                  ICEBREAKER QUESTIONS & MISSIONS
                </Text>
                <View style={styles.grid}>
                  {Q_CATS.map((c) => (
                    <Tile key={c} label={c} onPress={() => drawFromCategory(c, "Question")} />
                  ))}
                  {M_CATS.map((c) => (
                    <Tile key={c} label={c} onPress={() => drawFromCategory(c, "Mission")} />
                  ))}
                </View>

                {/* Quick actions */}
                <View style={{ marginTop: 12, gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setMode("all");
                      setCurrent(pick(ALL()));
                      setScreen("draw");
                      flip.setValue(0);
                      setFlipSide(0);
                    }}
                    style={[styles.actionBtn, { backgroundColor: theme.pill }]}
                  >
                    <Text style={[styles.actionTxt, { color: theme.text }]}>
                      ⟳  Shuffle All Decks
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setScreen("favorites")}
                    style={[styles.actionBtn, { backgroundColor: theme.pill }]}
                  >
                    <Text style={[styles.actionTxt, { color: theme.text }]}>★  Favorites</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setScreen("daily")}
                    style={[styles.actionBtn, { backgroundColor: theme.pill }]}
                  >
                    <Text style={[styles.actionTxt, { color: theme.text }]}>📅  Daily Card</Text>
                  </TouchableOpacity>

                  <View style={[styles.darkRow, { backgroundColor: theme.pill }]}>
                    <Text style={[styles.actionTxt, { color: theme.text }]}>🌙  Dark Mode</Text>
                    <Switch
                      value={theme.name === "light"}
                      onValueChange={setThemeToggle}
                      thumbColor={"#fff"}
                    />
                  </View>

                  <View style={[styles.darkRow, { backgroundColor: theme.pill }]}>
                    <Text style={[styles.actionTxt, { color: theme.text }]}>💰  Sponsor Mode</Text>
                    <Switch
                      value={monetizationMode === "sponsor"}
                      onValueChange={setMonetizationToggle}
                      thumbColor={"#fff"}
                    />
                  </View>

                  <KeyboardShortcuts />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          bounces
        >
          <View style={[styles.headerHome]}>
            <View style={styles.orb} />
            <Text style={[styles.logo, { color: theme.text }]}>Magick!</Text>
            <Text style={{ color: theme.sub, marginTop: 2 }}>
              Icebreaker Questions & Missions
            </Text>
          </View>

          {/* Hero row */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            <Hero label="The Connection Deck" onPress={drawConnectionDeck} />
            <Hero label="Date Night Deck" onPress={() => setScreen("dateCats")} />
            <Hero label="The Challenge Deck" onPress={drawChallengeDeck} />
          </View>

          {/* Category grid */}
          <Text style={[styles.sectionTitle, { color: theme.sub }]}>
            ICEBREAKER QUESTIONS & MISSIONS
          </Text>
          <View style={styles.grid}>
            {Q_CATS.map((c) => (
              <Tile key={c} label={c} onPress={() => drawFromCategory(c, "Question")} />
            ))}
            {M_CATS.map((c) => (
              <Tile key={c} label={c} onPress={() => drawFromCategory(c, "Mission")} />
            ))}
          </View>

          {/* Quick actions */}
          <View style={{ marginTop: 12, gap: 10 }}>
            <TouchableOpacity
              onPress={() => {
                setMode("all");
                setCurrent(pick(ALL()));
                setScreen("draw");
                flip.setValue(0);
                setFlipSide(0);
              }}
              style={[styles.actionBtn, { backgroundColor: theme.pill }]}
            >
              <Text style={[styles.actionTxt, { color: theme.text }]}>⟳  Shuffle All Decks</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setScreen("favorites")}
              style={[styles.actionBtn, { backgroundColor: theme.pill }]}
            >
              <Text style={[styles.actionTxt, { color: theme.text }]}>★  Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setScreen("daily")}
              style={[styles.actionBtn, { backgroundColor: theme.pill }]}
            >
              <Text style={[styles.actionTxt, { color: theme.text }]}>📅  Daily Card</Text>
            </TouchableOpacity>

            <View style={[styles.darkRow, { backgroundColor: theme.pill }]}>
              <Text style={[styles.actionTxt, { color: theme.text }]}>🌙  Dark Mode</Text>
              <Switch
                value={theme.name === "light"}
                onValueChange={setThemeToggle}
                thumbColor={"#fff"}
              />
            </View>

            <View style={[styles.darkRow, { backgroundColor: theme.pill }]}>
              <Text style={[styles.actionTxt, { color: theme.text }]}>💰  Sponsor Mode</Text>
              <Switch
                value={monetizationMode === "sponsor"}
                onValueChange={setMonetizationToggle}
                thumbColor={"#fff"}
              />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}


/** ==== styles ==== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerHome: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  logo: {
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 1,
  },
  orb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#8b5cf6",
    opacity: 0.9,
    marginTop: 8,
    marginBottom: 6,
    shadowColor: "#8b5cf6",
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  backTxt: { fontWeight: "700" },
  hero: {
    flex: 1,
    padding: 20,
    borderWidth: 0,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  heroIconText: {
    fontSize: 20,
  },
  heroTxt: {
    fontWeight: "900",
    textAlign: "center",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 10,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  tile: {
    width: "31%",
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  tileBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  tileIcon: {
    fontSize: 32,
  },
  tileText: {
    fontWeight: "900",
    textAlign: "center",
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  listPad: {
    padding: 16,
    paddingBottom: 32,
  },
  favRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  favBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemTxt: {
    fontSize: 16,
    lineHeight: 22,
  },
  detailWrap: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  detailCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  detailBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    color: "white",
    fontWeight: "800",
    marginBottom: 12,
    fontSize: 12,
  },
  detailText: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
  },
  primaryBtn: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    flex: 1,
    alignItems: "center",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryTxt: {
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionBtn: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  actionTxt: {
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  darkRow: {
    padding: 20,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  shortcutsContainer: {
    padding: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  shortcutsTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  shortcutsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  shortcut: {
    fontSize: 12,
  },
  webContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  webContent: {
    width: "100%",
    maxWidth: 1200,
  },
});
