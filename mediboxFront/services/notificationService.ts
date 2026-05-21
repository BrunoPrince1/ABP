import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from './api';

// Configuração de como as notificações aparecem com o app em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Pede permissão e registra o push token no backend
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('[Push] Notificações só funcionam em dispositivo físico');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Push] Permissão de notificação negada');
      return null;
    }

    // Android precisa de canal
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medibox', {
        name: 'MediBox Alertas',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0F6E56',
        sound: 'default',
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.warn('[Push] projectId não configurado no app.json');
      return null;
    }

    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('[Push] Token:', pushToken);

    // Salva o token no backend para que o servidor possa enviar push
    try {
      await api.post('/auth/push-token', { token: pushToken });
    } catch {
      // não crítico
    }

    return pushToken;
  },

  // Agenda uma notificação local (útil para alertas no horário do remédio)
  async scheduleLocalAlert(
    title: string,
    body: string,
    triggerDate: Date,
  ): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { type: 'medication_alert' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });
    return id;
  },

  // Cancela todas as notificações agendadas (ao reconfigurar horários)
  async cancelAllScheduled(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Limpa o badge do ícone do app
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  },
};
