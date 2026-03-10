import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StatusBar,
  StyleSheet,
} from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { InventoryProvider } from "./context/InventoryContext";
import { LanguageProvider } from "./context/LanguageContext";
import AppNavigator from "./navigation/AppNavigator";
import { colors } from "./theme/colors";

const logo = require("./assets/images/logo.png");

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primaryBlue,
    text: colors.textPrimary,
    card: colors.cardBackground,
    border: colors.border,
  },
};

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 800);
    return () => clearTimeout(t);
  }, []);

  if (!ready) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryBlue} />
        <View style={styles.splashContainer}>
          <Image source={logo} style={styles.splashLogo} resizeMode="contain" />
        </View>
      </>
    );
  }

  return (
    <GestureHandlerRootView style={styles.app}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.cardBackground} />
        <LanguageProvider>
          <InventoryProvider>
            <NavigationContainer theme={navTheme}>
              <AppNavigator />
            </NavigationContainer>
          </InventoryProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.background },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primaryBlue,
  },
  splashLogo: {
    width: 240,
    height: 72,
  },
});

export default App;
