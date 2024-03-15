class ReadmeGenerator {
  constructor() {
    this.urlPrincipal = "";
    this.data;
  }

  // Função para validar a obrigatoriedade de cada parâmetro
  validateParameters = async (contextxRequest, request) => {
    const parameters = request.parameters.filter(
      (objeto) => objeto.disabled == false
    );

    const requiredParameters = [];

    for (let i = 0; i < parameters.length; i++) {
      module.exports.requestHooks = [
        (context) => {
          context.request.removeParameter(parameters[i].name);
        },
      ];

      const response = await contextxRequest.network.sendRequest(request);

      if (response.statusCode == 400) {
        requiredParameters.push(parameters[i].name);

        module.exports.requestHooks = [
          (context) => {
            context.request.setParameter(
              parameters[i].name,
              parameters[i].value
            );
          },
        ];
      }
    }
    return requiredParameters;
  };

  //define a variável global da url se estiver vazia
  setUrlParameter = (request) => {
    if (this.urlPrincipal != "") {
      this.urlPrincipal = request.url;
    }
  };

  //identifica quais campos sao obrigatorios
  addRequiredParamColumn = (parameters, requiredParameters) => {

    console.log(parameters);
    
    parameters.forEach((item) => {
      item.obrigatorio = "Não";

      if (requiredParameters.includes(item.name)) {
        item.obrigatorio = "Sim";
      }
    });

    return parameters;
  };

  //adiciona coluna de descricao
  addDescriptionParamColumnAndValues = (parameters) => {
    parameters.forEach((element) => {
      element.descricao = this.data[element.name] == undefined ?  "Descricao do campo explicando sua funcionalidade" : this.data[element.name];
    });
  };

  // Função para gerar uma tabela Markdown
  generateTable = (items, columns) => {
    let table = `| ${columns.join(" | ")} | <br> | ${"------ | ".repeat(
      columns.length
    )} <br>`;

    items.forEach((item) => {
      table += `| ${columns
        .map((column) => item[this.removerCaracteresEspeciais(column)])
        .join(" | ")} | <br>`;
    });

    return table;
  };

  //remove caracteres especiais para conseguir adicionar valores conforme nome da coluna
  removerCaracteresEspeciais = (str) => {
    // Normaliza a string para remover acentos e caracteres especiais
    const stringNormalizada = str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Remove todos os caracteres que não são letras ou números
    const stringSemEspeciais = stringNormalizada.replace(/[^\w\s]/gi, "");

    return stringSemEspeciais;
  };

  // Função para gerar a string HTML para a caixa de diálogo
  generateHtml = (request, endpoint, headers, parametros, body) => {
    let parametrosSection = "";
    let bodySection = "";

    if (parametros != "" && request.method == "GET") {
      parametrosSection = `## Filtros: <br> ${parametros}  <br><br>`;
    }

    if (body != "") {
      bodySection = `## Body: <br> \`\`\`json <br> ${body} <br> \`\`\` <br><br>`;
    }

    return `
        #  _${request.method} -  ${endpoint}_ <br>
        ### Descricao do endpoint detalhando quais dados são retornados ou operações que ele realiza  <br><br>
        ## Url completa: <br> ${this.urlPrincipal}. <br><br>
        ## Path: <br> ${endpoint}. <br><br>
        ## Method: <br> ${request.method}. <br><br>
        ## Headers: <br> ${headers}  <br>
        ${parametrosSection}
        ${bodySection}
        ## Examples: <br> \`\`\` \`\`\`  <br>
    `;
  };

  //Definir url corretamente quando está armazenada em uma variável de ambiente
  setUrlByEnvironmentVariable = async (contextxRequest, request) => {
    var variable = this.getVariableName(request.url);
    var path = this.getPathByUrl(request.url);

    module.exports.requestHooks = [
      (context) => {
        this.urlPrincipal =
          context.request.getEnvironmentVariable(variable) + path;
      },
    ];

    if (variable != undefined) {
      const response = await contextxRequest.network.sendRequest(request);
    }
  };

  //retorna nome da variável de ambiente
  getVariableName = (value) => {
    const regex = /\{\{(.*?)\}\}/;
    let chave;

    if (value.match(regex) != null) {
      chave = value.match(regex)[1];
    }
    return chave;
  };

  //Retorna o path da url
  getPathByUrl = (value) => {
    var pattern = /{{([^}]*)}}(.*)/;
    let chave;

    if (value.match(pattern) != null) {
      chave = value.match(pattern)[2];
    }

    return chave;
  };

  // Retorna arquivo fonte com descricao dos campos json
  readJSONFromFile = (filename, callback) => {
    const fs = require("fs");

    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        callback(err, null);
        return;
      }

      try {
        const jsonData = JSON.parse(data);
        callback(null, jsonData);
      } catch (parseError) {
        callback(parseError, null);
      }
    });
  };

  // Função principal para gerar a caixa de diálogo Readme
  generateReadmeDialog = async (contextxRequest, data) => {

    const filename = "C:\\Users\\Public\\Documents\\data.json";
    this.readJSONFromFile(filename, (error, jsonData) => {
      if (error) {
        console.error("Error reading JSON file:", error);
        return;
      }
      this.data = jsonData;
    });

    let request = null;
    let code = document.createElement("code");
    for (let i = 0; i < data.length; i++) {
      request = data[i];

      if (request == undefined) request = data;

      this.urlPrincipal = request.url;
      let requiredParameters = [];
      let parametrosTable = "";
      let body = "";

      if (request.method == "GET") {
        console.log(request.parameters)
        requiredParameters = this.addRequiredParamColumn(
          request.parameters.filter((objeto) => objeto.disabled == false),
          await this.validateParameters(contextxRequest, request)
        );

        this.addDescriptionParamColumnAndValues(requiredParameters);

        parametrosTable = this.generateTable(requiredParameters, [
          "name",
          "value",
          "descrição",
          "obrigatório",
          "Valores esperados",
        ]);
      }
      this.setUrlParameter(request);
      await this.setUrlByEnvironmentVariable(contextxRequest, request);

      if (request.method == "POST" || request.method == "PUT") {
        body = request.body.text;
      }

      const regex = /https?:\/\/[^\/]+(\/[^?#]*)/;
      const match = this.urlPrincipal.match(regex);
      const endpoint = match && match[1];

      const headersTable = this.generateTable(request.headers, [
        "name",
        "value",
      ]);

      let html = this.generateHtml(
        request,
        endpoint,
        headersTable,
        parametrosTable,
        body
      );

      code.innerHTML += html + "<br> <br>";
    }

    code.style.userSelect = "all";
    contextxRequest.app.dialog(`Readme`, code);
  };
}

// Criando uma instância da classe ReadmeGenerator
const readmeGenerator = new ReadmeGenerator();

// Módulo do insomnia para request
module.exports.requestActions = [
  {
    label: "Generate Read.me",
    action: (contextxRequest, data) => {
      const { request } = data;
      let incluirArray = [];
      incluirArray.push(request);
      readmeGenerator.generateReadmeDialog(contextxRequest, incluirArray);
    },
  },
];

//módulo do insomnia para pasta de requests
module.exports.requestGroupActions = [
  {
    label: "Generate Complete Read.me",
    action: async (contextxRequest, data) => {
      const { requests } = data;
      readmeGenerator.generateReadmeDialog(contextxRequest, requests);
    },
  },
];
