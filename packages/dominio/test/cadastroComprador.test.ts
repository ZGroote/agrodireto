import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { cnpjValido, normalizarCnpj } from '../index.ts';

describe('CNPJ do comprador', () => {
  it('aceita CNPJ numérico e alfanumérico válidos, com ou sem pontuação', () => {
    assert.equal(cnpjValido('11.222.333/0001-81'), true);
    assert.equal(cnpjValido('11222333000181'), true);
    assert.equal(cnpjValido('12.ABC.345/01DE-35'), true);
    assert.equal(cnpjValido('12abc34501de35'), true);
  });
  it('recusa dígito verificador errado, repetição e tamanho inválido', () => {
    assert.equal(cnpjValido('11222333000182'), false);
    assert.equal(cnpjValido('12ABC34501DE36'), false);
    assert.equal(cnpjValido('11111111111111'), false);
    assert.equal(cnpjValido('1122233300018'), false);
    assert.equal(cnpjValido('12ABC34501DEAB'), false);
  });
  it('normaliza como o banco grava', () => {
    assert.equal(normalizarCnpj('12.abc.345/01de-35'), '12ABC34501DE35');
  });
});
