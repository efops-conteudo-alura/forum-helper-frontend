import React, { useEffect, useMemo, useState } from 'react';
import { fetchDashboardStats } from '../../api/apiService';
import { TEAM_MEMBERS, PALETTE, formatName, getPresetRange, formatYMD } from '../dashboard/helpers';

// Fontes que ainda não têm integração (ClickUp/N8N/Discord) — cards ficam
// como placeholder até os dados passarem a chegar via webhook.
const COMING_SOON_CARDS = [
  { key: 'artigos', iconClass: 'fas fa-file-lines', label: 'Artigos (feitos/revisados)', color: '#7B71FF' },
  { key: 'imersao', iconClass: 'fas fa-graduation-cap', label: 'Imersão', color: '#FFBA05' },
  { key: '7days', iconClass: 'fas fa-laptop-code', label: '7 Days of Code', color: '#00C86F' },
  { key: 'discord', iconClass: 'fa-brands fa-discord', label: 'Discord', color: '#6BD1FF' },
];

function KpiCard({ iconClass, label, value, color, note }) {
  return (
    <div className="kpi-card" style={{ '--accent': color }}>
      <div className="kpi-icon">
        <i className={iconClass}></i>
      </div>
      <div className="kpi-meta">
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{value}</p>
        {note ? <p className="kpi-note">{note}</p> : null}
      </div>
    </div>
  );
}

function MetricsView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let alive = true;
    const { start, end } = getPresetRange('month');
    fetchDashboardStats(formatYMD(start), formatYMD(end), TEAM_MEMBERS.join(','))
      .then((result) => { if (alive) setUsers(result?.users || []); })
      .catch(() => { if (alive) setErrored(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const ranking = useMemo(() => {
    return TEAM_MEMBERS
      .map((memberUsername) => {
        const found = users.find((u) => u.username === memberUsername);
        return { username: memberUsername, value: found?.totalSolutions || 0 };
      })
      .sort((a, b) => b.value - a.value);
  }, [users]);

  const totalResolvidos = ranking.reduce((sum, r) => sum + r.value, 0);
  const maxValue = Math.max(1, ...ranking.map((r) => r.value));

  return (
    <div id="metrics-view" className="view-container active dashboard-modern metrics-view">
      <main>
        <section className="dash-section metrics-hero">
          <h2>Métricas do Time</h2>
          <p className="panel-subtitle">
            Prévia pra apresentação — Artigos, Imersão, 7 Days of Code e Discord ainda aguardam a integração via N8N.
          </p>
        </section>

        <section className="kpi-grid dash-section">
          <KpiCard
            iconClass="fas fa-check-double"
            label="Tópicos Resolvidos (mês)"
            value={loading ? '…' : totalResolvidos}
            color="#00C86F"
          />
          {COMING_SOON_CARDS.map((card) => (
            <KpiCard
              key={card.key}
              iconClass={card.iconClass}
              label={card.label}
              value="—"
              color={card.color}
              note="Em breve"
            />
          ))}
        </section>

        <section className="panel dash-section">
          <div className="panel-header">
            <h3 className="panel-title">
              <i className="fas fa-ranking-star" style={{ color: '#00C86F' }}></i>
              Tópicos resolvidos por pessoa
            </h3>
            <p className="panel-subtitle">Mês atual · já vem do BI, dado real</p>
          </div>

          {loading ? (
            <p className="metrics-status">Carregando…</p>
          ) : errored ? (
            <p className="metrics-status">Não foi possível carregar os dados agora.</p>
          ) : (
            <div className="metrics-ranking">
              {ranking.map((r, i) => (
                <div className="metrics-ranking-row" key={r.username}>
                  <span className="metrics-ranking-name">{formatName(r.username)}</span>
                  <div className="metrics-ranking-track">
                    <div
                      className="metrics-ranking-bar"
                      style={{
                        width: `${Math.max(4, (r.value / maxValue) * 100)}%`,
                        background: PALETTE[i % PALETTE.length],
                      }}
                    />
                  </div>
                  <span className="metrics-ranking-value">{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default MetricsView;
