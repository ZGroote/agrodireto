import { Tabs } from 'expo-router';
import { Bell, Box, House, MonitorDot, User } from 'lucide-react-native';
import { tabBarScreenOptions } from '@agrodireto/ui';
import { usePode } from '@/components/PapelEquipe';

/** Tab bar do Administrador: Início · Operação · Cadastros · Alertas · Perfil (mockup). */
export default function AdministradorTabs() {
  // Abas sem permissão somem (href null); Operação e Alertas ainda não chamam o servidor, então só o geral (B05).
  const semAcao = usePode()('sem_acao_no_servidor') ? undefined : null;
  return (
    <Tabs screenOptions={tabBarScreenOptions}>
      <Tabs.Screen name="inicio" options={{ title: 'Início', tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="operacao" options={{ href: semAcao, title: 'Operação', tabBarIcon: ({ color, size }) => <MonitorDot color={color} size={size} /> }} />
      <Tabs.Screen name="cadastros" options={{ title: 'Cadastros', tabBarIcon: ({ color, size }) => <Box color={color} size={size} /> }} />
      <Tabs.Screen name="alertas" options={{ href: semAcao, title: 'Alertas', tabBarIcon: ({ color, size }) => <Bell color={color} size={size} /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
