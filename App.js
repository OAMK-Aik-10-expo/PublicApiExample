import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, ImageBackground, ScrollView } from 'react-native';

export default function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetch(process.env.EXPO_PUBLIC_APIURL)
      .then(response => response.json())
      .then(data => {
        setWeatherData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      });

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const futureHourlyData = weatherData.hourly.time
    .map((time, index) => ({ time, temp: weatherData.hourly.temperature_2m[index] }))
    .filter(({ time }) => new Date(time) > currentTime);

  const groupedData = futureHourlyData.reduce((acc, { time, temp }) => {
    const date = new Date(time).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({ time, temp });
    return acc;
  }, {});

  return (
    <ImageBackground source={require('./assets/weather-background.jpg')} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.time}>{currentTime.toLocaleTimeString()}</Text>
        {weatherData ? (
          <>
            <Text style={styles.title}>Current Temperature</Text>
            <Text style={styles.currentTemp}>{weatherData.current.temperature_2m}°C</Text>
            <Text style={styles.subtitle}>Hourly Temperature</Text>
            {Object.keys(groupedData).map((date, index) => (
              <View key={index} style={styles.dateSection}>
                <Text style={styles.dateHeader}>{date}</Text>
                <ScrollView horizontal contentContainerStyle={styles.hourlyContainer}>
                  {groupedData[date].map(({ time, temp }, idx) => (
                    <View key={idx} style={styles.hourlyItem}>
                      <Text style={styles.hourlyTime}>{new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      <Text style={styles.hourlyTemp}>{temp}°C</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.errorText}>No weather data available</Text>
        )}
        <StatusBar style="auto" />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'contain',
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  time: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  currentTemp: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  dateSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  dateHeader: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  hourlyContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
  },
  hourlyItem: {
    alignItems: 'center',
    margin: 5,
  },
  hourlyTime: {
    fontSize: 16,
    color: '#fff',
  },
  hourlyTemp: {
    fontSize: 18,
    color: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
  },
});
