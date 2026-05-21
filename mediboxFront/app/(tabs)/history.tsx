import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useTheme } from '@/hooks/useTheme';
import { useMedicationStore } from '@/store/medicationStore';
import { FontSizes, Spacing, Radius } from '@/constants';
import type { RecordStatus } from '@/types';

const statusConfig: Record<RecordStatus, { color: string; icon: any; label: string }> = {
  taken:    { color: '#639922', icon: 'checkmark-circle',    label: 'Tomado'     },
  missed:   { color: '#E24B4A', icon: 'close-circle',        label: 'Não tomado' },
  pending:  { color: '#EF9F27', icon: 'time',                label: 'Pendente'   },
  upcoming: { color: '#378ADD', icon: 'ellipse-outline',     label: 'Agendado'   },
};

export default function HistoryScreen() {
  const { colors } = useTheme();
  const { records, fetchTodayRecords } = useMedicationStore();

  useEffect(() => {
    fetchTodayRecords();
  }, []);

  // Agrupa registros por data
  const grouped: Record<string, typeof records> = {};
  records.forEach((r) => {
    const day = format(new Date(r.scheduledTime), "yyyy-MM-dd");
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(r);
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Histórico</Text>
        <Ionicons name="calendar-outline" size={22} color={colors.textSecondary} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {Object.keys(grouped)
          .sort((a, b) => b.localeCompare(a))
          .map((day) => {
            const dayLabel = format(new Date(day), "EEEE, d 'de' MMMM", { locale: ptBR });
            const dayRecords = grouped[day];

            return (
              <View key={day}>
                <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                  {dayLabel}
                </Text>
                <View style={[styles.timeline, { borderColor: colors.border }]}>
                  {dayRecords.map((record, idx) => {
                    const sc = statusConfig[record.status];
                    const time = new Date(record.scheduledTime).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const takenTime = record.takenAt
                      ? new Date(record.takenAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : null;

                    return (
                      <View
                        key={record.id}
                        style={[
                          styles.item,
                          idx < dayRecords.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
                        ]}
                      >
                        {/* Dot */}
                        <Ionicons name={sc.icon} size={16} color={sc.color} />

                        {/* Info */}
                        <View style={styles.itemInfo}>
                          <Text style={[styles.itemName, { color: colors.textPrimary }]}>
                            {record.medicationName}
                          </Text>
                          <Text style={[styles.itemMeta, { color: colors.textSecondary }]}>
                            {sc.label}
                            {takenTime ? ` às ${takenTime}` : ` · Agendado: ${time}`}
                            {record.notifiedResponsible ? ' · Responsável notificado' : ''}
                          </Text>
                        </View>

                        {/* Horário */}
                        <Text style={[styles.itemTime, { color: colors.textMuted }]}>{time}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}

        {records.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nenhum registro ainda
            </Text>
          </View>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSizes.xl, fontWeight: '700' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  dayLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  timeline: {
    borderRadius: Radius.md,
    borderWidth: 0.5,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSizes.sm, fontWeight: '500' },
  itemMeta: { fontSize: FontSizes.xs, marginTop: 2 },
  itemTime: { fontSize: FontSizes.xs },
  empty: { alignItems: 'center', gap: Spacing.sm, marginTop: 60 },
  emptyText: { fontSize: FontSizes.sm },
});
