export const documentosCadastro = [
  { id: 'identificacao', titulo: 'Identificação (RG ou CNH)' },
  { id: 'fitossanitario', titulo: 'Certificado fitossanitário' },
] as const;

export const tiposDocumento = [
  ...documentosCadastro.map(({ titulo }) => titulo),
  'Comprovante da propriedade',
  'Outro',
];
