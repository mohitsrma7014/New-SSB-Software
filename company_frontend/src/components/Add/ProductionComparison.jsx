import React, { useEffect, useState } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const ProductionComparison = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://192.168.1.199:8001/forging/api/monthly-production/")
            .then((response) => response.json())
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full animate-pulse text-white">
                <div className="text-center text-gray-500 text-xl">Loading...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex justify-center items-center h-full text-red-500 text-xl">
                Failed to load data
            </div>
        );
    }

    const {
        current_month_production_ton: currentMonthProduction,
        prev_month_production_ton: lastMonthProduction,
        percentage_difference: percentageDifference,
    } = data;

    const isIncrease = parseFloat(percentageDifference) > 0;
    const isDecrease = parseFloat(percentageDifference) < 0;

    return (
        <div className="user-greeting-box bg-white rounded-xl shadow-lg  hover:shadow-2xl duration-300" style={styles.greetingBox}>
                <div className=" mx-auto p-3  shadow-lg text-white space-y-1 ">
                    {/* Current Month */}
                    <div className="flex justify-between items-center bg-white bg-opacity-20 p-2 rounded-lg shadow-md transform transition-transform hover:scale-105">
                    <div>
                        <h2 className="text-lg font-medium text-black">Current Month Production </h2>
                        <p className="text-lg font-medium text-black">{parseFloat(currentMonthProduction).toFixed(2)} tons</p>
                    </div>
                            <div
                                    className={`flex items-center text-xl font-semibold p-1 rounded-lg shadow-md bg-opacity-30 transition-all ${
                                        isIncrease ? "bg-green-500 text-black" : "bg-red-500 text-black"
                                    }`}
                                >
                                    <span className="mr-2">
                                        {isIncrease ? <FaArrowUp size={20} /> : <FaArrowDown size={20} />}
                                    </span >
                                    <p className="mt-3">{Math.abs(parseFloat(percentageDifference)).toFixed(2)}%</p>
                                    <div>
                                
                                </div>
                                
                        </div>
                        
                    </div>

                    {/* Last Month and Percentage Change in the same row */}
                    <div className="flex justify-between items-center bg-black bg-opacity-20 p-2 rounded-lg shadow-md transform transition-transform hover:scale-105">
                            <h3 className="text-lg font-medium">Last Month Production</h3>
                            <p className="text-lg font-medium">{parseFloat(lastMonthProduction).toFixed(2)} Tons</p>
                    </div>
                </div>
        </div>

    );
};
const styles = {
    greetingBox: {
      margin: "10px 10px 0 10px", // Top, Right, Bottom, Left
    },
   
  };
export default ProductionComparison;
