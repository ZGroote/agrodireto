import { useState } from 'react';
import { Redirect } from 'expo-router';
import { criarIdLote, type EtapaLote } from './rascunhosLote';
import { rotasAgricultor } from '@/routes';

export function AbrirNovoRascunho({ etapa }: { etapa: EtapaLote }) {
  const [id] = useState(criarIdLote);
  return <Redirect href={rotasAgricultor.rascunhoLote(id, etapa)} />;
}
