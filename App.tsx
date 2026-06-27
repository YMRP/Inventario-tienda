import { useEffect } from "react";
import "./global.css"
import { Text, View } from "react-native";
import { initDatabase } from "@/database/initDatabase";
import Login from "@/screens/Login";
import AppNavigator from "@/navigation/AppNavigator";
import { runMigrations } from "@/database/db";
import { seedDatabase } from "@/database/seed";

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
    <>
    <AppNavigator/>
    </>
    
  );
}