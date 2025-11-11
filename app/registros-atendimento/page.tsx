"use client";

import React, { useState, useEffect } from "react";
import styles from "./RegistrosAtendimento.module.css";

interface AttendanceRecordData {
  id: string;
  patientName: string;
  patientAge: number;
  healthStatus: string;
  attendanceDate: string;
  lastUpdateTime: string;
  emergencyFile: string;
  emergencyDoctor: string;
  attendanceStartTime: string;
  attendanceEndTime: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorObservations: string;
  doctorLastUpdateTime: string;
  attendanceStatus: "finalizado" | "em-andamento";
}

export default function RegistrosAtendimento() {
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecordData | null>(null);
  const [showMessage, setShowMessage] = useState(false);
  const [records, setRecords] = useState<AttendanceRecordData[]>([]);

  // Carregar registros salvos e processar nova ficha ao iniciar
  useEffect(() => {
    // Carregar registros existentes
    const savedRecords = localStorage.getItem('registrosAtendimento');
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }

    // Processar nova ficha se houver
    const novaFichaStr = localStorage.getItem('novaFicha');
    if (novaFichaStr) {
      const novaFicha = JSON.parse(novaFichaStr);
      const now = new Date();
      const dataFormatada = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
      const horaFormatada = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // Gerar nome fictício de médico
      const nomesMedicos = ["Dr. Carlos Silva", "Dra. Maria Santos", "Dr. João Oliveira", "Dra. Ana Costa", "Dr. Pedro Almeida"];
      const nomeMedico = nomesMedicos[Math.floor(Math.random() * nomesMedicos.length)];
      
      const novoRegistro: AttendanceRecordData = {
        id: String(Date.now()),
        patientName: novaFicha.patientName,
        patientAge: novaFicha.patientAge || 0,
        healthStatus: "aguardando atendimento",
        attendanceDate: dataFormatada,
        lastUpdateTime: `${dataFormatada} ${horaFormatada}`,
        emergencyFile: novaFicha.atendimento === "emergencia" ? "Ficha emergencial" : "Ficha consulta",
        emergencyDoctor: novaFicha.atendimento === "emergencia" ? "Médico emergencista" : "Médico clínico geral",
        attendanceStartTime: horaFormatada,
        attendanceEndTime: "-",
        doctorName: nomeMedico,
        doctorSpecialization: novaFicha.atendimento === "emergencia" ? "Médico emergencista" : "Médico clínico geral",
        doctorObservations: `Paciente aguardando atendimento. ${novaFicha.alergia ? `Alergias relatadas: ${novaFicha.alergia}` : "Sem alergias relatadas"}${novaFicha.acompanhante ? `. Acompanhante: ${novaFicha.acompanhante}` : ""}`,
        doctorLastUpdateTime: `Ficha retirada: ${horaFormatada}`,
        attendanceStatus: "em-andamento",
      };
      
      // Adicionar novo registro aos existentes
      const registrosExistentes = savedRecords ? JSON.parse(savedRecords) : [];
      const updatedRecords = [novoRegistro, ...registrosExistentes];
      
      setRecords(updatedRecords);
      localStorage.setItem('registrosAtendimento', JSON.stringify(updatedRecords));
      localStorage.removeItem('novaFicha');
    }
  }, []);

  // Salvar registros sempre que houver mudanças
  useEffect(() => {
    if (records.length > 0) {
      localStorage.setItem('registrosAtendimento', JSON.stringify(records));
    }
  }, [records]);

  const handleFinalize = () => {
    if (!selectedRecord) return;
    
    const now = new Date();
    const dataFormatada = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    const horaFormatada = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Estados de saúde possíveis após atendimento
    const estadosSaude = ["estável", "bom", "razoável", "crítico", "recuperando"];
    const estadoAleatorio = estadosSaude[Math.floor(Math.random() * estadosSaude.length)];
    
    // Atualizar o registro com status finalizado
    const registroAtualizado: AttendanceRecordData = {
      ...selectedRecord,
      attendanceStatus: "finalizado",
      attendanceEndTime: horaFormatada,
      healthStatus: estadoAleatorio,
      lastUpdateTime: `${dataFormatada} ${horaFormatada}`,
      doctorLastUpdateTime: `Fim do atendimento: ${horaFormatada}`,
      doctorObservations: selectedRecord.doctorObservations.replace("Paciente aguardando atendimento", "Paciente atendido com sucesso"),
    };
    
    // Atualizar lista de registros
    setRecords((prevRecords) => 
      prevRecords.map((record) => 
        record.id === selectedRecord.id ? registroAtualizado : record
      )
    );
    
    setShowMessage(true);
    setTimeout(() => {
      setSelectedRecord(null);
      setShowMessage(false);
    }, 2000);
  };

  if (showMessage) {
    return (
      <main className={styles.container}>
        <div className={styles.messageContainer}>
          <div className={styles.message}>
            <h2>Atendimento Finalizado</h2>
            <p>A ficha foi constatada e enviada para o sistema</p>
            <p className={styles.redirectText}>Redirecionando para a lista...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!selectedRecord) {
    return (
      <main className={styles.container}>
        <div className={styles.header}>
          <h1>Registros do atendimento do paciente</h1>
        </div>

        <div className={styles.recordsList}>
          {records.map((record) => (
            <div
              key={record.id}
              className={styles.recordCard}
              onClick={() => setSelectedRecord(record)}
            >
              <div className={styles.recordHeader}>
                <h3>{record.patientName}</h3>
                <span className={styles.age}>{record.patientAge} anos</span>
              </div>
              <div className={styles.recordInfo}>
                <p><strong>Estado de saúde:</strong> {record.healthStatus}</p>
                <p><strong>Data do atendimento:</strong> {record.attendanceDate}</p>
                <p><strong>Última atualização:</strong> {record.lastUpdateTime}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.detailsContainer}>
        <button className={styles.backButton} onClick={() => setSelectedRecord(null)}>
          ← Voltar
        </button>

        <div className={styles.detailsContent}>
          <div className={styles.section}>
            <h2>Registro do paciente:</h2>
            <div className={styles.patientInfo}>
              <p><strong>{selectedRecord.patientName}</strong></p>
              <p>{selectedRecord.patientAge} anos</p>
              <p>estado de saúde: {selectedRecord.healthStatus}</p>
            </div>
            <div className={styles.dateInfo}>
              <p><strong>Data do Atendimento:</strong></p>
              <p>{selectedRecord.attendanceDate}</p>
            </div>
            <div className={styles.updateInfo}>
              <p><strong>Horário da última atualização:</strong></p>
              <p>{selectedRecord.lastUpdateTime}</p>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Ficha: {selectedRecord.emergencyFile}</h2>
            <p className={styles.doctorLabel}>{selectedRecord.emergencyDoctor}</p>
            
            <div className={styles.attendanceInfo}>
              <p><strong>Horário que retirou a ficha:</strong></p>
              <p>{selectedRecord.attendanceStartTime}</p>
            </div>

            <div className={styles.attendanceSection}>
              <h3>Atendimento:</h3>
              <p><strong>Início do atendimento:</strong></p>
              <p>{selectedRecord.attendanceStartTime}</p>
              
              <p><strong>Horário do fim do atendimento:</strong></p>
              <p>{selectedRecord.attendanceEndTime}</p>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Registros do medico - {selectedRecord.doctorName}</h2>
            
            <div className={styles.doctorInfo}>
              <p><strong>Observações do Doutor:</strong></p>
              <p className={styles.observations}>{selectedRecord.doctorObservations}</p>
            </div>

            <div className={styles.doctorSpecialization}>
              <p><strong>Profissionalização do medico:</strong></p>
              <p>{selectedRecord.doctorSpecialization}</p>
            </div>

            <div className={styles.doctorUpdate}>
              <p><strong>Horário da última atualização:</strong></p>
              <p>{selectedRecord.doctorLastUpdateTime}</p>
            </div>
          </div>

          <div className={styles.statusContainer}>
            <button 
              className={`${styles.statusButton} ${selectedRecord.attendanceStatus === "finalizado" ? styles.finalizado : styles.emAndamento}`}
              onClick={handleFinalize}
            >
              Atendimento {selectedRecord.attendanceStatus === "finalizado" ? "finalizado" : "em andamento"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
