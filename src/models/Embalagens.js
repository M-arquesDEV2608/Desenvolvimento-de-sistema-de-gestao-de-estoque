const { ready, query, run, get } = require('../database/sqlite');

function formatarEmbalagem(row) {
  if (!row) return null;
  return {
    _id:         row.id,
    id:          row.id,
    nome:        row.nome,
    precos:      (() => { try { return JSON.parse(row.precos || '{}'); } catch { return {}; } })(),
    disponivel:  row.disponivel === 1,
    categoria:   row.categoria,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

const Embalagem = {
  async findAll() {
    await ready;
    return query('SELECT * FROM pecas ORDER BY categoria, nome').map(formatarEmbalagem);
  },

  async findById(id) {
    await ready;
    return formatarEmbalagem(get('SELECT * FROM pecas WHERE id = ?', [id]));
  },

  async create({ nome, precos = {}, disponivel = true, categoria = '' }) {
    await ready;
    const info = run(
      'INSERT INTO pecas (nome, precos, disponivel, categoria) VALUES (?, ?, ?, ?)',
      [nome.trim(), JSON.stringify(precos), disponivel ? 1 : 0, categoria]
    );
    return this.findById(info.lastInsertRowid);
  },

  async update(id, { nome, precos, disponivel, categoria }) {
    await ready;
    const atual = get('SELECT * FROM pecas WHERE id = ?', [id]);
    if (!atual) return null;

    const precosAtuais = JSON.parse(atual.precos || '{}');
    const precosFinal  = precos !== undefined ? precos : precosAtuais;

    run(`
      UPDATE pecas SET
        nome         = ?,
        precos       = ?,
        disponivel   = ?,
        categoria    = ?,
        updated_at   = datetime('now')
      WHERE id = ?
    `, [
      nome         ?? atual.nome,
      JSON.stringify(precosFinal),
      disponivel   !== undefined ? (disponivel ? 1 : 0) : atual.disponivel,
      categoria    ?? atual.categoria,
      id
    ]);

    return this.findById(id);
  },

  async delete(id) {
    await ready;
    const info = run('DELETE FROM pecas WHERE id = ?', [id]);
    return info.changes > 0;
  },
};

module.exports = Embalagem;