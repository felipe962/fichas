"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./RetireFicha.module.css";

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
  });
  const [erro, setErro] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    setErro("");
    
    // Validar campos obrigatórios
    if (!formData.nome || !formData.idade) {
      setErro("Nome e idade são obrigatórios");
      return;
    }
    
    const idade = parseInt(formData.idade);
    
    // Validar se menor de 18 tem acompanhante
    if (idade < 18 && !formData.acompanhante) {
      setErro("Menores de 18 anos devem ter um acompanhante");
      return;
    }
    
    // Criar objeto com os dados da ficha
    const fichaData = {
      patientName: formData.nome,
      patientAge: idade,
      cpf: formData.cpf,
      alergia: formData.alergia,
      atendimento: formData.atendimento,
      convenio: formData.convenio,
      acompanhante: formData.acompanhante,
      timestamp: new Date().getTime(),
    };
    
    // Salvar no localStorage
    localStorage.setItem('novaFicha', JSON.stringify(fichaData));
    
    // Redirecionar para registros
    router.push("/registros-atendimento");
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Retire sua ficha</h1>

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
        <button className={styles.submitButton} onClick={handleSubmit}>
          Imprimir ficha
        </button>
      </div>
    </main>
  );
}
