import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useDeviceStore } from '@/store/deviceStore';

export default function TabsLayout() {
  const { colors } = useTheme();
  const unreadCount = useDeviceStore((s) => s.unreadCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index"         options={{ title: 'Início',      tabBarIcon: ({ color, size }) => <Ionicons name="home-outline"            size={size} color={color} /> }} />
      <Tabs.Screen name="medications"   options={{ title: 'Remédios',    tabBarIcon: ({ color, size }) => <Ionicons name="medical-outline"         size={size} color={color} /> }} />
      <Tabs.Screen name="history"       options={{ title: 'Histórico',   tabBarIcon: ({ color, size }) => <Ionicons name="time-outline"            size={size} color={color} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alertas',     tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline"  size={size} color={color} />, tabBarBadge: unreadCount > 0 ? unreadCount : undefined }} />
      <Tabs.Screen name="device"        options={{ title: 'Dispositivo', tabBarIcon: ({ color, size }) => <Ionicons name="hardware-chip-outline"  size={size} color={color} /> }} />
      <Tabs.Screen name="profile"       options={{ title: 'Perfil',      tabBarIcon: ({ color, size }) => <Ionicons name="person-outline"         size={size} color={color} /> }} />
    </Tabs>
  );
}
