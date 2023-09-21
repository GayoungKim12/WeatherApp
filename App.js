import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView, Dimensions, ActivityIndicator } from "react-native";

import { Fontisto } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstom: "lightning",
};

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);

  const API_KEY = "YOUR_API_KEY";

  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }

    if (ok) {
      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync({ accuracy: 5 });
      const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });
      setCity(location[0].city);

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const json = await response.json();
      setDays(json.list.filter((data) => data.dt_txt.includes("09:00:00")));
    }
  };

  useEffect(() => {
    getWeather();
  }, []);

  if (!ok) {
    return (
      <View style={styles.failContainer}>
        <Text style={{ fontSize: 20, color: "white" }}>위치 접근을 허용해 주세요😥</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={{ ...styles.day, alignItems: "center" }}>
            <ActivityIndicator size="large" color="white" />
          </View>
        ) : (
          days.map((day) => {
            return (
              <View style={styles.day} key={day.dt_txt}>
                <Fontisto style={{ marginBottom: -24 }} name={icons[day.weather[0].main]} size={60} color="white" />
                <Text style={styles.temp}>{`${parseFloat(day.main.temp).toFixed(1)}°`}</Text>
                <Text style={styles.description}>{day.weather[0].main}</Text>
                <Text style={styles.tinyText}>{day.weather[0].description}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fb7185",
  },
  city: {
    flex: 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    color: "white",
    fontSize: 40,
    fontWeight: "500",
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    padding: 20,
  },
  temp: {
    color: "white",
    fontSize: 100,
    fontWeight: "500",
  },
  description: {
    marginTop: 0,
    color: "white",
    fontSize: 32,
  },
  tinyText: {
    color: "white",
    fontSize: 16,
  },
  failContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fb7185",
  },
});
