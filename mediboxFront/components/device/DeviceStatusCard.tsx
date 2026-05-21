import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { FontSizes, Radius, Spacing } from '@/constants';
import type { DeviceStatus } from '@/types';

interface DeviceStatusCardProps {
  device: DeviceStatus;
}

const signalIcon: Record<DeviceStatus['signalStrength'], string> = {
  weak: 'cellular-outline',
  medium: 'cellular',
  strong: 'wifi',
};

export function DeviceStatusCard({ device }: DeviceStatusCardProps) {
  const { colors } = useTheme();

  const bg = device.isOnline ? '#E1F5EE' : '#FCEBEB';
  const textColor = device.isOnline ? '#0F6E56' : '#A32D2D';
  const iconName = device.isOnline ? (signalIcon[device.signalStrength] as any) : 'wifi-off-outline';

  const syncTime = new Date(device.lastSync).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      <Ionicons name={iconName} size={18} color={textColor} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: textColor }]}>
          {device.isOnline ? 'Dispositivo conectado' : 'Dispositivo offline'}
        </Text>
        <Text style={[styles.sub, { color: textColor }]}>
          Última sync: {syncTime} · Bateria: {device.batteryLevel}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  sub: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
});
