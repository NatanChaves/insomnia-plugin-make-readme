module.exports.requestActions = [
  {
    label: "Generate Read.me",
    action: async (contextxRequest, data) => {
      const { request } = data;
      const parameters = request.parameters;
      const requiredParameters = [];

      //Validar obrigatoriedade de cada parametro
      for (let i = 0; i < request.parameters.length; i++) {
        module.exports.requestHooks = [
          (context) => {
            //remove parametro para testar se é obrigatório
            context.request.removeParameter(parameters[i].name);
          },
        ];

        //envia request
        const response = await contextxRequest.network.sendRequest(request);

        //valida se é obrigatório de acordo com statuscode do response
        if (response.statusCode > 399 && response.statusCode < 500) {
          requiredParameters.push(parameters[i].name);
        }
      };

      //regex para extrair path do endpoint:
      const regex = /https?:\/\/[^\/]+(\/[^?#]*)/;
      const match = request.url.match(regex);
      const endpoint = match && match[1];

      //define parametros
      var parametros = `| Nome | Valor | Descrição | Obrigatório? | <br> | ------ | ------ | ------ | ------ | <br>`;
      parameters.forEach((item) => {
        var obrigatorio = 'Não';

        if (requiredParameters.includes(item.name)) {
          obrigatorio = 'Sim'
        }
        parametros += `| ${item.name} | ${item.value} | Sua descrição do campo | ${obrigatorio} | <br>`;
      });

      //define headers
      var headers = `| Header | Valor | <br> | ------ | ------ | <br>`;
      request.headers.forEach((item) => {
        headers += `| ${item.name} | ${item.value} | <br>`;
      });

      const html = `
        ### Descricao do endpoint detalhando quais dados são retornados ou operações que ele realiza  <br><br>
        ## Url completa: <br> ${request.url}. <br><br>
        ## Endpoint: <br> ${endpoint}. <br><br>
        ## Method: <br> ${request.method}. <br><br>
        ## Headers: <br> ${headers}  <br>
        ## Filtros: <br> ${parametros}  <br><br>
        ## Examples: <br> \`\`\` \`\`\`  <br>
      `;

      const code = document.createElement("code");
      code.innerHTML = html;
      code.style.userSelect = "all";

      contextxRequest.app.dialog(`Readme`, code);
    },
  },
];
