import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  FiAlertCircle,
  FiBarChart2,
  FiBookOpen,
  FiCreditCard,
  FiDownload,
  FiRefreshCcw,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { adminAnalyticsService } from "../../../services/adminAnalyticsService.js";

import "./AdminAnalytics.css";

const chartPalette = {
  revenue: "#2F7A67",
  attempts: "#5570D8",
  paid: "#E76F51",
  categories: [
    "#5B67C8",
    "#25A18E",
    "#F4A261",
    "#E76F8A",
    "#4D908E",
    "#9B5DE5",
    "#43AA8B",
    "#F9844A",
  ],
  sources: [
    "#4F6BED",
    "#2A9D8F",
    "#F4A261",
    "#9B5DE5",
    "#E76F51",
    "#43AA8B",
  ],
  resources: [
    "#6366D9",
    "#2A9D8F",
    "#E76F51",
    "#F4A261",
    "#7B61C9",
    "#3A86C8",
  ],
  funnel: [
    "#3A86C8",
    "#6366D9",
    "#9B5DE5",
    "#E76F8A",
    "#F4A261",
    "#2A9D8F",
  ],
};

const emptyAnalytics = {
  summary: {
    totalRevenue: 0,
    paidOrders: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    checkoutSessions: 0,
    checkoutConversionRate: 0,
    abandonedCheckouts: 0,
  },
  revenueTrend: [],
  categorySales: [],
  checkoutSources: [],
  topResources: [],
  conversionData: [],
  insight: {
    title: "Analytics will appear after activity is recorded",
    body: "Complete test checkouts and payments to populate the charts.",
  },
};

function formatCurrency(value) {
  return `KSh ${Number(value || 0).toLocaleString("en-US")}`;
}

function compactNumber(value) {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}m`;
  }

  if (number >= 1000) {
    return `${Math.round(number / 1000)}k`;
  }

  return number;
}

function truncateLabel(value, maximum = 15) {
  const text = String(value || "");

  return text.length > maximum
    ? `${text.slice(0, maximum)}…`
    : text;
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(analytics) {
  const rows = [
    ["Dataset", "Label", "Primary Value", "Secondary Value"],
    [
      "Summary",
      "Total Revenue",
      analytics.summary.totalRevenue,
      "KSh",
    ],
    [
      "Summary",
      "Paid Orders",
      analytics.summary.paidOrders,
      analytics.summary.totalOrders,
    ],
    [
      "Summary",
      "Average Order Value",
      analytics.summary.averageOrderValue,
      "KSh",
    ],
    [
      "Summary",
      "Checkout Conversion",
      analytics.summary.checkoutConversionRate,
      "%",
    ],
    ...analytics.revenueTrend.map((item) => [
      "Monthly Trend",
      item.month,
      item.revenue,
      item.paidOrders,
    ]),
    ...analytics.categorySales.map((item) => [
      "Category Sales",
      item.category,
      item.sales,
      item.revenue,
    ]),
    ...analytics.checkoutSources.map((item) => [
      "Checkout Source",
      item.source,
      item.count,
      item.percentage,
    ]),
    ...analytics.topResources.map((item) => [
      "Top Resource",
      item.name,
      item.sales,
      item.revenue,
    ]),
    ...analytics.conversionData.map((item) => [
      "Checkout Funnel",
      item.stage,
      item.value,
      "",
    ]),
  ];

  const csv = rows
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `skillvault-analytics-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

