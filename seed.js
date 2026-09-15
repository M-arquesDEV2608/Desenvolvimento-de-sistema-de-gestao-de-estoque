require('dotenv').config();
const { ready, run, query } = require('./src/database/sqlite');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        await ready;
        console.log('Limpando banco...');

        run('DELETE FROM itens_pedidos');
        run('DELETE FROM pedidos');
        run('DELETE FROM pecas');
        run('DELETE FROM clientes');
        run('DELETE FROM usuarios');

        try {
            run("DELETE FROM sqlite_sequence WHERE name IN ('itens_pedidos','pedidos','pecas','clientes','usuarios')");
        } catch(_) { }

        console.log('Banco limpo');

        const hash = await bcrypt.hash('123456', 10);

        run('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
            ['Administrador', 'admin@email.com', hash, 'Administrador']);
        run('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
            ['Funcionario', 'funcionario@email.com', hash, 'Funcionario']);
        run('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
            ['Gestor', 'gestor@email.com', hash, 'Gestor']);

        console.log('3 usuario criadas');


        const embalagens = [
            ['Plástico','Médio', {P:50}],
            ['Papel e Papelão', 'Pequeno', {P:25}],
            ['Vidro', 'Pequeno', {P:25}],
            ['Metal (Alumínio e Aço)', 'Médio', {P:50}],
            ['Laminadas', 'Médio', {P:50}],
            ['Madeira', 'Grande', {P:100}],
        ];

        for (const [nome, cat, precos] of embalagens) {
            run('INSERT INTO pecas (nome, categoria, precos) VALUES (?, ?, ?)',
                [nome, cat, JSON.stringify(precos)]);
        }
        console.log('6 embalagens criadas')

        console.log('======================================');
        console.log('SEED EXECUTADO COM SUCESSO!');
        console.log('======================================');
        console.log('Login: admin@email.com | Senha: 123456');
        console.log('======================================');
    } catch (err) {
        console.error('ERRO NO SEED:', err);
    }
}

seed();