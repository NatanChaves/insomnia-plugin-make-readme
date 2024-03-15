# Plugin Insomnia - Readme Maker

## Visão Geral

Readme Maker é um plugin para o Insomnia que transforma requisições e gera READMEs formatados. Além disso, valida parâmetros necessários em requisições GET com base no código de status da resposta.

## Recursos

- **Transformação de Requisições:** Transforme facilmente suas requisições POST, GET, PUT ou DELETE em um README formatado.

- **Validação de Parâmetros:** Valide parâmetros obrigatórios em requisições GET com base no código de status da resposta Bad Request (400).

- **Readme completo por Pasta:** Transforme todas requests de uma pasta em um readme completo pronto para ser usado.

## Instalação

1. Abra o Insomnia.
2. Vá para Preferências > Plugins.
3. Procure por "Readme Maker" e instale-o.

## Uso

### Transformação de Requisições

1. Abra a requisição que deseja transformar.
2. Encontre e execute "Generate Read.me" na barra de ferramentas da request ou da pasta no insomnia.
3. O README transformado será gerado.
4. Automatize o preenchimento das informações de parametros em métodos GET em: C:\Users\Public\Documents\data.json 

### Validação de Parâmetros (Requisições GET)

1. Para requisições GET, o plugin valida automaticamente parâmetros obrigatórios.
2. Verifique o código de status da resposta Bad Request(400) para informações sobre parâmetros ausentes.
3. Atualize sua requisição com os parâmetros necessários. Não deixe parametros desabilitados.
