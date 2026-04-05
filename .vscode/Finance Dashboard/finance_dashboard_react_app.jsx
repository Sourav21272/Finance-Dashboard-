import React, { useState, useMemo, useEffect } from "react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f"];

// ✅ Safe localStorage parsing (fixes crash issues)
const getInitialData = () => {
  try {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("transactions");
      if (data) return JSON.parse(data);
    }
  } catch (e) {
    console.error("LocalStorage parse error", e);
  }
  return [
    { id: 1, date: "2026-03-01", amount: 5000, category: "Salary", type: "income" },
    { id: 2, date: "2026-03-02", amount: 1200, category: "Food", type: "expense" },
    { id: 3, date: "2026-03-05", amount: 800, category: "Transport", type: "expense" },
    { id: 4, date: "2026-03-10", amount: 2000, category: "Freelance", type: "income" },
  ];
};

export default function App() {
  const [transactions, setTransactions] = useState(getInitialData);
  const [role, setRole] = useState("viewer");
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState("date");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    }
  }, [transactions]);

  const summary = useMemo(() => {
    let income = 0, expense = 0;
    transactions.forEach(t => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const filteredData = useMemo(() => {
    return [...transactions] // ✅ avoid mutation
      .filter(t => t.category.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) =>
        sortKey === "amount"
          ? b.amount - a.amount
          : new Date(b.date) - new Date(a.date)
      );
  }, [transactions, filter, sortKey]);

  const addTransaction = () => {
    setTransactions(prev => [...prev, {
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      amount: 1000,
      category: "Misc",
      type: "expense"
    }]);
  };

  const deleteTx = (id) => setTransactions(prev => prev.filter(t => t.id !== id));

  const editTx = (id) => {
    const updated = transactions.map(t =>
      t.id === id ? { ...t, amount: t.amount + 100 } : t
    );
    setTransactions(updated);
  };

  const categoryData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (t.type === "expense") {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    });
    return Object.keys(map).map(key => ({ name: key, value: map[key] }));
  }, [transactions]);

  const lineData = transactions.map(t => ({ date: t.date, amount: t.amount }));

  // ✅ avoid mutating original array
  const highestCategory = [...categoryData].sort((a, b) => b.value - a.value)[0]?.name || "N/A";
  const avgExpense = (summary.expense / (transactions.length || 1)).toFixed(2);

  return (
    <div className="p-4 grid gap-4">
      <div className="flex gap-2">
        <button onClick={() => setRole("viewer")}>Viewer</button>
        <button onClick={() => setRole("admin")}>Admin</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card"><div>Balance: {summary.balance}</div></div>
        <div className="card"><div>Income: {summary.income}</div></div>
        <div className="card"><div>Expense: {summary.expense}</div></div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <div>
          Highest Category: {highestCategory} <br />
          Avg Expense: {avgExpense}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search"
          className="border p-2"
        />
        <select
          onChange={(e) => setSortKey(e.target.value)}
          className="ml-2 border p-2"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>

        {role === "admin" && <button onClick={addTransaction}>Add</button>}

        <div className="overflow-x-auto">
          <table className="w-full border mt-2">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan="5">No Data</td></tr>
              ) : (
                filteredData.map(t => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>{t.amount}</td>
                    <td>{t.category}</td>
                    <td>{t.type}</td>
                    <td>
                      {role === "admin" && (
                        <>
                          <button onClick={() => editTx(t.id)}>Edit</button>
                          <button onClick={() => deleteTx(t.id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
