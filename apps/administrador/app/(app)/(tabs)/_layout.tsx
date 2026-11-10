import { Tabs } from 'expo-router';
import { Bell, Box, House, MonitorDot, User } from 'lucide-react-native';
import { tabBarScreenOptions } from '@agrodireto/ui';

/** Tab bar do Administrador: Início · Operação · Cadastros · Alertas · Perfil (mockup). */
export default function AdministradorTabs() {
  return (
    <Tabs screenOptions={tabBarScreenOptions}>
      <Tabs.Screen name="inicio" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="operacao" options={{ title: 'Operação', tabBarIcon: ({ color, size }) => <MonitorDot color={color} size={size} /> }} />
      <Tabs.Screen name="cadastros" options={{ title: 'Cadastros', tabBarIcon: ({ color, size }) => <Box color={color} size={size} /> }} />
      <Tabs.Screen name="alertas" options={{ title: 'Alertas', tabBarIcon: ({ color, size }) => <Bell color={color} size={size} /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
