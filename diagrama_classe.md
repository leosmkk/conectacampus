classDiagram
direction LR

%% ==================================================
%% DOMAIN
%% ==================================================

namespace Domain {
class Evento {
+ObjectId id
+dados
}

    class Certificado {
        +ObjectId id
        +dados
    }
}

%% ==================================================
%% APPLICATION - VERTICAL SLICE EVENTOS
%% ==================================================

namespace Eventos {
class InserirEvento {
-EventoRepository repository
+execute(dados) Evento
}

    class AlterarEvento {
        -EventoRepository repository
        +execute(id, dados) Evento
    }

    class ExcluirEvento {
        -EventoRepository repository
        +execute(id) void
    }

    class PesquisarEvento {
        -EventoRepository repository
        +execute(id) Evento
        +execute() List~Evento~
    }

    class EventoRepository {
        <<interface>>
        +inserir(evento) Evento
        +alterar(id, dados) Evento
        +excluir(id) void
        +buscarPorId(id) Evento
        +buscarTodos() List~Evento~
    }
}

%% ==================================================
%% APPLICATION - VERTICAL SLICE CERTIFICADOS
%% ==================================================

namespace Certificados {
class InserirCertificado {
-CertificadoRepository repository
+execute(dados) Certificado
}

    class AlterarCertificado {
        -CertificadoRepository repository
        +execute(id, dados) Certificado
    }

    class ExcluirCertificado {
        -CertificadoRepository repository
        +execute(id) void
    }

    class PesquisarCertificado {
        -CertificadoRepository repository
        +execute(id) Certificado
        +execute() List~Certificado~
    }

    class CertificadoRepository {
        <<interface>>
        +inserir(certificado) Certificado
        +alterar(id, dados) Certificado
        +excluir(id) void
        +buscarPorId(id) Certificado
        +buscarTodos() List~Certificado~
    }
}

%% ==================================================
%% INFRASTRUCTURE
%% ==================================================

namespace Infrastructure {
class MongoEventoRepository {
-Database database
+inserir(evento) Evento
+alterar(id, dados) Evento
+excluir(id) void
+buscarPorId(id) Evento
+buscarTodos() List~Evento~
}

    class MongoCertificadoRepository {
        -Database database
        +inserir(certificado) Certificado
        +alterar(id, dados) Certificado
        +excluir(id) void
        +buscarPorId(id) Certificado
        +buscarTodos() List~Certificado~
    }

    class Database {
        -MongoClient client
        -Db database
        +getDatabase() Db
    }
}

%% ==================================================
%% AZURE FUNCTIONS
%% ==================================================

namespace API {
class InserirFunction {
<<Azure Function>>
+handler(request, context)
}

    class AlterarFunction {
        <<Azure Function>>
        +handler(request, context)
    }

    class ExcluirFunction {
        <<Azure Function>>
        +handler(request, context)
    }

    class PesquisarFunction {
        <<Azure Function>>
        +handler(request, context)
    }

    class TipoResolver {
        +TIPOS_PERMITIDOS
        +getTipo(request) String
    }
}

%% ==================================================
%% EVENTOS
%% ==================================================

InserirEvento ..> Evento
AlterarEvento ..> Evento
PesquisarEvento ..> Evento

InserirEvento --> EventoRepository
AlterarEvento --> EventoRepository
ExcluirEvento --> EventoRepository
PesquisarEvento --> EventoRepository

MongoEventoRepository ..|> EventoRepository
MongoEventoRepository --> Database

%% ==================================================
%% CERTIFICADOS
%% ==================================================

InserirCertificado ..> Certificado
AlterarCertificado ..> Certificado
PesquisarCertificado ..> Certificado

InserirCertificado --> CertificadoRepository
AlterarCertificado --> CertificadoRepository
ExcluirCertificado --> CertificadoRepository
PesquisarCertificado --> CertificadoRepository

MongoCertificadoRepository ..|> CertificadoRepository
MongoCertificadoRepository --> Database

%% ==================================================
%% API
%% ==================================================

InserirFunction --> TipoResolver
AlterarFunction --> TipoResolver
ExcluirFunction --> TipoResolver
PesquisarFunction --> TipoResolver

InserirFunction ..> InserirEvento
InserirFunction ..> InserirCertificado

AlterarFunction ..> AlterarEvento
AlterarFunction ..> AlterarCertificado

ExcluirFunction ..> ExcluirEvento
ExcluirFunction ..> ExcluirCertificado

PesquisarFunction ..> PesquisarEvento
PesquisarFunction ..> PesquisarCertificado