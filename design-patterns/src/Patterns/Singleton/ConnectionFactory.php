<?php

namespace ConectaCampus\Patterns\Singleton;

use PDO;
use PDOException;

/**
 * SINGLETON (exemplo 2/2)
 *
 * Fábrica de uma única conexão PDO compartilhada por toda a aplicação.
 * Abrir uma conexão por requisição repetida seria desperdício de
 * recursos; o Singleton garante que só existe uma instância, criada
 * sob demanda (lazy) na primeira vez que alguém pedir a conexão.
 *
 * A conexão NÃO é aberta no construtor: assim, mesmo num ambiente sem
 * o driver do banco configurado, instanciar/obter o singleton nunca
 * derruba a aplicação — só getConnection() pode falhar, e falha de
 * forma silenciosa e consultável via getErro()/estaConectado().
 */
class ConnectionFactory
{
    /** @var ConnectionFactory|null */
    private static $instance = null;

    /** @var PDO|null */
    private $pdo = null;

    /** @var string|null */
    private $erro = null;

    /** @var bool */
    private $tentouConectar = false;

    private function __construct()
    {
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function getConnection(): ?PDO
    {
        if (!$this->tentouConectar) {
            $this->conectar();
        }

        return $this->pdo;
    }

    public function estaConectado(): bool
    {
        return $this->pdo !== null;
    }

    public function getErro(): ?string
    {
        return $this->erro;
    }

    public function getDsn(): string
    {
        $driver = getenv('DB_DRIVER') ?: 'mysql';
        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $dbname = getenv('DB_NAME') ?: 'conectacampus';

        return sprintf('%s:host=%s;dbname=%s', $driver, $host, $dbname);
    }

    private function conectar(): void
    {
        $this->tentouConectar = true;

        try {
            $this->pdo = new PDO(
                $this->getDsn(),
                getenv('DB_USER') ?: 'root',
                getenv('DB_PASS') ?: ''
            );
        } catch (PDOException $e) {
            $this->pdo = null;
            $this->erro = $e->getMessage();
        }
    }

    private function __clone()
    {
    }

    public function __wakeup()
    {
        throw new \Exception('Não é permitido desserializar um Singleton.');
    }
}
