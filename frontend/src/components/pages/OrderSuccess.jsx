import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function OrderSuccess() {
  const location = useLocation();
  const state = location.state || {};
  const { sentToDelivery, trackingId, order } = state;

  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Order placed successfully
        </h1>
        <p className="text-gray-600 mb-4">
          Thank you for your order. We will process it shortly.
        </p>
        {sentToDelivery && (
          <div className="mt-4 p-4 rounded-lg bg-white border border-green-100 text-left">
            <p className="font-medium text-green-800">
              Assigned order has been sent to the delivery app.
            </p>
            {trackingId && (
              <p className="mt-2 text-sm text-gray-600">
                Tracking ID: <span className="font-mono font-medium">{trackingId}</span>
              </p>
            )}
          </div>
        )}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            View my orders
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
