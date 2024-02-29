let urlPrincipal;

// Função para validar a obrigatoriedade de cada parâmetro
const validateParameters = async (contextxRequest, request) => {
  const parameters = request.parameters;

  const requiredParameters = [];

  for (let i = 0; i < parameters.length; i++) {
    module.exports.requestHooks = [
      (context) => {
        context.request.removeParameter(parameters[i].name);
      },
    ];

    const response = await contextxRequest.network.sendRequest(request);

    if (response.statusCode > 399 && response.statusCode < 500) {
      requiredParameters.push(parameters[i].name);
    }

    module.exports.requestHooks = [
      (context) => {
        context.request.setParameter(parameters[i].name, parameters[i].value);
      },
    ];
  }
  return requiredParameters;
};

const setUrlParameter = (request) => {
    if (urlPrincipal != "") {
      this.urlPrincipal = request.url;
    }
};

//subistitui variavel por valor
const replaceHost = (variavel, request) => {
  var url = request;
  const regex = /\{\{(.*?)\}\}/g;
  return url.replace(regex, variavel);
};

//identifica quais campos sao obrigatorios
const addRequiredParamColumn = (parameters, requiredParameters) => {
  parameters.forEach((item) => {
    item.obrigatorio = "Não";

    if (requiredParameters.includes(item.name)) {
      item.obrigatorio = "Sim";
    }
  });

  return parameters;
};

//adiciona coluna de descricao
const addDescriptionParamColumn = (parameters) => {
  parameters.forEach((element) => {
    element.descricao = "Descricao do campo explicando sua funcionalidade";
  });
};

//remove parametros obrigatorios
const removeDuplicatedParameters = (arrayDeObjetos) => {
  const chavesVistas = new Set();
  const arraySemDuplicatas = [];

  for (const objeto of arrayDeObjetos) {
    // Verificar cada chave do objeto
    const chavesObjeto = Object.keys(objeto);

    // Verificar se há alguma chave duplicada
    const chaveDuplicada = chavesObjeto.some((chave) =>
      chavesVistas.has(chave)
    );

    if (!chaveDuplicada) {
      // Adicionar as chaves do objeto ao conjunto
      chavesObjeto.forEach((chave) => chavesVistas.add(chave));

      // Adicionar o objeto ao novo array
      arraySemDuplicatas.push(objeto);
    }
  }

  return arraySemDuplicatas;
};

// Função para gerar uma tabela Markdown
const generateTable = (items, columns) => {
  let table = `| ${columns.join(" | ")} | <br> | ${"------ | ".repeat(
    columns.length
  )} <br>`;

  items.forEach((item) => {
    table += `| ${columns
      .map((column) => item[removerCaracteresEspeciais(column)])
      .join(" | ")} | <br>`;
  });

  return table;
};

//remove caracteres especiais para conseguir adicionar valores conforme nome da coluna
const removerCaracteresEspeciais = (str) => {
  // Normaliza a string para remover acentos e caracteres especiais
  const stringNormalizada = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Remove todos os caracteres que não são letras ou números
  const stringSemEspeciais = stringNormalizada.replace(/[^\w\s]/gi, "");

  return stringSemEspeciais;
};

// Função para gerar a string HTML para a caixa de diálogo
const generateHtml = (request, endpoint, headers, parametros, body) => {
  let parametrosSection = "";
  let bodySection = "";

  if (parametros != "") {
    parametrosSection = `## Filtros: <br> ${parametros}  <br><br>`;
  }
  if (body != "") {
    bodySection = `## Body: <br> \`\`\`json <br> ${body} <br> \`\`\` <br><br>`;
  }

  return `
        ### Descricao do endpoint detalhando quais dados são retornados ou operações que ele realiza  <br><br>
        ## Url completa: <br> ${this.urlPrincipal}. <br><br>
        ## Endpoint: <br> ${endpoint}. <br><br>
        ## Method: <br> ${request.method}. <br><br>
        ## Headers: <br> ${headers}  <br>
        ${parametrosSection}
        ${bodySection}
        ## Examples: <br> \`\`\` \`\`\`  <br>
    `;
};

const getVariableName = (value) => {
  const regex = /\{\{(.*?)\}\}/;
  let chave;

  if (value.match(regex) != null) {
    chave = value.match(regex)[1];
  }

  return chave;
};

// Função principal para gerar a caixa de diálogo Readme
const generateReadmeDialog = async (contextxRequest, data) => {
  const { request } = data;
  this.urlPrincipal = request.url
  let requiredParameters = [];
  let parametrosTable = "";
  let body = "";

  if (request.method == "GET") {
    requiredParameters = addRequiredParamColumn(
      request.parameters,
      await validateParameters(contextxRequest, request)
    );

    addDescriptionParamColumn(requiredParameters);

    parametrosTable = generateTable(requiredParameters, [
      "name",
      "value",
      "descrição",
      "obrigatório",
    ]);
  }

  if (request.method == "POST") {
    setUrlParameter(request);
    body = request.body.text;
    console.log(body)
  }

  if (request.method == "PUT") {
    setUrlParameter(request);
    body = request.body.text;
  }

  const regex = /https?:\/\/[^\/]+(\/[^?#]*)/;
  const match = this.urlPrincipal.match(regex);
  const endpoint = match && match[1];

  const headersTable = generateTable(request.headers, ["name", "value"]);

  const html = generateHtml(
    request,
    endpoint,
    headersTable,
    parametrosTable,
    body
  );

  let code = document.createElement("code");
  code.innerHTML = html;
  code.style.userSelect = "all";

  contextxRequest.app.dialog(`Readme`, code);

  this.urlPrincipal = "";
  code = "";
};

//Inicia action do plugin
module.exports.requestActions = [
  {
    label: "Generate Read.me",
    action: generateReadmeDialog,
  },
];
