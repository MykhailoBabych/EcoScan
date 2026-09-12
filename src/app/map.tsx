import BottleIcon from "@/assets/images/bottle.svg";
import RecycleIcon from "@/assets/images/recycle.svg";
import * as Location from "expo-location";
import { AppIcon } from "@/components/icon";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Circle, Marker, type Region } from "react-native-maps";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Search radius for nearby places in meters (currently 10km)
const SEARCH_RADIUS_METERS = 50_000;
const EARTH_RADIUS_METERS = 6_371_000;
const MAX_VISIBLE_STORES = 15;

type PlaceType = "recycling" | "store" | "vending";

const PLACE_TYPE_OPTIONS: Array<{ type: PlaceType; label: string }> = [
  { type: "recycling", label: "Recycling" },
  { type: "vending", label: "Bottle/Cans machines" },
  { type: "store", label: "Large stores" },
];

const HIDDEN_POI_MAP_STYLE = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

type Coordinates = {
  latitude: number;
  longitude: number;
};

const LARGE_STORE_SHOPS = new Set(["hypermarket", "department_store", "mall"]);
const MAJOR_STORE_CHAINS = [
  "lidl",
  "kaufland",
  "carrefour",
  "auchan",
  "mega image",
  "profi",
  "penny",
  "selgros",
  "metro",
  "cora",
  "supeco",
  "la cocos",
  "dedeman",
  "brico depot",
  "leroy merlin",
  "hornbach",
];

const normalizeStoreName = (value?: string) =>
  value
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim() ?? "";

const isMajorStoreChain = (tags: Record<string, string>) => {
  const searchableName = [
    tags.brand,
    tags.operator,
    tags.name,
    tags["brand:wikidata"],
  ]
    .map(normalizeStoreName)
    .filter(Boolean)
    .join(" ");

  return MAJOR_STORE_CHAINS.some((chain) => searchableName.includes(chain));
};

const isLargeStore = (tags: Record<string, string>) => {
  if (LARGE_STORE_SHOPS.has(tags.shop)) {
    return true;
  }

  return tags.shop === "supermarket" && isMajorStoreChain(tags);
};

const isRelevantRecyclingPlace = (tags: Record<string, string>) =>
  tags.amenity === "recycling" &&
  tags.recycling_type !== "container" &&
  (tags.recycling_type === "centre" ||
    Boolean(tags.name || tags.operator || tags.brand));

// Determines the type of place based on its OSM tags
const getPlaceType = (tags: Record<string, string>): PlaceType | null => {
  if (isRelevantRecyclingPlace(tags)) return "recycling";
  if (tags.amenity === "vending_machine") return "vending";
  if (isLargeStore(tags)) return "store";
  return null;
};

const getMarkerColor = (type: PlaceType) => {
  if (type === "recycling") return "#22C55E";
  if (type === "vending") return "#0EA5E9";
  return "#F59E0B";
};

const getMarkerSvg = (type: PlaceType) => {
  if (type === "recycling") return <RecycleIcon width={18} height={18} />;
  return <BottleIcon width={18} height={18} />;
};

