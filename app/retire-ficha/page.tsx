"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./RetireFicha.module.css";

interface Especialidade {
  id: number;
  nome: string;
  tempo_espera: string;
}

export default function RetireFicha() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: "",
    idade: "",
    cpf: "",
    alergia: "",
    atendimento: "",
    convenio: "",
    acompanhante: "",
    tempo_entrada: "",
    tempo_saida: "",
    id_especialidade: "",
  });
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const fetchEspecialidades = async () => {
    try {
      const response = await fetch('https://api-tcc-node-js-1.onrender.com/v1/pas/unidades/1');
      const data = await response.json();
      if (data.status && data.unidadesDeSaude?.[0]?.especialidades?.especialidades) {
        setEspecialidades(data.unidadesDeSaude[0].especialidades.especialidades);
      }
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error);
      setErro('Erro ao carregar especialidades');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setErro("");
    setLoading(true);
    
    // Validar campos obrigatórios
    if (!formData.nome || !formData.idade || !formData.tempo_entrada || !formData.tempo_saida || !formData.id_especialidade) {
      setErro("Nome, idade, horários de entrada/saída e especialidade são obrigatórios");
      setLoading(false);
      return;
    }
    
    const idade = parseInt(formData.idade);
    
    // Validar se menor de 18 tem acompanhante
    if (idade < 18 && !formData.acompanhante) {
      setErro("Menores de 18 anos devem ter um acompanhante");
      setLoading(false);
      return;
    }
    
    try {
      // Dados para a API de consulta
      const consultaData = {
        tempo_entrada: formData.tempo_entrada,
        tempo_saida: formData.tempo_saida,
        id_unidade_saude: 1,
        id_especialidade: parseInt(formData.id_especialidade)
      };
      
      const response = await fetch('https://api-tcc-node-js-1.onrender.com/v1/pas/consulta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultaData)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao agendar consulta');
      }
      
      const result = await response.json();
      
      // Criar objeto com os dados da ficha
      const fichaData = {
        patientName: formData.nome,
        patientAge: idade,
        cpf: formData.cpf,
        alergia: formData.alergia,
        atendimento: formData.atendimento,
        convenio: formData.convenio,
        acompanhante: formData.acompanhante,
        especialidade: especialidades.find(e => e.id === parseInt(formData.id_especialidade))?.nome,
        tempo_entrada: formData.tempo_entrada,
        tempo_saida: formData.tempo_saida,
        timestamp: new Date().getTime(),
        consultaResult: result
      };
      
      // Salvar no localStorage
      localStorage.setItem('novaFicha', JSON.stringify(fichaData));
      
      // Redirecionar para registros
      router.push("/registros-atendimento");
      
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      setErro('Erro ao agendar consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Agendar Consulta</h1>

      <div className={styles.formContainer}>
        <div className={styles.leftColumn}>
          <div className={styles.formGroup}>
            <label>Nome do paciente:</label>
            <input
              type="text"
              name="nome"
              placeholder="seu nome:"
              value={formData.nome}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Idade:</label>
            <input
              type="number"
              name="idade"
              placeholder="sua idade:"
              value={formData.idade}
              onChange={handleChange}
              min="0"
              max="120"
            />
          </div>

          <div className={styles.formGroup}>
            <label>CPF:</label>
            <input
              type="text"
              name="cpf"
              placeholder="seu CPF:"
              value={formData.cpf}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Alergico a algum medicamento?</label>
            <input
              type="text"
              name="alergia"
              placeholder="se sim qual?"
              value={formData.alergia}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.formGroup}>
            <label>Especialidade:</label>
            <select
              name="id_especialidade"
              value={formData.id_especialidade}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Selecione uma especialidade</option>
              {especialidades.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nome}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Horário de Entrada:</label>
            <input
              type="datetime-local"
              name="tempo_entrada"
              value={formData.tempo_entrada}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Horário de Saída:</label>
            <input
              type="datetime-local"
              name="tempo_saida"
              value={formData.tempo_saida}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Atendimento desejado?</label>
            <p className={styles.subtitle}>Consulta marcada ou emergencia?</p>
            <input
              type="text"
              name="atendimento"
              value={formData.atendimento}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Convenio medico?</label>
            <input
              type="text"
              name="convenio"
              placeholder="tem ou nao?"
              value={formData.convenio}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              acompanhante - 
              {formData.idade && parseInt(formData.idade) < 18 && (
                <span className={styles.obrigatorio}> (obrigatório para menores de 18)</span>
              )}
            </label>
            <input
              type="text"
              name="acompanhante"
              placeholder={formData.idade && parseInt(formData.idade) < 18 ? "Nome do acompanhante:" : "Opcional:"}
              value={formData.acompanhante}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {erro && (
        <div className={styles.errorMessage}>
          {erro}
        </div>
      )}

      <div className={styles.buttonContainer}>
        <button 
          className={styles.submitButton} 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Agendando...' : 'Agendar Consulta'}
        </button>
      </div>
    </main>
  );
}
