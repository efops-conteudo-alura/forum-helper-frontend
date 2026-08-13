import React, { useMemo, useState } from 'react';
import {
  CATEGORIES,
  BR_TEAM_STATS,
  LATAM_TEAM_STATS,
  NOVIDADES_MOCK,
  initialsOf,
  rowTotal,
  computeSummary,
} from './mockData';

const PRESETS = ['Ontem', 'Esta Semana', 'Este Mês', 'Último Mês', 'Este Trimestre'];

function KpiCard({ iconClass, label, value, sub, color }) {
  return (
    <div className="kpi-card" style={{ '--accent': color }}>
      <div className="kpi-icon">
        <i className={iconClass}></i>
      </div>
      <div className="kpi-meta">
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">
          {value}
          {sub ? <span className="kpi-percent">{sub}</span> : null}
        </p>
      </div>
    </div>
  );
}

function DistributionBar({ row, total }) {
  return (
    <div className="metrics-dist-bar">
      {CATEGORIES.map((c) => {
        const value = row[c.key] || 0;
        if (!value) return null;
        return (
          <div
            key={c.key}
            className="metrics-dist-seg"
            style={{ width: `${(value / total) * 100}%`, background: c.color }}
            title={`${c.label}: ${value}`}
          />
        );
      })}
    </div>
  );
}

function MetricsView() {
  const [region, setRegion] = useState('BR'); // 'BR' | 'LATAM'
  const [scope, setScope] = useState('team'); // 'team' | 'individual'
  const [activePreset, setActivePreset] = useState('Esta Semana');

  const allRows = region === 'BR' ? BR_TEAM_STATS : LATAM_TEAM_STATS;
  const rows = scope === 'individual'
    ? allRows.filter((r) => r.name === 'Victor Costa')
    : allRows;

  const summary = useMemo(() => computeSummary(allRows), [allRows]);
  const percentOf = (value) => (summary.total ? Math.round((value / summary.total) * 100) : 0);
  const mediaPorPessoa = summary.people ? Math.round(summary.total / summary.people) : 0;

  return (
    <div id="metrics-view" className="view-container active dashboard-modern metrics-view">
      <main>
        <section className="dash-section metrics-hero">
          <h2>Métricas do Time</h2>
          <p className="panel-subtitle">Dados de exemplo — ClickUp, Discord e N8N ainda não estão integrados.</p>
        </section>

        <section className="dash-filters dash-section">
          <div className="preset-group">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`preset-btn ${activePreset === preset ? 'active-preset' : ''}`}
                onClick={() => setActivePreset(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
        </section>

        <section className="kpi-grid dash-section">
          <KpiCard
            iconClass="fas fa-arrow-trend-up"
            label="Total de Entregas"
            value={summary.total}
            sub={`${summary.people} pessoas`}
            color="#06B9A1"
          />
          {CATEGORIES.map((c) => (
            <KpiCard
              key={c.key}
              iconClass={c.icon}
              label={c.label}
              value={summary.totals[c.key]}
              sub={`${percentOf(summary.totals[c.key])}%`}
              color={c.color}
            />
          ))}
          <KpiCard
            iconClass="fas fa-users"
            label="Média por Pessoa"
            value={mediaPorPessoa}
            color="#7B71FF"
          />
        </section>

        <section className="panel dash-section">
          <div className="panel-header panel-header--separated">
            <div className="header-info">
              <h3 className="panel-title">
                <i className="fas fa-users" style={{ color: '#00C86F' }}></i>
                Entregas por pessoa
              </h3>
              <p className="panel-subtitle">Layout inspirado no mockup da Carol</p>
            </div>
            <div className="header-controls">
              <div className="pill-toggle">
                <button type="button" className={region === 'BR' ? 'active' : ''} onClick={() => setRegion('BR')}>
                  <i className="fas fa-globe"></i> Brasil
                </button>
                <button type="button" className={region === 'LATAM' ? 'active' : ''} onClick={() => setRegion('LATAM')}>
                  <i className="fas fa-globe"></i> Latam
                </button>
              </div>
              <div className="pill-toggle">
                <button type="button" className={scope === 'team' ? 'active' : ''} onClick={() => setScope('team')}>
                  <i className="fas fa-people-group"></i> Equipe
                </button>
                <button type="button" className={scope === 'individual' ? 'active' : ''} onClick={() => setScope('individual')}>
                  <i className="fas fa-user"></i> Individual
                </button>
              </div>
            </div>
          </div>

          <div className="metrics-table-wrap">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th className="metrics-th-person">PESSOA</th>
                  {CATEGORIES.map((c) => <th key={c.key}>{c.shortLabel}</th>)}
                  <th>TOTAL</th>
                  <th>DISTRIBUIÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const total = rowTotal(row);
                  return (
                    <tr key={row.name}>
                      <td className="metrics-td-person">
                        <span className="metrics-avatar">{initialsOf(row.name)}</span>
                        {row.name}
                      </td>
                      {CATEGORIES.map((c) => <td key={c.key}>{row[c.key]}</td>)}
                      <td className="metrics-td-total">{total}</td>
                      <td className="metrics-td-dist"><DistributionBar row={row} total={total} /></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>TOTAL {region === 'BR' ? 'BRASIL' : 'LATAM'}</td>
                  {CATEGORIES.map((c) => (
                    <td key={c.key} style={{ color: c.color }}>{summary.totals[c.key]}</td>
                  ))}
                  <td>{summary.total}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
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
