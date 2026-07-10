import { useEffect } from "react";
import "./global.css"

import AppNavigator from "@/navigation/AppNavigator";
import { runMigrations } from "@/database/db";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {

  useEffect(()=>{
    async function initialize() {
      console.log("Entro al initialize")
      await runMigrations()

    }
    initialize()
  },[])

  

  
  
  return (
    <SafeAreaProvider>
    <AppNavigator/>
    </SafeAreaProvider>
    
  );
}