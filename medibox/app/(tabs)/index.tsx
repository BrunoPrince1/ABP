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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useTheme } from '@/hooks/useTheme';
import { useMedicationStore } from '@/store/medicationStore';
import { useDeviceStore } from '@/store/deviceStore';
import { MedicationCard } from '@/components/medication/MedicationCard';
import { DeviceStatusCard } from '@/components/device/DeviceStatusCard';
import { FontSizes, Spacing } from '@/constants';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { records, medications, fetchTodayRecords, isLoading } = useMedicationStore();
  const { device, fetchDevice, fetchNotifications, unreadCount } = useDeviceStore();

  useEffect(() => {
    fetchTodayRecords();
    fetchDevice();
    fetchNotifications();
  }, []);

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  // Próximo medicamento pendente
  const nextRecord = records.find((r) => r.status === 'upcoming' || r.status === 'pending');
  const nextMed = nextRecord
    ? medications.find((m) => m.id === nextRecord.medicationId)
    : null;

  const nextTime = nextRecord
    ? new Date(nextRecord.scheduledTime).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>MediBox</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{today}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')}>
          <View>
            <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              fetchTodayRecords();
              fetchDevice();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Status do dispositivo */}
        {device && <DeviceStatusCard device={device} />}

        {/* Próximo medicamento */}
        {nextMed && nextRecord && nextTime && (
          <View style={[styles.nextCard, { backgroundColor: colors.infoBg }]}>
            <Ionicons name="alarm-outline" size={16} color={colors.info} />
            <View style={styles.nextInfo}>
              <Text style={[styles.nextTitle, { color: colors.info }]}>Próximo medicamento</Text>
              <Text style={[styles.nextSub, { color: colors.info }]}>
                {nextMed.name} {nextMed.dosage} · Comp. {nextRecord.compartment} · {nextTime}
              </Text>
            </View>
          </View>
        )}

        {/* Lista de hoje */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Hoje</Text>
          <TouchableOpacity onPress={() => router.push('/medication/new')}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {records.length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Ionicons name="medical-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nenhum medicamento para hoje
            </Text>
            <TouchableOpacity onPress={() => router.push('/medication/new')}>
              <Text style={[styles.emptyAction, { color: colors.primary }]}>
                + Adicionar medicamento
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          records.map((record) => {
            const med = medications.find((m) => m.id === record.medicationId);
            if (!med) return null;
            return (
              <MedicationCard
                key={record.id}
                record={record}
                medication={med}
                onPress={() => router.push(`/medication/${med.id}`)}
              />
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSizes.xl, fontWeight: '700' },
  subtitle: { fontSize: FontSizes.sm, marginTop: 2 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  nextCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 10,
    marginBottom: Spacing.md,
  },
  nextInfo: { flex: 1 },
  nextTitle: { fontSize: FontSizes.sm, fontWeight: '600' },
  nextSub: { fontSize: FontSizes.xs, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  empty: {
    alignItems: 'center',
    padding: Spacing.xxl,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  emptyText: { fontSize: FontSizes.sm },
  emptyAction: { fontSize: FontSizes.sm, fontWeight: '600' },
});
