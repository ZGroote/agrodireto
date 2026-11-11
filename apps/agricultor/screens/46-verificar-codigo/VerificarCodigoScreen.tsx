import { Redirect } from 'expo-router';
import { rotasAgricultor } from '@/routes';
export default function VerificarCodigoScreen() { return <Redirect href={rotasAgricultor.entrar} />; }
