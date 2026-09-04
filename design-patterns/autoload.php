<?php

/**
 * Autoload PSR-4 manual (namespace ConectaCampus\ -> src/), sem
 * depender de `composer install`. O Demo.php roda com apenas
 * `require __DIR__ . '/autoload.php'`.
 */
spl_autoload_register(function (string $classe): void {
    $prefixo = 'ConectaCampus\\';

    if (strncmp($prefixo, $classe, strlen($prefixo)) !== 0) {
        return;
    }

    $caminhoRelativo = substr($classe, strlen($prefixo));
    $caminhoRelativo = str_replace('\\', DIRECTORY_SEPARATOR, $caminhoRelativo);
    $arquivo = __DIR__ . DIRECTORY_SEPARATOR . 'src' . DIRECTORY_SEPARATOR . $caminhoRelativo . '.php';

    if (is_file($arquivo)) {
        require $arquivo;
    }
});
