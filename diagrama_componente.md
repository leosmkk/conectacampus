flowchart LR
subgraph Frontend["Frontend · React"]
Main["«component»<br/>main.jsx<br/>Inicialização do React"]
App["«component»<br/>App.jsx<br/>Estado e seleção de tela"]
Header["«component»<br/>Header.jsx<br/>Navegação"]
Agenda["«component»<br/>AgendaPage.jsx<br/>CRUD de eventos"]
Certificados["«component»<br/>CertificatesPage.jsx<br/>Consulta de certificados"]
Form["«component»<br/>EventoForm.jsx<br/>Cadastro e edição"]
Feedback["«component»<br/>Feedback.jsx<br/>Loading / Error / Success"]
Cliente["«component»<br/>services/api.js<br/>Cliente HTTP"]
end

    REST(("«interface»<br/>API REST<br/>HTTP / JSON"))

    subgraph Backend["Backend · Azure Functions / Node.js"]
        Pesquisar["«component»<br/>pesquisar.js<br/>GET /api/pesquisar"]
        Inserir["«component»<br/>inserir.js<br/>POST /api/inserir"]
        Alterar["«component»<br/>alterar.js<br/>PUT /api/alterar/{id}"]
        Excluir["«component»<br/>excluir.js<br/>DELETE /api/excluir/{id}"]
        Tipo["«component»<br/>collection.js<br/>Validação e seleção de coleção"]
        Dados["«component»<br/>db.js<br/>getDatabase · MongoClient"]
    end

    Mongo[("«database»<br/>MongoDB Atlas<br/>Banco: conectacampus<br/>Coleções: eventos e certificados")]

    Main -.->|"renderiza"| App
    App -.->|"usa"| Header
    App -.->|"tela agenda"| Agenda
    App -.->|"tela certificados"| Certificados
    Agenda -.->|"usa"| Form
    Agenda -.->|"usa"| Feedback
    Certificados -.->|"usa"| Feedback
    Agenda -.->|"CRUD de eventos"| Cliente
    Certificados -.->|"buscarCertificados"| Cliente

    Cliente -.->|"requer"| REST
    Pesquisar -->|"fornece"| REST
    Inserir -->|"fornece"| REST
    Alterar -->|"fornece"| REST
    Excluir -->|"fornece"| REST

    Pesquisar -.->|"getTipo"| Tipo
    Inserir -.->|"getTipo"| Tipo
    Alterar -.->|"getTipo"| Tipo
    Excluir -.->|"getTipo"| Tipo

    Pesquisar -.->|"getDatabase"| Dados
    Inserir -.->|"getDatabase"| Dados
    Alterar -.->|"getDatabase"| Dados
    Excluir -.->|"getDatabase"| Dados
    Dados -.->|"MongoDB Driver"| Mongo

    classDef componente fill:#7dcdeb,stroke:#183744,color:#102630
    classDef banco fill:#d5e8d4,stroke:#82b366,color:#102630
    class Main,App,Header,Agenda,Certificados,Form,Feedback,Cliente,Pesquisar,Inserir,Alterar,Excluir,Tipo,Dados componente
    class Mongo banco
    style REST fill:#7dcdeb,stroke:#183744
    style Frontend fill:#eaf7fc,stroke:#183744
    style Backend fill:#eaf7fc,stroke:#183744