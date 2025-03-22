import { useMemo } from "react";
import { motion } from "framer-motion";

const KPIHighlights = ({ data = [] }) => {
  const safeData = Array.isArray(data) ? data : [];

  const {
    totalPieces,
    totalWeight,
    totalDispatched,
    totalBalance,
    dispatchedTonnage,
    remainingTonnage,
  } = useMemo(() => {
    return safeData.reduce(
      (totals, item) => {
        const pieces = Number(item.pices) || 0;
        const weight = Number.parseFloat(item.weight) || 0;
        const dispatched = Number(item.dispatched) || 0;
        const balance = Number(item.balance) || 0;
        const slugWeight = Number.parseFloat(item.slug_weight) || 0;

        return {
          totalPieces: totals.totalPieces + pieces,
          totalWeight: totals.totalWeight + weight,
          totalDispatched: totals.totalDispatched + dispatched,
          totalBalance: totals.totalBalance + balance,
          dispatchedTonnage: totals.dispatchedTonnage + dispatched * slugWeight,
          remainingTonnage: totals.remainingTonnage + balance * slugWeight,
        };
      },
      {
        totalPieces: 0,
        totalWeight: 0,
        totalDispatched: 0,
        totalBalance: 0,
        dispatchedTonnage: 0,
        remainingTonnage: 0,
      }
    );
  }, [safeData]);

  const weightInTons = (totalWeight / 1000).toFixed(2);
  const dispatchedTonnageInTons = (dispatchedTonnage / 1000).toFixed(2);
  const remainingTonnageInTons = (remainingTonnage / 1000).toFixed(2);
  const deliveryRating = totalPieces > 0 ? ((totalDispatched / totalPieces) * 100).toFixed(2) : "0.00";

  const kpis = [
    { title: "Total Schedule", value: `${totalPieces.toLocaleString()} Pcs. / ${weightInTons} Tons` },
    { title: "Dispatched", value: `${totalDispatched.toLocaleString()} Pcs. / ${dispatchedTonnageInTons} Tons` },
    { title: "Remaining ", value: `${totalBalance.toLocaleString()} Pcs. / ${remainingTonnageInTons} Tons` },
    { title: "Overall Delivery Rating", value: `${deliveryRating}%` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-black justify-center items-center text-center mt-4">
      {kpis.map((kpi, index) => (
        <motion.div
          key={index}
          className="p-1 rounded-lg shadow-md bg-white border border-gray-300 flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <h2 className="text-base font-semibold mb-1 text-gray-700">{kpi.title}</h2>
          <p className="text-xl font-medium text-gray-900">{kpi.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default KPIHighlights;
