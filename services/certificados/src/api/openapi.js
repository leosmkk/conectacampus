// Gerado por scripts/generate-openapi.mjs
export const specification = {
  "openapi": "3.0.3",
  "info": {
    "title": "ConectaCampus Certificados Azure SQL",
    "version": "2.0.0"
  },
  "servers": [
    {
      "url": "/"
    }
  ],
  "paths": {
    "/certificados": {
      "get": {
        "tags": [
          "certificados"
        ],
        "summary": "Listar até 1000 registros",
        "responses": {
          "200": {
            "description": "Lista",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Certificado"
                  }
                }
              }
            }
          },
          "400": {
            "description": "Dados inválidos"
          },
          "401": {
            "description": "Não autorizado"
          },
          "404": {
            "description": "Não encontrado"
          },
          "500": {
            "description": "Falha interna"
          }
        }
      },
      "post": {
        "tags": [
          "certificados"
        ],
        "summary": "Criar",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Certificado"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Criado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Certificado"
                }
              }
            }
          },
          "400": {
            "description": "Dados inválidos"
          },
          "401": {
            "description": "Não autorizado"
          },
          "404": {
            "description": "Não encontrado"
          },
          "500": {
            "description": "Falha interna"
          }
        }
      }
    },
    "/certificados/{id}": {
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "string",
            "format": "uuid"
          }
        }
      ],
      "get": {
        "tags": [
          "certificados"
        ],
        "summary": "Consultar",
        "responses": {
          "200": {
            "description": "Registro",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Certificado"
                }
              }
            }
          },
          "400": {
            "description": "Dados inválidos"
          },
          "401": {
            "description": "Não autorizado"
          },
          "404": {
            "description": "Não encontrado"
          },
          "500": {
            "description": "Falha interna"
          }
        }
      },
      "put": {
        "tags": [
          "certificados"
        ],
        "summary": "Substituir campos editáveis",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Certificado"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Atualizado",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Certificado"
                }
              }
            }
          },
          "400": {
            "description": "Dados inválidos"
          },
          "401": {
            "description": "Não autorizado"
          },
          "404": {
            "description": "Não encontrado"
          },
          "500": {
            "description": "Falha interna"
          }
        }
      },
      "delete": {
        "tags": [
          "certificados"
        ],
        "summary": "Excluir",
        "responses": {
          "204": {
            "description": "Excluído"
          },
          "400": {
            "description": "Dados inválidos"
          },
          "401": {
            "description": "Não autorizado"
          },
          "404": {
            "description": "Não encontrado"
          },
          "500": {
            "description": "Falha interna"
          }
        }
      }
    },
    "/events": {
      "get": {
        "tags": [
          "Eventos de domínio"
        ],
        "summary": "Consultar outbox e publicação assíncrona",
        "responses": {
          "200": {
            "description": "Eventos",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string"
                      },
                      "event": {
                        "$ref": "#/components/schemas/DomainEvent"
                      },
                      "publishedAt": {
                        "type": "string",
                        "nullable": true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Evento": {
        "type": "object",
        "required": [
          "title",
          "org",
          "dateLabel",
          "time",
          "place",
          "seatsUsed",
          "seatsTotal"
        ],
        "properties": {
          "title": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          },
          "org": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          },
          "dateLabel": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          },
          "time": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          },
          "place": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          },
          "seatsUsed": {
            "type": "integer",
            "minimum": 0
          },
          "seatsTotal": {
            "type": "integer",
            "minimum": 1
          },
          "order": {
            "type": "integer",
            "minimum": 0
          },
          "status": {
            "type": "string",
            "enum": [
              "vagas",
              "lotado",
              "inscrito"
            ]
          }
        }
      },
      "Certificado": {
        "type": "object",
        "required": [
          "title",
          "student",
          "completedAt",
          "hours"
        ],
        "properties": {
          "title": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          },
          "student": {
            "type": "string",
            "minLength": 1,
            "maxLength": 200
          },
          "completedAt": {
            "type": "string",
            "format": "date"
          },
          "hours": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000
          },
          "status": {
            "type": "string",
            "enum": [
              "disponivel",
              "emitido"
            ]
          }
        }
      },
      "DomainEvent": {
        "type": "object",
        "required": [
          "id",
          "type",
          "version",
          "subject",
          "occurredAt",
          "data"
        ],
        "properties": {
          "id": {
            "type": "string",
            "format": "uuid"
          },
          "type": {
            "type": "string",
            "enum": [
              "certificate.created",
              "certificate.updated",
              "certificate.deleted"
            ]
          },
          "version": {
            "type": "integer",
            "enum": [
              1
            ]
          },
          "subject": {
            "type": "string",
            "format": "uuid"
          },
          "occurredAt": {
            "type": "string",
            "format": "date-time"
          },
          "data": {
            "type": "object",
            "properties": {
              "certificateId": {
                "type": "string",
                "format": "uuid"
              },
              "hours": {
                "type": "integer"
              }
            }
          }
        }
      }
    },
    "securitySchemes": {
      "serviceToken": {
        "type": "apiKey",
        "in": "header",
        "name": "x-service-token"
      }
    }
  },
  "security": [
    {
      "serviceToken": []
    }
  ]
};
