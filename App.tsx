import { useEffect } from "react";
import "./global.css"

import AppNavigator from "@/navigation/AppNavigator";
import { runMigrations } from "@/database/db";
import { seedDatabase } from "@/database/seed";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {

  useEffect(()=>{
    async function initialize() {
      console.log("Entro al initialize")
      await runMigrations()
      console.log("A punto de entrar a seedDatabase")
      await seedDatabase()
      console.log("paso de seeddatabase")
    }
    initialize()
  },[])

  

  
  
  return (
    <SafeAreaProvider>
    <AppNavigator/>
    </SafeAreaProvider>
    
  );
}