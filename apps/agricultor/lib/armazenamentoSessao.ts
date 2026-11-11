import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const armazenamentoSessao = Platform.OS === 'web' ? undefined : {
  getItem: (chave: string) => SecureStore.getItemAsync(chave),
  setItem: (chave: string, valor: string) => SecureStore.setItemAsync(chave, valor),
  removeItem: (chave: string) => SecureStore.deleteItemAsync(chave),
};

export function acompanharSessao(cliente: { auth: { startAutoRefresh(): void; stopAutoRefresh(): void } }) {
  if (Platform.OS === 'web') return;
  if (AppState.currentState === 'active') cliente.auth.startAutoRefresh();
  AppState.addEventListener('change', (estado) => {
    if (estado === 'active') cliente.auth.startAutoRefresh();
    else cliente.auth.stopAutoRefresh();
  });
}
