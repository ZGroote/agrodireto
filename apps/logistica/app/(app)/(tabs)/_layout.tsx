import { Tabs } from 'expo-router';
import { CalendarDays, House, MessageSquare, Truck, User } from 'lucide-react-native';
import { tabBarScreenOptions } from '@agrodireto/ui';

/** Tab bar da Logística: Início · Cargas · Agenda · Mensagens · Perfil (mockup). */
export default function LogisticaTabs() {
  return (
    <Tabs screenOptions={tabBarScreenOptions}>
      <Tabs.Screen name="inicio" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="cargas" options={{ title: 'Cargas', tabBarIcon: ({ color, size }) => <Truck color={color} size={size} /> }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }} />
      <Tabs.Screen name="mensagens" options={{ title: 'Mensagens', tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
