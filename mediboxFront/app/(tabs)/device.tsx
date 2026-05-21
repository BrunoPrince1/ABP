import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/useTheme';
import { useDeviceStore } from '@/store/deviceStore';
import { FontSizes, Spacing, Radius } from '@/constants';

export default function DeviceScreen() {
  const { colors } = useTheme();
  const { device, fetchDevice, isLoading } = useDeviceStore();

  useEffect(() => {
    fetchDevice();
  }, []);

  const batteryIcon =
    (device?.batteryLevel ?? 100) > 60
      ? 'battery-full-outline'
      : (device?.batteryLevel ?? 100) > 30
      ? 'battery-half-outline'
      : 'battery-dead-outline';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Dispositivo</Text>
        {device && (
          <View style={[styles.onlineBadge, { backgroundColor: device.isOnline ? '#EAF3DE' : '#FCEBEB' }]}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: device.isOnline ? '#3B6D11' : '#A32D2D' }}>
              {device.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchDevice} tintColor={colors.primary} />
        }
      >
        {!device ? (
          <View style={styles.empty}>
            <Ionicons name="hardware-chip-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nenhum dispositivo encontrado
            </Text>
          </View>
        ) : (
          <>
            {/* Info card */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Row label="ID" value={device.id} colors={colors} />
              <Row label="Nome" value={device.name} colors={colors} />
              <Row label="Firmware" value={device.firmwareVersion} colors={colors} />
              <Row
                label="Última sync"
                value={new Date(device.lastSync).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                colors={colors}
              />
              <Row
                label="Bateria"
                value={`${device.batteryLevel}%`}
                colors={colors}
                valueColor={device.batteryLevel < 20 ? colors.danger : undefined}
                icon={batteryIcon}
              />
            </View>

            {/* Compartimentos */}
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Compartimentos
            </Text>
            <View style={styles.grid}>
              {device.compartments.map((comp) => {
                const isEmpty = !comp.medicationId;
                const bg = comp.isOpen
                  ? '#EAF3DE'
                  : isEmpty
                  ? colors.surface
                  : colors.surfaceAlt;
                const borderColor = comp.isOpen
                  ? '#C0DD97'
                  : colors.border;
                const textColor = comp.isOpen
                  ? '#3B6D11'
                  : isEmpty
                  ? colors.textMuted
                  : colors.textPrimary;

                return (
                  <View
                    key={comp.number}
                    style={[styles.compCell, { backgroundColor: bg, borderColor }]}
                  >
                    <Ionicons
                      name={comp.isOpen ? 'lock-open-outline' : isEmpty ? 'add-outline' : 'lock-closed-outline'}
                      size={20}
                      color={textColor}
                    />
                    <Text style={[styles.compNumber, { color: textColor }]}>Comp. {comp.number}</Text>
                    {comp.medicationName && (
                      <Text style={[styles.compMed, { color: textColor }]} numberOfLines={1}>
                        {comp.medicationName.split(' ')[0]}
                      </Text>
                    )}
                    {isEmpty && (
                      <Text style={[styles.compMed, { color: textColor }]}>Vazio</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  colors,
  valueColor,
  icon,
}: {
  label: string;
  value: string;
  colors: any;
  valueColor?: string;
  icon?: any;
}) {
  return (
    <View style={rowStyles.row}>
      <Text style={[rowStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {icon && <Ionicons name={icon} size={14} color={valueColor ?? colors.textPrimary} />}
        <Text style={[rowStyles.value, { color: valueColor ?? colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  label: { fontSize: FontSizes.xs },
  value: { fontSize: FontSizes.xs, fontWeight: '500' },
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSizes.xl, fontWeight: '700' },
  onlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  card: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  compCell: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 4,
    minHeight: 80,
  },
  compNumber: { fontSize: FontSizes.xs, fontWeight: '600' },
  compMed: { fontSize: 10, textAlign: 'center' },
  empty: { alignItems: 'center', gap: Spacing.sm, marginTop: 60 },
  emptyText: { fontSize: FontSizes.sm },
});
