CREATE TABLE unidade (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE setor (
    id SERIAL PRIMARY KEY,
    unidade_id INT NOT NULL REFERENCES unidade(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sala (
    id SERIAL PRIMARY KEY,
    setor_id INT NOT NULL REFERENCES setor(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    capacidade INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reserva (
    id SERIAL PRIMARY KEY,
    sala_id INT NOT NULL REFERENCES sala(id) ON DELETE CASCADE,
    responsavel VARCHAR(255) NOT NULL,
    data_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valida_horario CHECK (hora_inicio < hora_fim)
);