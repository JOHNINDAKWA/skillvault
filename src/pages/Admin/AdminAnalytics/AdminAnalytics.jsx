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
  FiBarChart2,
  FiBookOpen,
  FiCreditCard,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import "./AdminAnalytics.css";

const revenueTrend = [
  { month: "Jan", revenue: 18500, orders: 42 },
  { month: "Feb", revenue: 24300, orders: 55 },
  { month: "Mar", revenue: 31800, orders: 68 },
  { month: "Apr", revenue: 27600, orders: 61 },
  { month: "May", revenue: 39200, orders: 82 },
  { month: "Jun", revenue: 48100, orders: 96 },
];

const categorySales = [
  { category: "Business", sales: 92 },
  { category: "Money", sales: 76 },
  { category: "Career", sales: 61 },
  { category: "Parenting", sales: 44 },
  { category: "Health", sales: 37 },
  { category: "Templates", sales: 29 },
];

const trafficSources = [
  { source: "Direct", value: 38 },
  { source: "Social", value: 27 },
  { source: "Referral", value: 18 },
  { source: "Search", value: 17 },
];

const topResources = [
  { name: "Interview Playbook", revenue: 12600 },
  { name: "Money Guide", revenue: 10400 },
  { name: "Business Starter", revenue: 8700 },
  { name: "Parenting Money", revenue: 6900 },
  { name: "Massage Training", revenue: 5200 },
];

const conversionData = [
  { stage: "Visitors", value: 1850 },
  { stage: "Product Views", value: 940 },
  { stage: "Cart Adds", value: 410 },
  { stage: "Checkout", value: 220 },
  { stage: "Purchases", value: 96 },
];

const pieColors = ["#996515", "#c08a32", "#d2a044", "#e6c47a"];

function formatCurrency(value) {
  return `KSh ${Number(value).toLocaleString()}`;
}

function AdminAnalytics() {
  const totalRevenue = revenueTrend.reduce(
    (total, item) => total + item.revenue,
    0,
  );
  const totalOrders = revenueTrend.reduce(
    (total, item) => total + item.orders,
    0,
  );
  const averageOrderValue = Math.round(totalRevenue / totalOrders);
  const conversionRate = Math.round(
    (conversionData[conversionData.length - 1].value /
      conversionData[0].value) *
      100,
  );

  return (
    <section className="admin-analytics-page">
      <div className="admin-analytics-hero">
        <div>
          <span>Analytics</span>

          <h1>Platform performance</h1>

          <p>
            Monitor revenue, orders, customer movement, top resources, and sales
            performance across SkillVault.
          </p>
        </div>

        <button type="button">
          <FiBarChart2 />
          Export Report
        </button>
      </div>

      <div className="admin-analytics-stats">
        <article>
          <FiCreditCard />
          <div>
            <strong>{formatCurrency(totalRevenue)}</strong>
            <span>Total revenue</span>
          </div>
        </article>

        <article>
          <FiShoppingBag />
          <div>
            <strong>{totalOrders}</strong>
            <span>Total orders</span>
          </div>
        </article>

        <article>
          <FiTrendingUp />
          <div>
            <strong>{formatCurrency(averageOrderValue)}</strong>
            <span>Average order value</span>
          </div>
        </article>

        <article>
          <FiUsers />
          <div>
            <strong>{conversionRate}%</strong>
            <span>Visitor conversion</span>
          </div>
        </article>
      </div>

      <div className="admin-analytics-grid">
        <article className="admin-chart-card admin-chart-card-wide">
          <div className="admin-chart-heading">
            <div>
              <span>Revenue Trend</span>
              <h2>Monthly revenue growth</h2>
            </div>

            <p>Last 6 months</p>
          </div>

          <div className="admin-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#996515"
                  fill="#996515"
                  fillOpacity={0.15}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="admin-chart-card">
          <div className="admin-chart-heading">
            <div>
              <span>Orders</span>
              <h2>Monthly orders</h2>
            </div>
          </div>

          <div className="admin-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#996515"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="admin-chart-card">
          <div className="admin-chart-heading">
            <div>
              <span>Categories</span>
              <h2>Sales by category</h2>
            </div>
          </div>

          <div className="admin-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar
                  dataKey="sales"
                  name="Sales"
                  fill="#996515"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="admin-chart-card">
          <div className="admin-chart-heading">
            <div>
              <span>Traffic</span>
              <h2>Traffic sources</h2>
            </div>
          </div>

          <div className="admin-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSources}
                  dataKey="value"
                  nameKey="source"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {trafficSources.map((entry, index) => (
                    <Cell
                      key={entry.source}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="admin-chart-card">
          <div className="admin-chart-heading">
            <div>
              <span>Top Resources</span>
              <h2>Revenue by resource</h2>
            </div>
          </div>

          <div className="admin-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topResources} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={115}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#996515"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="admin-analytics-bottom-grid">
        <article className="admin-chart-card">
          <div className="admin-chart-heading">
            <div>
              <span>Conversion Funnel</span>
              <h2>Visitor to purchase journey</h2>
            </div>
          </div>

          <div className="admin-chart-box admin-chart-box-small">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  name="Users"
                  fill="#996515"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="admin-analytics-insight">
          <FiBookOpen />

          <div>
            <span>Insight</span>

            <h2>Career and money resources are leading demand</h2>

            <p>
              The strongest early signal is around practical career, money, and
              business resources. This can guide which books, templates, and
              guides you create next.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default AdminAnalytics;
