import {
  ECO_FACTS,
  RECYCLING_GUIDES,
  RecyclingGuide,
  UPCYCLING_TIPS,
} from "@/data/eco-content";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Section = "facts" | "guide" | "upcycle";

export default function ExploreScreen() {
  const theme = useTheme();
  const [section, setSection] = useState<Section>("facts");

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Learn</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Eco facts, recycling guides & upcycling ideas
        </Text>
      </View>

      {/* Section switcher */}
      <View
        style={[styles.switcher, { backgroundColor: theme.backgroundElement }]}
      >
        <SwitchTab
          label="🌍 Facts"
          active={section === "facts"}
          onPress={() => setSection("facts")}
          theme={theme}
        />
        <SwitchTab
          label="📋 Guide"
          active={section === "guide"}
          onPress={() => setSection("guide")}
          theme={theme}
        />
        <SwitchTab
          label="✨ Upcycle"
          active={section === "upcycle"}
          onPress={() => setSection("upcycle")}
          theme={theme}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {section === "facts" && <FactsSection theme={theme} />}
        {section === "guide" && <GuideSection theme={theme} />}
        {section === "upcycle" && <UpcycleSection theme={theme} />}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Section switcher tab ───────────────────────────────────────────────────────

function SwitchTab({ label, active, onPress, theme }: any) {
  return (
    <TouchableOpacity
      style={[styles.switchTab, active && { backgroundColor: "#28a745" }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.switchTabText,
          { color: active ? "#fff" : theme.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Facts ──────────────────────────────────────────────────────────────────────

function FactsSection({ theme }: any) {
  return (
    <View style={{ gap: 12 }}>
      {ECO_FACTS.map((fact) => (
        <View
          key={fact.id}
          style={[
            styles.factCard,
            { backgroundColor: theme.backgroundElement },
          ]}
        >
          <Text style={styles.factEmoji}>{fact.emoji}</Text>
          <Text style={[styles.factText, { color: theme.text }]}>
            {fact.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Recycling guide ──────────────────────────────────────────────────────────

function GuideSection({ theme }: any) {
  const [open, setOpen] = useState<string | null>(RECYCLING_GUIDES[0].id);

  return (
    <View style={{ gap: 12 }}>
      {RECYCLING_GUIDES.map((guide: RecyclingGuide) => {
        const isOpen = open === guide.id;
        return (
          <View
            key={guide.id}
            style={[
              styles.guideCard,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <TouchableOpacity
              style={styles.guideHeader}
              onPress={() => setOpen(isOpen ? null : guide.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.guideIcon,
                  { backgroundColor: guide.color + "22" },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{guide.emoji}</Text>
              </View>
              <Text style={[styles.guideTitle, { color: theme.text }]}>
                {guide.title}
              </Text>
              <Text
                style={[styles.guideChevron, { color: theme.textSecondary }]}
              >
                {isOpen ? "−" : "+"}
              </Text>
            </TouchableOpacity>

            {isOpen && (
              <View style={styles.guideRules}>
                {guide.rules.map((rule, i) => (
                  <View key={i} style={styles.ruleRow}>
                    <View
                      style={[styles.ruleDot, { backgroundColor: guide.color }]}
                    />
                    <Text
                      style={[styles.ruleText, { color: theme.textSecondary }]}
                    >
                      {rule}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Upcycling tips ─────────────────────────────────────────────────────────────

function UpcycleSection({ theme }: any) {
  return (
    <View style={{ gap: 12 }}>
      {UPCYCLING_TIPS.map((tip) => (
        <View
          key={tip.id}
          style={[styles.tipCard, { backgroundColor: theme.backgroundElement }]}
        >
          <Text style={styles.tipEmoji}>{tip.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.tipItem, { color: theme.text }]}>
              {tip.item}
            </Text>
            <Text style={[styles.tipIdea, { color: theme.textSecondary }]}>
              {tip.idea}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 32, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 2 },

  switcher: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 8,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: "center",
  },
  switchTabText: { fontSize: 13, fontWeight: "600" },

  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  // Facts
  factCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 16,
  },
  factEmoji: { fontSize: 28 },
  factText: { flex: 1, fontSize: 15, lineHeight: 21 },

  // Guide
  guideCard: { borderRadius: 16, overflow: "hidden" },
  guideHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  guideIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  guideTitle: { flex: 1, fontSize: 17, fontWeight: "700" },
  guideChevron: {
    fontSize: 22,
    fontWeight: "400",
    width: 24,
    textAlign: "center",
  },
  guideRules: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  ruleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  ruleDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  ruleText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // Upcycle tips
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 16,
  },
  tipEmoji: { fontSize: 28 },
  tipItem: { fontSize: 16, fontWeight: "700" },
  tipIdea: { fontSize: 14, marginTop: 2, lineHeight: 19 },
});
