import { Tabs } from 'expo-router';
import { House, Leaf, MessageSquare, ReceiptText, User } from 'lucide-react-native';
import { tabBarScreenOptions } from '@agrodireto/ui';

/** Tab bar do Cliente: Início · Ofertas · Pedidos · Mensagens · Perfil (mockup). */
export default function ClienteTabs() {
  return (
    <Tabs screenOptions={tabBarScreenOptions}>
      <Tabs.Screen name="inicio" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="ofertas" options={{ title: 'Ofertas', tabBarIcon: ({ color, size }) => <Leaf color={color} size={size} /> }} />
      <Tabs.Screen name="pedidos" options={{ title: 'Pedidos', tabBarIcon: ({ color, size }) => <ReceiptText color={color} size={size} /> }} />
      <Tabs.Screen name="mensagens" options={{ title: 'Mensagens', tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
