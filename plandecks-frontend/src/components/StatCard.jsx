import React from 'react';

export default function StatCard({ title, value, icon, color, footerText }) {
    // Renk haritası
    const colorClasses = {
        orange: "bg-orange-500 shadow-orange-500/40",
        green: "bg-green-500 shadow-green-500/40",
        red: "bg-red-500 shadow-red-500/40",
        blue: "bg-blue-500 shadow-blue-500/40",
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 relative mt-6">
            {/* Floating Icon */}
            <div className={`absolute -top-6 left-4 p-4 rounded-lg shadow-lg text-white ${colorClasses[color]}`}>
                {icon}
            </div>

            {/* Content */}
            <div className="text-right pt-2">
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>

            <div className="border-t mt-4 pt-3">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                    {footerText}
                </p>
            </div>
        </div>
    );
}