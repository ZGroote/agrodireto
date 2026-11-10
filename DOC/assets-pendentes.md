# Assets pendentes (fornecer)

| Asset | Formato | Onde entra | Placeholder atual |
|---|---|---|---|
| Logo AgroDireto (folha + texto) | SVG, ou PNG @1x/@2x/@3x | `components/Logo.tsx` | Ícone `Leaf` do lucide + texto em Inter |
| Ícone do app | PNG 1024×1024 | `assets/icon.png`, `app.json` | Ícone padrão do template Expo |
| Ícone adaptativo Android (frente, fundo, monocromático) | PNG 1024×1024 | `assets/android-icon-*.png` | Template Expo |
| Splash | PNG | `app.json` (plugin `expo-splash-screen`) | Template Expo |
| Ilustrações do Onboarding (3 por perfil) | SVG ou PNG | `features/compartilhado/onboarding/OnboardingTemplate.tsx` | `ImagePlaceholder` |

Os mockups **não têm mascote**. As fotos que aparecem neles (tomates, sítio, caixas, drone) são conteúdo enviado pelos usuários e virão do Storage do Supabase, por isso não são assets do app.
