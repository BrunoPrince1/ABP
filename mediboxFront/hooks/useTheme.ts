import { useColorScheme } from 'react-native';
import { Colors, ColorsDark } from '@/constants';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? ColorsDark : Colors;

  return { colors, isDark };
}