// better calculation of distance
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const getDistanceMeters = (from: Coordinates, to: Coordinates) => {
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [hasLoadedPlaces, setHasLoadedPlaces] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isFiltersRendered, setIsFiltersRendered] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<
    Record<PlaceType, boolean>
  >({
    recycling: true,
    vending: true,
    store: true,
  });
  const filtersWidth = useSharedValue(154);
  const dropdownWidth = useSharedValue(220);
  const dropdownProgress = useSharedValue(0);
  const locateIconScale = useSharedValue(1);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingPlacesRef = useRef(false);

  const filteredPlaces = userLocation
    ? places
        .filter(
          (place) =>
            selectedTypes[place.type] &&
            getDistanceMeters(userLocation, place) <= SEARCH_RADIUS_METERS,
        )
        .sort((a, b) => {
          if (a.type !== "store" && b.type === "store") return -1;
          if (a.type === "store" && b.type !== "store") return 1;
          return (
            getDistanceMeters(userLocation, a) -
            getDistanceMeters(userLocation, b)
          );
        })
        .filter((place, index, list) => {
          if (place.type !== "store") return true;
          return (
            list.slice(0, index + 1).filter((item) => item.type === "store")
              .length <= MAX_VISIBLE_STORES
          );
        })
    : [];
  const activeFilterCount = PLACE_TYPE_OPTIONS.filter(
    (option) => selectedTypes[option.type],
  ).length;

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

  const locateIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: locateIconScale.value }],
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

    filtersWidth.value = withTiming(154, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });

    dropdownWidth.value = withTiming(220, {
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

    filtersWidth.value = withTiming(154, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });

    dropdownWidth.value = withTiming(220, {
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

  const centerOnUser = useCallback(() => {
    if (!userLocation) return;

    const nextRegion = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };

    setRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 350);
  }, [userLocation]);

  const pressLocateButton = () => {
    locateIconScale.value = withTiming(0.72, {
      duration: 90,
      easing: Easing.out(Easing.quad),
    });
  };

  const releaseLocateButton = () => {
    locateIconScale.value = withTiming(1, {
      duration: 140,
      easing: Easing.out(Easing.back(1.8)),
    });
  };

  const loadNearbyPlaces = useCallback(async () => {
    if (!userLocation || isLoadingPlacesRef.current) return;

    isLoadingPlacesRef.current = true;
    setIsLoadingPlaces(true);
    setPlacesError(null);

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="recycling"](around:${SEARCH_RADIUS_METERS},${userLocation.latitude},${userLocation.longitude});
        node["amenity"="vending_machine"]["vending"~"(^|;)(bottle|reverse_vending|recycling)(;|$)"](around:${SEARCH_RADIUS_METERS},${userLocation.latitude},${userLocation.longitude});

        node["shop"~"^(supermarket|hypermarket|department_store|mall)$"](around:${SEARCH_RADIUS_METERS},${userLocation.latitude},${userLocation.longitude});
      );
      out center tags;
    `;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: query,
      });

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

        const distanceMeters = getDistanceMeters(userLocation, {
          latitude,
          longitude,
        });

        if (distanceMeters > SEARCH_RADIUS_METERS) {
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
      setPlaces([]);
      setPlacesError("Could not load nearby places");
    } finally {
      isLoadingPlacesRef.current = false;
      setHasLoadedPlaces(true);
      setIsLoadingPlaces(false);
    }
  }, [userLocation]);

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

      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setRegion(nextRegion);
    };

    requestAndGetLocation();
  }, []);

  useEffect(() => {
    loadNearbyPlaces();
  }, [loadNearbyPlaces]);

  const shouldShowStatusPanel =
    isLoadingPlaces ||
    Boolean(placesError) ||
    Boolean(userLocation && hasLoadedPlaces && places.length === 0);

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
        ref={mapRef}
        style={styles.map}
        customMapStyle={HIDDEN_POI_MAP_STYLE}
        initialRegion={region ?? undefined}
        poiClickEnabled={false}
        showsBuildings={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        showsUserLocation
        onPress={closeFilters}
        onPanDrag={closeFilters}
      >
        {userLocation ? (
          <Circle
            center={userLocation}
            radius={SEARCH_RADIUS_METERS}
            strokeColor="rgba(10, 132, 255, 0.45)"
            fillColor="rgba(10, 132, 255, 0.08)"
            strokeWidth={2}
          />
        ) : null}

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
                getMarkerSvg(place.type)
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      <AnimatedPressable
        style={styles.locateButton}
        onPress={centerOnUser}
        onPressIn={pressLocateButton}
        onPressOut={releaseLocateButton}
      >
        <Animated.View style={locateIconAnimatedStyle}>
          <AppIcon name="location.fill" size={20} tintColor="#28a745" />
        </Animated.View>
      </AnimatedPressable>

      <View style={styles.filtersContainer}>
        <AnimatedPressable
          style={[styles.filtersButton, filtersButtonAnimatedStyle]}
          onPress={toggleFilters}
        >
          <AppIcon
            name="line.3.horizontal.decrease.circle.fill"
            size={18}
            tintColor="#fff"
          />
          <Text style={styles.filtersButtonText}>Filters</Text>
          <View style={styles.filterCountBadge}>
            <Text style={styles.filterCountText}>{activeFilterCount}</Text>
          </View>
          <AppIcon
            name={isFiltersOpen ? "chevron.up" : "chevron.down"}
            size={13}
            tintColor="#fff"
          />
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
                    {isSelected ? "✓" : ""}
                  </Text>
                  <Text style={styles.filterLabel}>{option.label}</Text>
                </Pressable>
              );
            })}
          </Animated.View>
        ) : null}
      </View>

      {shouldShowStatusPanel ? (
        <View style={styles.statusPanel}>
          <View style={styles.statusHeader}>
            {isLoadingPlaces ? (
              <ActivityIndicator color="#28a745" />
            ) : (
              <AppIcon
                name={
                  placesError ? "exclamationmark.triangle.fill" : "mappin.slash"
                }
                size={20}
                tintColor={placesError ? "#ff9500" : "#8e8e93"}
              />
            )}
            <View style={styles.statusTextGroup}>
              <Text style={styles.statusTitle}>
                {isLoadingPlaces
                  ? "Searching nearby recycling places..."
                  : placesError
                    ? "Could not load nearby places"
                    : "No nearby places found"}
              </Text>
              {!isLoadingPlaces ? (
                <Text style={styles.statusSubtitle}>
                  Try again or adjust filters if the map looks empty.
                </Text>
              ) : null}
            </View>
          </View>

          {!isLoadingPlaces ? (
            <Pressable
              style={[
                styles.retryButton,
                isLoadingPlaces && styles.retryButtonDisabled,
              ]}
              onPress={loadNearbyPlaces}
              disabled={isLoadingPlaces}
            >
              <AppIcon
                name="arrow.clockwise"
                size={14}
                tintColor="#28a745"
              />
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          ) : null}
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
  locateButton: {
    position: "absolute",
    top: 52,
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },
  statusPanel: {
    position: "absolute",
    bottom: 82,
    left: 16,
    right: 16,
    borderRadius: 18,
    backgroundColor: "#fff",
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusTextGroup: {
    flex: 1,
  },
  statusTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  statusSubtitle: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 2,
  },
  retryButton: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#28a745",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  retryButtonDisabled: {
    opacity: 0.55,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  filtersContainer: {
    position: "absolute",
    top: 52,
    left: 16,
  },
  filtersButton: {
    backgroundColor: "#28a745",
    borderRadius: 23,
    height: 46,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },
  filtersButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  filterCountBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  filterCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  filtersDropdown: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    width: 220,
    maxWidth: 220,
    alignSelf: "flex-start",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
    transformOrigin: "top left",
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  filterCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 22,
    textAlign: "center",
    overflow: "hidden",
  },
  filterCheckboxSelected: {
    color: "#fff",
    backgroundColor: "#28a745",
  },
  filterCheckboxUnselected: {
    color: "transparent",
    backgroundColor: "#edf7ef",
    borderColor: "#9fd8ad",
    borderWidth: 1,
  },
  filterLabel: {
    color: "#1f2937",
    fontSize: 14,
    fontWeight: "600",
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
