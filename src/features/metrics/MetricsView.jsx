import React from 'react';
import { REAL_METRICS, COMING_SOON_CARDS, NOVIDADES_MOCK } from './mockData';

function KpiCard({ iconClass, label, value, sub, color }) {
  return (
    <div className="kpi-card" style={{ '--accent': color }}>
      <div className="kpi-icon">
        <i className={iconClass}></i>
      </div>
      <div className="kpi-meta">
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{value}</p>
        {sub ? <p className="kpi-note">{sub}</p> : null}
      </div>
    </div>
  );
}

function MetricsView() {
  const { artigosRevisados, reclamacoes } = REAL_METRICS;
  const tiposOrdenados = [...reclamacoes.porTipo].sort((a, b) => b.total - a.total);
  const maxTipo = Math.max(...tiposOrdenados.map((t) => t.total));

  return (
    <div id="metrics-view" className="view-container active dashboard-modern metrics-view">
      <main>
        <section className="dash-section metrics-hero">
          <h2>Métricas do Time</h2>
          <p className="panel-subtitle">
            Primeiros números reais, puxados do ClickUp — cada card mostra o próprio período, sem misturar escalas de tempo diferentes.
          </p>
        </section>

        <section className="kpi-grid dash-section">
          <KpiCard
            iconClass="fas fa-circle-check"
            label="Reclamações de Alunos Tratadas"
            value={reclamacoes.total}
            sub={reclamacoes.periodo}
            color="#7B71FF"
          />
          <KpiCard
            iconClass="fas fa-book-open"
            label="Artigos Revisados"
            value={artigosRevisados.total}
            sub={artigosRevisados.periodo}
            color="#6BD1FF"
          />
          {COMING_SOON_CARDS.map((card) => (
            <KpiCard
              key={card.key}
              iconClass={card.iconClass}
              label={card.label}
              value="—"
              sub="Em breve"
              color={card.color}
            />
          ))}
        </section>

        <section className="panel dash-section">
          <div className="panel-header">
            <h3 className="panel-title">
              <i className="fas fa-list-check" style={{ color: '#7B71FF' }}></i>
              Reclamações por tipo de problema
            </h3>
            <p className="panel-subtitle">
              {reclamacoes.periodo} · uma reclamação pode ter mais de um tipo marcado, então a soma passa do total de reclamações
            </p>
          </div>
          <div className="metrics-ranking">
            {tiposOrdenados.map((t) => (
              <div className="metrics-ranking-row" key={t.label}>
                <span className="metrics-ranking-name">{t.label}</span>
                <div className="metrics-ranking-track">
                  <div
                    className="metrics-ranking-bar"
                    style={{ width: `${Math.max(4, (t.total / maxTipo) * 100)}%`, background: '#7B71FF' }}
                  />
                </div>
                <span className="metrics-ranking-value">{t.total}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel dash-section">
          <div className="panel-header">
            <h3 className="panel-title">
              <i className="fas fa-bell" style={{ color: '#FFBA05' }}></i>
              Esteira de Novidades
              <span className="panel-badge">conceito</span>
            </h3>
            <p className="panel-subtitle">Quando o N8N estiver plugado, eventos assim viram notificação de verdade no sino do header.</p>
          </div>
          <ul className="metrics-novidades">
            {NOVIDADES_MOCK.map((item, i) => (
              <li key={i} className="metrics-novidades-item">
                <span className="metrics-novidades-icon" style={{ background: `${item.color}22`, color: item.color }}>
                  <i className={item.icon}></i>
                </span>
                <span className="metrics-novidades-text">{item.text}</span>
                <span className="metrics-novidades-when">{item.when}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default MetricsView;
