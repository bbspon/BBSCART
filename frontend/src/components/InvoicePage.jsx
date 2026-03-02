import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./invoice.css";

const InvoicePage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`/api/orders/${id}/invoice`);
        setInvoice(res.data?.invoice);
      } catch (err) {
        console.error("Invoice fetch error:", err);
      }
    };

    if (id && id !== "undefined") {
      fetchInvoice();
    }
  }, [id]);

  if (!invoice || !Array.isArray(invoice.items)) {
    return <div>Loading invoice...</div>;
  }

  return (
    <div className="invoice-wrapper">
      <div className="invoice-container">

        <div className="invoice-header">
          <div>
            <h2>BBSCART MARKETPLACE</h2>
            <p>GSTIN: 33ABCDE1234F1Z5</p>
            <p>Chennai, Tamil Nadu - 600001</p>
          </div>

          <div className="invoice-meta">
            <h3>TAX INVOICE</h3>
            <p><strong>Invoice No:</strong> {invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            <p><strong>Order Ref:</strong> {invoice.orderId}</p>
          </div>
        </div>

        <div className="invoice-address-section">
          <h4>Bill To:</h4>
          <p>{invoice.buyer?.address?.street}</p>
          <p>
            {invoice.buyer?.address?.city},{" "}
            {invoice.buyer?.address?.state}
          </p>
          <p>{invoice.buyer?.address?.postalCode}</p>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Taxable</th>
              <th>CGST</th>
              <th>SGST</th>
              <th>IGST</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item._id}>
                <td>{item.product}</td>
                <td>{item.hsnCode}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price.toFixed(2)}</td>
                <td>₹{item.lineBase.toFixed(2)}</td>
                <td>₹{item.cgst.toFixed(2)}</td>
                <td>₹{item.sgst.toFixed(2)}</td>
                <td>₹{item.igst.toFixed(2)}</td>
                <td>₹{item.lineTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-totals">
          <table>
            <tbody>
              <tr>
                <td>Taxable Total:</td>
                <td>₹{invoice.totals.taxableTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>GST Total:</td>
                <td>₹{invoice.totals.gstTotal.toFixed(2)}</td>
              </tr>
              <tr className="grand-total">
                <td>Grand Total:</td>
                <td>₹{invoice.totals.grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="amount-words">
          <strong>Amount in Words:</strong> {invoice.totals.amountInWords}
        </div>

        <div className="invoice-footer">
          <p>This is a computer generated invoice.</p>
          <p>Goods once sold will not be taken back.</p>
        </div>

      </div>
    </div>
  );
};

export default InvoicePage;