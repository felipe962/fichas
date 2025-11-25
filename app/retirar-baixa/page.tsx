"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./RetirarBaixa.module.css";

interface FichaData {
  patientName: string;
  patientAge: number;
  cpf: string;
  alergia: string;
  atendimento: string;
  convenio: string;
  acompanhante: string;
  especialidade: string;
  id_especialidade: number;
  tempo_entrada: string;
  tempo_saida: string;
  timestamp: number;
  id_unidade_saude: number;
}

export default function RetirarBaixa() {
  const router = useRouter();
  const [ficha, setFicha] = useState<FichaData | null>(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    // Recuperar ficha do localStorage
    const fichaAtiva = localStorage.getItem('fichaAtiva');
    if (fichaAtiva) {
      try {
        setFicha(JSON.parse(fichaAtiva));
      } catch (error) {
        setErro('Erro ao carregar ficha');
        console.error('Erro ao parsear ficha:', error);
      }
    } else {
      setErro('Nenhuma ficha ativa encontrada');
    }
  }, []);

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR');
  };

  const formatarDataParaAPI = (dataISO: string) => {
    const data = new Date(dataISO);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    const segundos = String(data.getSeconds()).padStart(2, '0');
    return `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
  };

  const calcularTempoEspera = (entrada: string, saida: string) => {
    if (!saida) return "Em andamento";
    const dataEntrada = new Date(entrada);
    const dataSaida = new Date(saida);
    const diferenca = dataSaida.getTime() - dataEntrada.getTime();
    const minutos = Math.floor(diferenca / 60000);
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleFazerBaixa = async () => {
    if (!ficha) return;

    setErro("");
    setLoading(true);

    try {
      // Registrar tempo de saída automático
      const agora = new Date();
      const tempo_saida = agora.toISOString();

      // Dados para a API de consulta - formato esperado pela API
      const consultaData = {
        tempo_entrada: formatarDataParaAPI(ficha.tempo_entrada),
        tempo_saida: formatarDataParaAPI(tempo_saida),
        id_unidade_saude: String(ficha.id_unidade_saude),
        id_especialidade: String(ficha.id_especialidade)
      };

      console.log('Ficha completa:', ficha);
      console.log('Enviando para API:', consultaData);
      console.log('JSON enviado:', JSON.stringify(consultaData, null, 2));

      // Fazer POST para a API
      const response = await fetch('https://api-tcc-node-js-1.onrender.com/v1/pas/consulta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consultaData)
      });

      console.log('Status da resposta:', response.status);
      console.log('Headers:', response.headers);

      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.log('Resposta em texto:', text);
        result = text ? JSON.parse(text) : {};
      }

      console.log('Resposta da API:', result);

      if (!response.ok) {
        console.error('Erro da API - Status:', response.status, 'Resposta:', result);
        throw new Error(result.message || `Erro ao fazer baixa da consulta (Status: ${response.status})`);
      }

      // Atualizar ficha com tempo de saída
      const fichaAtualizada = {
        ...ficha,
        tempo_saida: tempo_saida,
        consultaResult: result
      };

      // Salvar ficha finalizada no localStorage
      const fichasFinalizadas = JSON.parse(localStorage.getItem('fichasFinalizadas') || '[]');
      fichasFinalizadas.push(fichaAtualizada);
      localStorage.setItem('fichasFinalizadas', JSON.stringify(fichasFinalizadas));

      // Salvar como novaFicha para aparecer em registros-atendimento
      localStorage.setItem('novaFicha', JSON.stringify(fichaAtualizada));

      // Limpar ficha ativa
      localStorage.removeItem('fichaAtiva');

      setSucesso(true);

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/registros-atendimento");
      }, 2000);

    } catch (error) {
      console.error('Erro ao fazer baixa:', error);
      const mensagemErro = error instanceof Error ? error.message : 'Erro ao fazer baixa da consulta. Tente novamente.';
      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  if (erro && !ficha) {
    return (
      <main className={styles.container}>
        <div className={styles.errorMessage}>
          {erro}
        </div>
        <button 
          className={styles.backButton}
          onClick={() => router.push("/retire-ficha")}
        >
          Voltar para Retire Ficha
        </button>
      </main>
    );
  }

  if (!ficha) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingMessage}>Carregando ficha...</div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Fazer Baixa da Ficha</h1>

      {sucesso && (
        <div className={styles.successMessage}>
          ✓ Baixa realizada com sucesso! Redirecionando...
        </div>
      )}

      {erro && (
        <div className={styles.errorMessage}>
          {erro}
        </div>
      )}

      <div className={styles.fichaCard}>
        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Dados do Paciente</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Nome:</label>
              <p>{ficha.patientName}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Idade:</label>
              <p>{ficha.patientAge} anos</p>
            </div>
            <div className={styles.infoItem}>
              <label>CPF:</label>
              <p>{ficha.cpf || "Não informado"}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Alergia:</label>
              <p>{ficha.alergia || "Nenhuma"}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Convênio:</label>
              <p>{ficha.convenio || "Não informado"}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Acompanhante:</label>
              <p>{ficha.acompanhante || "Nenhum"}</p>
            </div>
          </div>
        </div>

        <div className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>Informações do Atendimento</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Especialidade:</label>
              <p>{ficha.especialidade}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Tipo de Atendimento:</label>
              <p>{ficha.atendimento || "Não informado"}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Horário de Entrada:</label>
              <p>{formatarData(ficha.tempo_entrada)}</p>
            </div>
            <div className={styles.infoItem}>
              <label>Tempo de Espera:</label>
              <p className={styles.tempoEspera}>
                {calcularTempoEspera(ficha.tempo_entrada, ficha.tempo_saida)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <button 
          className={styles.backButton}
          onClick={() => router.push("/retire-ficha")}
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          className={styles.submitButton}
          onClick={handleFazerBaixa}
          disabled={loading}
        >
          {loading ? 'Processando...' : 'Fazer Baixa'}
        </button>
      </div>
    </main>
  );
}
