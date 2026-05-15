import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useTheme } from '@/hooks/useTheme';
import { useDeviceStore } from '@/store/deviceStore';
import { FontSizes, Spacing, Radius } from '@/constants';
import type { AppNotification } from '@/types';

const typeConfig: Record<AppNotification['type'], { icon: any; color: string }> = {
  missed:         { icon: 'warning-outline',         color: '#E24B4A' },
  taken:          { icon: 'checkmark-circle-outline', color: '#639922' },
  device_offline: { icon: 'wifi-off-outline',         color: '#854F0B' },
  low_battery:    { icon: 'battery-dead-outline',     color: '#854F0B' },
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { notifications, fetchNotifications, markAllRead, markRead } = useDeviceStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Notificações</Text>
        {hasUnread && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={[styles.markAll, { color: colors.primary }]}>Marcar todas lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Nenhuma notificação
            </Text>
          </View>
        ) : (
          notifications.map((notif) => {
            const tc = typeConfig[notif.type];
            const timeAgo = formatDistanceToNow(new Date(notif.createdAt), {
              locale: ptBR,
              addSuffix: true,
            });

            return (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.item,
                  {
                    backgroundColor: notif.read ? colors.surface : colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => markRead(notif.id)}
                activeOpacity={0.7}
              >
                {/* Dot de não lida */}
                {!notif.read && (
                  <View style={[styles.unreadDot, { backgroundColor: colors.danger }]} />
                )}

                <Ionicons name={tc.icon} size={20} color={tc.color} />

                <View style={styles.info}>
                  <Text style={[styles.notifTitle, { color: colors.textPrimary }]}>
                    {notif.title}
                  </Text>
                  <Text style={[styles.notifBody, { color: colors.textSecondary }]}>
                    {notif.body}
                  </Text>
                  <Text style={[styles.notifTime, { color: colors.textMuted }]}>{timeAgo}</Text>
                </View>
              </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: { fontSize: FontSizes.xl, fontWeight: '700' },
  markAll: { fontSize: FontSizes.sm, fontWeight: '500' },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  info: { flex: 1 },
  notifTitle: { fontSize: FontSizes.sm, fontWeight: '600' },
  notifBody: { fontSize: FontSizes.xs, marginTop: 2, lineHeight: 16 },
  notifTime: { fontSize: FontSizes.xs, marginTop: 4 },
  empty: { alignItems: 'center', gap: Spacing.sm, marginTop: 60 },
  emptyText: { fontSize: FontSizes.sm },
});
