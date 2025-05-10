import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function Dashboard() {
  const wallet = useQuery(api.trading.getWalletBalance);
  const transactions = useQuery(api.trading.getTransactionHistory);
  const security = useQuery(api.security.getSecuritySettings);
  const simulateTrade = useMutation(api.trading.simulateTrade);
  const updateSecurity = useMutation(api.security.updateSecuritySettings);

  const [tradeAmount, setTradeAmount] = useState("");

  const handleTrade = async (type: "buy" | "sell") => {
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await simulateTrade({
        type,
        amount,
        currency: wallet?.currency ?? "USDT"
      });
      setTradeAmount("");
      toast.success(`${type.toUpperCase()} order completed`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Trade failed");
    }
  };

  const toggleSecurity = async (setting: "twoFactorEnabled" | "loginNotifications") => {
    if (!security) return;
    
    try {
      await updateSecurity({
        ...security,
        [setting]: !security[setting]
      });
      toast.success("Security settings updated");
    } catch (error) {
      toast.error("Failed to update security settings");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Wallet Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Wallet</h2>
        <div className="mb-6">
          <p className="text-gray-600">Address</p>
          <p className="font-mono text-sm">{wallet?.address}</p>
        </div>
        <div className="mb-6">
          <p className="text-gray-600">Balance</p>
          <p className="text-3xl font-bold">
            {wallet?.balance.toFixed(2)} {wallet?.currency}
          </p>
        </div>
        <div className="flex gap-4">
          <input
            type="number"
            value={tradeAmount}
            onChange={(e) => setTradeAmount(e.target.value)}
            placeholder="Amount"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={() => handleTrade("buy")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Buy
          </button>
          <button
            onClick={() => handleTrade("sell")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sell
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Security</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <button
              onClick={() => toggleSecurity("twoFactorEnabled")}
              className={`px-4 py-2 rounded ${
                security?.twoFactorEnabled
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {security?.twoFactorEnabled ? "Enabled" : "Disabled"}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Login Notifications</p>
              <p className="text-sm text-gray-600">Get notified of new logins</p>
            </div>
            <button
              onClick={() => toggleSecurity("loginNotifications")}
              className={`px-4 py-2 rounded ${
                security?.loginNotifications
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {security?.loginNotifications ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map((tx) => (
                <tr key={tx._id} className="border-b">
                  <td className="py-2">
                    <span className={tx.type === "buy" ? "text-green-600" : "text-red-600"}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2">
                    {tx.amount} {tx.currency}
                  </td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-600">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!transactions?.length && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
