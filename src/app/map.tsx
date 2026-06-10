import { SignInPrompt } from "@/components/sign-in-prompt";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SvgXml } from "react-native-svg";

const SEARCH_RADIUS_METERS = 25_000;

type PlaceType = "recycling" | "store" | "vending";

const PLACE_TYPE_OPTIONS: Array<{ type: PlaceType; label: string }> = [
  { type: "recycling", label: "Recycling" },
  { type: "vending", label: "Bottle/Cans machines" },
  { type: "store", label: "Large stores" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// SVGs taken from https://phosphoricons.com/ and modified to fit the app style
const BOTTLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M245.66,42.34l-32-32a8,8,0,0,0-11.32,11.32l1.48,1.47L148.65,64.51l-38.22,7.65a8.05,8.05,0,0,0-4.09,2.18L23,157.66a24,24,0,0,0,0,33.94L64.4,233a24,24,0,0,0,33.94,0l83.32-83.31a8,8,0,0,0,2.18-4.09l7.65-38.22,41.38-55.17,1.47,1.48a8,8,0,0,0,11.32-11.32ZM96,107.31,148.69,160,104,204.69,51.31,152ZM81.37,224a7.94,7.94,0,0,1-5.65-2.34L34.34,180.28a8,8,0,0,1,0-11.31L40,163.31,92.69,216,87,221.66A8,8,0,0,1,81.37,224ZM177.6,99.2a7.92,7.92,0,0,0-1.44,3.23l-7.53,37.63L160,148.69,107.31,96l8.63-8.63,37.63-7.53a7.92,7.92,0,0,0,3.23-1.44l58.45-43.84,6.19,6.19Z"></path></svg>
`;

const RECYCLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M96,208a8,8,0,0,1-8,8H40a24,24,0,0,1-20.77-36l34.29-59.25L39.47,124.5A8,8,0,1,1,35.33,109l32.77-8.77a8,8,0,0,1,9.8,5.66l8.79,32.77A8,8,0,0,1,81,148.5a8.37,8.37,0,0,1-2.08.27,8,8,0,0,1-7.72-5.93l-3.8-14.15L33.11,188A8,8,0,0,0,40,200H88A8,8,0,0,1,96,208Zm140.73-28-23.14-40a8,8,0,0,0-13.84,8l23.14,40A8,8,0,0,1,216,200H147.31l10.34-10.34a8,8,0,0,0-11.31-11.32l-24,24a8,8,0,0,0,0,11.32l24,24a8,8,0,0,0,11.31-11.32L147.31,216H216a24,24,0,0,0,20.77-36ZM128,32a7.85,7.85,0,0,1,6.92,4l34.29,59.25-14.08-3.78A8,8,0,0,0,151,106.92l32.78,8.79a8.23,8.23,0,0,0,2.07.27,8,8,0,0,0,7.72-5.93l8.79-32.79a8,8,0,1,0-15.45-4.14l-3.8,14.17L148.77,28a24,24,0,0,0-41.54,0L84.07,68a8,8,0,0,0,13.85,8l23.16-40A7.85,7.85,0,0,1,128,32Z"></path></svg>
`;

type Place = {
  id: string;
  type: PlaceType;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
};

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
  type: "node" | "way" | "relation";
};

// Determines the type of place based on its OSM tags
const getPlaceType = (tags: Record<string, string>): PlaceType | null => {
  if (tags.amenity === "recycling") return "recycling";
  if (tags.shop) return "store";
  if (tags.amenity === "vending_machine") return "vending";
  return null;
};

const getMarkerColor = (type: PlaceType) => {
  if (type === "recycling") return "#22C55E";
  if (type === "vending") return "#0EA5E9";
  return "#F59E0B";
};

const getMarkerSvg = (type: PlaceType) => {
  if (type === "recycling") return RECYCLE_SVG;
  return BOTTLE_SVG;
};

const getPlaceTitle = (tags: Record<string, string>, type: PlaceType) => {
  if (tags.name) return tags.name;
  if (type === "recycling") return "Recycling point";
  if (type === "vending") return "Bottle/can return machine";
  return "Large store";
};

// Generates a description based on the place's tags and type
const getPlaceDescription = (tags: Record<string, string>, type: PlaceType) => {
  const materials = Object.entries(tags)
    .filter(([key, value]) => key.startsWith("recycling:") && value === "yes")
    .map(([key]) => key.replace("recycling:", ""));

  if (materials.length > 0) {
    return `Accepts: ${materials.join(", ")}`;
  }

  if (type === "recycling") {
    return "General recycling location";
  }

  if (type === "vending") {
    return "Return point for bottles/cans";
  }

  return "May have in-store recycling options";
};

// Main screen component that displays the map and nearby recycling points
export function MapScreen() {
  return (
    <SignInPrompt>
      <MapScreenContent />
    </SignInPrompt>
  );
}

export function MapScreenContent() {
  const [region, setRegion] = useState<Region | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isFiltersRendered, setIsFiltersRendered] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<
    Record<PlaceType, boolean>
  >({
    recycling: true,
    store: true,
    vending: true,
  });
  const filtersWidth = useSharedValue(92);
  const dropdownWidth = useSharedValue(180);
  const dropdownProgress = useSharedValue(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredPlaces = places.filter((place) => selectedTypes[place.type]);

  const filtersButtonAnimatedStyle = useAnimatedStyle(() => ({
    width: filtersWidth.value,
  }));

  const filtersDropdownAnimatedStyle = useAnimatedStyle(() => ({
    width: dropdownWidth.value,
    opacity: dropdownProgress.value,
    transform: [
      {
        translateY: interpolate(dropdownProgress.value, [0, 1], [-8, 0]),
      },
      {
        scaleY: interpolate(dropdownProgress.value, [0, 1], [0.96, 1]),
      },
    ],
  }));

  const toggleType = (type: PlaceType) => {
    setSelectedTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openFilters = () => {
    clearCloseTimer();
    setIsFiltersRendered(true);
    setIsFiltersOpen(true);

    filtersWidth.value = withTiming(180, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });

    dropdownWidth.value = withTiming(180, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });

    dropdownProgress.value = withTiming(1, {
      duration: 180,
      easing: Easing.out(Easing.quad),
    });
  };

  const closeFilters = () => {
    if (!isFiltersOpen && !isFiltersRendered) return;

    clearCloseTimer();
    setIsFiltersOpen(false);

    filtersWidth.value = withTiming(92, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });

    dropdownWidth.value = withTiming(168, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });

    dropdownProgress.value = withTiming(0, {
      duration: 140,
      easing: Easing.in(Easing.quad),
    });

    closeTimer.current = setTimeout(() => {
      setIsFiltersRendered(false);
      closeTimer.current = null;
    }, 150);
  };

  const toggleFilters = () => {
    if (isFiltersOpen) {
      closeFilters();
      return;
    }

    openFilters();
  };

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

  useEffect(() => {
    const requestAndGetLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationDenied(true);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const nextRegion = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      };

      setRegion(nextRegion);
    };

    requestAndGetLocation();
  }, []);

  // Fetches nearby recycling points from the Overpass API based on the user's location
  useEffect(() => {
    const loadNearbyPlaces = async () => {
      if (!region) return;

      setIsLoadingPlaces(true);
      setPlacesError(null);

      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="recycling"](around:${SEARCH_RADIUS_METERS},${region.latitude},${region.longitude});
          way["amenity"="recycling"](around:${SEARCH_RADIUS_METERS},${region.latitude},${region.longitude});
          relation["amenity"="recycling"](around:${SEARCH_RADIUS_METERS},${region.latitude},${region.longitude});

          node["shop"~"supermarket|hypermarket|department_store|mall"](around:${SEARCH_RADIUS_METERS},${region.latitude},${region.longitude});
          way["shop"~"supermarket|hypermarket|department_store|mall"](around:${SEARCH_RADIUS_METERS},${region.latitude},${region.longitude});
          relation["shop"~"supermarket|hypermarket|department_store|mall"](around:${SEARCH_RADIUS_METERS},${region.latitude},${region.longitude});

          node["amenity"="vending_machine"]["vending"~"bottle|reverse_vending|recycling"](around:${SEARCH_RADIUS_METERS},${region.latitude},${region.longitude});
          way["amenity"="vending_machine"]["vending"~"bottle|reverse_vending|recycling"](around:${SEARCH_RADIUS_METERS},${region.latitude},${region.longitude});
          relation["amenity"="vending_machine"]["vending"~"bottle|reverse_vending|recycling"](around:${SEARCH_RADIUS_METERS},${region.latitude},${region.longitude});
        );
        out center tags qt 300;
      `;

      try {
        const response = await fetch(
          "https://overpass-api.de/api/interpreter",
          {
            method: "POST",
            headers: {
              "Content-Type": "text/plain",
            },
            body: query,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch map points");
        }

        const data = (await response.json()) as {
          elements?: OverpassElement[];
        };
        const uniquePlaces = new Map<string, Place>();

        for (const element of data.elements ?? []) {
          const latitude = element.lat ?? element.center?.lat;
          const longitude = element.lon ?? element.center?.lon;
          const tags = element.tags ?? {};
          const type = getPlaceType(tags);

          if (!latitude || !longitude || !type) {
            continue;
          }

          const id = `${element.type}-${element.id}`;

          uniquePlaces.set(id, {
            id,
            type,
            latitude,
            longitude,
            title: getPlaceTitle(tags, type),
            description: getPlaceDescription(tags, type),
          });
        }

        setPlaces(Array.from(uniquePlaces.values()));
      } catch {
        setPlacesError("Could not load nearby recycling points");
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    loadNearbyPlaces();
  }, [region]);

  if (!region && !locationDenied) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (locationDenied) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>
          Enable location services in your device settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region ?? undefined}
        showsUserLocation
        onPress={closeFilters}
        onPanDrag={closeFilters}
      >
        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.title}
            description={place.description}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges
          >
            <View
              style={[
                styles.markerBubble,
                { backgroundColor: getMarkerColor(place.type) },
              ]}
            >
              {place.type === "vending" ? (
                <Image
                  source={require("../../assets/images/return.png")}
                  style={styles.returnMarkerIcon}
                />
              ) : (
                <SvgXml xml={getMarkerSvg(place.type)} width={16} height={16} />
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.filtersContainer}>
        <AnimatedPressable
          style={[styles.filtersButton, filtersButtonAnimatedStyle]}
          onPress={toggleFilters}
        >
          <Text style={styles.filtersButtonText}>Filters ▾</Text>
        </AnimatedPressable>

        {isFiltersRendered ? (
          <Animated.View
            style={[styles.filtersDropdown, filtersDropdownAnimatedStyle]}
            pointerEvents={isFiltersOpen ? "auto" : "none"}
          >
            {PLACE_TYPE_OPTIONS.map((option) => {
              const isSelected = selectedTypes[option.type];

              return (
                <Pressable
                  key={option.type}
                  style={styles.filterItem}
                  onPress={() => toggleType(option.type)}
                >
                  <Text
                    style={[
                      styles.filterCheckbox,
                      isSelected
                        ? styles.filterCheckboxSelected
                        : styles.filterCheckboxUnselected,
                    ]}
                  >
                    {isSelected ? "✓" : "✕"}
                  </Text>
                  <Text style={styles.filterLabel}>{option.label}</Text>
                </Pressable>
              );
            })}
          </Animated.View>
        ) : null}
      </View>

      {isLoadingPlaces ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            Loading nearby recycling points...
          </Text>
        </View>
      ) : null}

      {placesError ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{placesError}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  message: {
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 12,
    backgroundColor: "rgba(15, 23, 42, 0.82)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  badgeText: {
    color: "#fff",
    textAlign: "center",
  },
  filtersContainer: {
    position: "absolute",
    top: 52,
    left: 12,
  },
  filtersButton: {
    backgroundColor: "#0a84ff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: "hidden",
  },
  filtersButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  filtersDropdown: {
    marginTop: 8,
    backgroundColor: "#0a84ff",
    borderRadius: 10,
    paddingVertical: 6,
    width: 180,
    maxWidth: 180,
    alignSelf: "flex-start",
    overflow: "hidden",
    transformOrigin: "top left",
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterCheckbox: {
    width: 18,
    marginRight: 8,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "center",
  },
  filterCheckboxSelected: {
    color: "#fff",
  },
  filterCheckboxUnselected: {
    color: "rgba(255, 214, 214, 0.9)",
  },
  filterLabel: {
    color: "#fff",
  },
  markerBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },
  returnMarkerIcon: {
    width: 20,
    height: 20,
    transform: [{ translateX: -1 }],
  },
});
