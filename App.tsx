import { useEffect } from "react";
import "./global.css"
import { Text, View } from "react-native";

 
export default function App() {


  
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewisdnd!
      </Text>
      <Text className="bg-blue-400" onPress={()=>{alert("Hola")}}>
        Hola Mundo desde Mi PC 
      </Text>
    </View>

    
  );
}