function EmptyChart({ message }) {
  return (
    <div className="compact-analytics-empty">
      <FiBarChart2 aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

function ChartCardHeading({ eyebrow, title, metric }) {
  return (
    <div className="compact-chart-heading">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>

      {metric && <strong>{metric}</strong>}
    </div>
  );
}

const chartTooltipStyle = {
  border: "1px solid #e1e1e1",
  borderRadius: "6px",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
  fontSize: "11px",
};

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [pageMessage, setPageMessage] = useState("");

  const loadAnalytics = async () => {
    setIsLoading(true);
    setPageError("");

    try {
      const response =
        await adminAnalyticsService.getAnalytics();

      setAnalytics(
        response.data.analytics || emptyAnalytics
      );
    } catch (error) {
      setPageError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const orderTrend = useMemo(
    () =>
      analytics.revenueTrend.map((item) => ({
        month: item.month,
        paid: item.paidOrders,
        attempts: item.totalOrders,
      })),
    [analytics.revenueTrend]
  );

  const summaryCards = [
    {
      label: "Paid revenue",
      value: formatCurrency(
        analytics.summary.totalRevenue
      ),
      icon: FiCreditCard,
      className: "is-green",
    },
    {
      label: "Paid orders",
      value: analytics.summary.paidOrders,
      icon: FiShoppingBag,
      className: "is-blue",
    },
    {
      label: "Average order value",
      value: formatCurrency(
        analytics.summary.averageOrderValue
      ),
      icon: FiTrendingUp,
      className: "is-orange",
    },
    {
      label: "Checkout conversion",
      value: `${analytics.summary.checkoutConversionRate}%`,
      icon: FiUsers,
      className: "is-purple",
    },
  ];

  const handleExport = () => {
    downloadCsv(analytics);
    setPageMessage("Analytics report exported.");
  };

  if (isLoading) {
    return (
      <section
        className="compact-analytics-loading"
        role="status"
        aria-live="polite"
      >
        <span
          className="compact-analytics-spinner"
          aria-hidden="true"
        />

        <h1>Loading analytics</h1>

        <p>
          Preparing the latest revenue, order, source, and conversion data.
        </p>
      </section>
    );
  }

  return (
    <main className="compact-analytics-page">
      {pageError && (
        <div
          className="compact-analytics-message is-error"
          role="alert"
        >
          <FiAlertCircle aria-hidden="true" />
          <span>{pageError}</span>

          <button type="button" onClick={loadAnalytics}>
            <FiRefreshCcw aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {pageMessage && (
        <div
          className="compact-analytics-message is-success"
          role="status"
        >
          <FiBarChart2 aria-hidden="true" />
          <span>{pageMessage}</span>

          <button
            type="button"
            onClick={() => setPageMessage("")}
            aria-label="Dismiss message"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
      )}

      <section className="compact-analytics-hero">
        <div>
          <span>Analytics</span>
          <h1>Platform performance</h1>
          <p>
            Revenue, orders, conversion, demand, and acquisition at a glance.
          </p>
        </div>

        <div className="compact-analytics-actions">
          <button type="button" onClick={loadAnalytics}>
            <FiRefreshCcw aria-hidden="true" />
            Refresh
          </button>

          <button
            type="button"
            className="is-primary"
            onClick={handleExport}
          >
            <FiDownload aria-hidden="true" />
            Export
          </button>
        </div>
      </section>

      <section
        className="compact-analytics-stats"
        aria-label="Analytics summary"
      >
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className={`compact-stat-card ${card.className}`}
              key={card.label}
            >
              <span>
                <Icon aria-hidden="true" />
              </span>

              <div>
                <strong>{card.value}</strong>
                <small>{card.label}</small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="compact-analytics-grid">
        <article className="compact-chart-card">
          <ChartCardHeading
            eyebrow="Revenue"
            title="Monthly paid revenue"
            metric={formatCurrency(
              analytics.summary.totalRevenue
            )}
          />

          <div className="compact-chart-box">
            {analytics.revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.revenueTrend}
                  margin={{
                    top: 4,
                    right: 4,
                    left: -22,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    stroke="#edf0f2"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#6d747a",
                      fontSize: 9,
                    }}
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#6d747a",
                      fontSize: 9,
                    }}
                    tickFormatter={compactNumber}
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                    contentStyle={chartTooltipStyle}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={chartPalette.revenue}
                    fill="#A9D8C7"
                    fillOpacity={0.38}
                    strokeWidth={2.25}
                    dot={false}
                    activeDot={{
                      r: 3,
                      fill: chartPalette.revenue,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Revenue appears after paid orders." />
            )}
          </div>
        </article>

        <article className="compact-chart-card">
          <ChartCardHeading
            eyebrow="Orders"
            title="Paid orders and attempts"
            metric={`${analytics.summary.paidOrders} paid`}
          />

          <div className="compact-chart-box">
            {orderTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={orderTrend}
                  margin={{
                    top: 4,
                    right: 6,
                    left: -24,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    stroke="#edf0f2"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#6d747a",
                      fontSize: 9,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#6d747a",
                      fontSize: 9,
                    }}
                  />

                  <Tooltip contentStyle={chartTooltipStyle} />

                  <Legend
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{
                      fontSize: "9px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="attempts"
                    name="Attempts"
                    stroke={chartPalette.attempts}
                    strokeWidth={2}
                    dot={{
                      r: 2,
                      fill: chartPalette.attempts,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="paid"
                    name="Paid"
                    stroke={chartPalette.paid}
                    strokeWidth={2.25}
                    dot={{
                      r: 2,
                      fill: chartPalette.paid,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Order activity appears after checkout attempts." />
            )}
          </div>
        </article>

        <article className="compact-chart-card">
          <ChartCardHeading
            eyebrow="Categories"
            title="Paid sales by category"
            metric={`${analytics.categorySales.length} categories`}
          />

          <div className="compact-chart-box">
            {analytics.categorySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.categorySales}
                  margin={{
                    top: 4,
                    right: 4,
                    left: -24,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    stroke="#edf0f2"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{
                      fill: "#6d747a",
                      fontSize: 9,
                    }}
                    tickFormatter={(value) =>
                      truncateLabel(value, 10)
                    }
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#6d747a",
                      fontSize: 9,
                    }}
                  />

                  <Tooltip contentStyle={chartTooltipStyle} />

                  <Bar
                    dataKey="sales"
                    name="Paid sales"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  >
                    {analytics.categorySales.map(
                      (item, index) => (
                        <Cell
                          key={item.category}
                          fill={
                            chartPalette.categories[
                              index %
                                chartPalette.categories.length
                            ]
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Category demand appears after paid sales." />
            )}
          </div>
        </article>

        <article className="compact-chart-card">
          <ChartCardHeading
            eyebrow="Sources"
            title="Checkout acquisition"
            metric={`${analytics.checkoutSources.length} sources`}
          />

          <div className="compact-chart-box">
            {analytics.checkoutSources.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.checkoutSources}
                    dataKey="count"
                    nameKey="source"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    cx="50%"
                    cy="43%"
                  >
                    {analytics.checkoutSources.map(
                      (entry, index) => (
                        <Cell
                          key={entry.source}
                          fill={
                            chartPalette.sources[
                              index %
                                chartPalette.sources.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(value, _name, item) => [
                      `${value} (${item.payload.percentage}%)`,
                      item.payload.source,
                    ]}
                    contentStyle={chartTooltipStyle}
                  />

                  <Legend
                    iconType="circle"
                    iconSize={7}
                    verticalAlign="bottom"
                    wrapperStyle={{
                      fontSize: "9px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Sources appear after checkout sessions." />
            )}
          </div>
        </article>

        <article className="compact-chart-card">
          <ChartCardHeading
            eyebrow="Resources"
            title="Revenue by resource"
            metric={`${analytics.topResources.length} ranked`}
          />

          <div className="compact-chart-box">
            {analytics.topResources.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.topResources.slice(0, 5)}
                  layout="vertical"
                  margin={{
                    top: 2,
                    right: 8,
                    left: 2,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    stroke="#edf0f2"
                    strokeDasharray="3 3"
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#6d747a",
                      fontSize: 9,
                    }}
                    tickFormatter={compactNumber}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={74}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#6d747a",
                      fontSize: 8,
                    }}
                    tickFormatter={(value) =>
                      truncateLabel(value, 13)
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                    contentStyle={chartTooltipStyle}
                  />

                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={17}
                  >
                    {analytics.topResources
                      .slice(0, 5)
                      .map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={
                            chartPalette.resources[
                              index %
                                chartPalette.resources.length
                            ]
                          }
                        />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Resource rankings appear after paid sales." />
            )}
          </div>
        </article>

        <article className="compact-chart-card">
          <ChartCardHeading
            eyebrow="Funnel"
            title="Checkout progression"
            metric={`${analytics.summary.checkoutConversionRate}%`}
          />

          <div className="compact-chart-box">
            {analytics.conversionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.conversionData}
                  margin={{
                    top: 4,
                    right: 4,
                    left: -24,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    stroke="#edf0f2"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="stage"
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tick={{
                      fill: "#6d747a",
                      fontSize: 8,
                    }}
                    tickFormatter={(value) =>
                      truncateLabel(value, 10)
                    }
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#6d747a",
                      fontSize: 9,
                    }}
                  />

                  <Tooltip contentStyle={chartTooltipStyle} />

                  <Bar
                    dataKey="value"
                    name="Sessions"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={25}
                  >
                    {analytics.conversionData.map(
                      (item, index) => (
                        <Cell
                          key={item.stage}
                          fill={
                            chartPalette.funnel[
                              index %
                                chartPalette.funnel.length
                            ]
                          }
                        />
                      )
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="The funnel appears after checkout activity." />
            )}
          </div>
        </article>
      </section>

      <section className="compact-analytics-insight">
        <span>
          <FiBookOpen aria-hidden="true" />
        </span>

        <div>
          <small>Live insight</small>
          <strong>{analytics.insight.title}</strong>
          <p>{analytics.insight.body}</p>
        </div>
      </section>
    </main>
  );
}

export default AdminAnalytics;