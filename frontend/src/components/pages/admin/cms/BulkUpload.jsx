import { useState } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true, // admin usually authenticated
});

function Field({ label, children }) {
  return (
    <label className="mb-3 block">
      <div className="mb-1 text-sm font-medium">{label}</div>
      {children}
    </label>
  );
}

export default function BulkUpload() {
  const [catCSV, setCatCSV] = useState(null);
  const [subCSV, setSubCSV] = useState(null);
  const [prodCSV, setProdCSV] = useState(null);
  const [prodZIP, setProdZIP] = useState(null);

  const [status, setStatus] = useState("");

  async function uploadCats() {
    const fd = new FormData();
    fd.append("csv", catCSV);
    const { data } = await API.post(
      "/api/products/catalog/import/categories",
      fd
    );
    setStatus(`Categories upserted: ${data.upserts}`);
  }
  async function uploadSubs() {
    const fd = new FormData();
    fd.append("csv", subCSV);
    const { data } = await API.post(
      "/api/products/catalog/import/subcategories",
      fd
    );
    setStatus(`Sub-categories upserted: ${data.upserts}`);
  }
async function uploadProducts() {
  const fd = new FormData();
  fd.append("csv", prodCSV);
  if (prodZIP) fd.append("images", prodZIP);
  try {
    const { data, status } = await API.post("/api/products/import/csv", fd);
    console.log("import response:", data);
    setStatus(
      status === 207
        ? `Upserts: ${data.upserts}. Some rows failed: ${data.errors
            .slice(0, 3)
            .map((e) => `#${e.row} ${e.message}`)
            .join("; ")}`
        : `Products upserted: ${data.upserts}`
    );
  } catch (err) {
    console.error(err);
    setStatus(err.response?.data?.message || "Import failed");
  }
}


  function downloadTemplate(kind) {
    const templates = {
      categories:
        "name,slug,icon\nGroceries,groceries,\nEdible Oil,edible-oils,\n",
      subcategories:
        "categoryName,categoryId,name,slug\nGroceries,,Rice & Grains,rice-grains\nGroceries,,Pulses & Dals,pulses-dals\nEdible Oil,,Cooking Oils,cooking-oils\n",
      products:
        [
          "name,SKU,brand,description,price,mrp,sale,stock,weight,length,width,height,tags,product_img,imageFile,gallery_imgs,",
          "categoryName,subcategoryName,categoryId,subcategoryId,",
          "rating_avg,rating_count,",
          "usedFor,processingType,fssaiNumber,maxShelfLifeDays,foodPreference,containerType,organic,addedPreservatives,ingredients,nutrientContent,netQuantityRaw,netQuantityValue,netQuantityUnit,packOf,additives,usageInstructions,",
          "seller_id,is_variant,is_review,assured,bestseller,gstInvoice,deliveryIn1Day,exchangeOffer",
        ].join("") +
        "\n" +
        [
          'Royal Basmati Rice,RICE-BASMATI-1KG,Royal Harvest,Aged basmati…,149,179,149,120,1000,20,14,6,"rice;staples;basmati",,basmati.jpg,,',
          "Groceries,Rice & Grains,,,4.5,12300,",
          "Cooking,Polished,10012099000000,365,Vegetarian,Pouch,false,false,Basmati Rice,Carbohydrates|Protein,1 kg,,,1,,Rinse and cook with 1:2 water,",
          "REPLACE_SELLER_ID,false,true,true,true,true,false,Upto ₹100 Off",
        ].join(""),
    };
    const blob = new Blob([templates[kind]], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${kind}-template.csv`;
    a.click();
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Bulk Upload</h1>

      <div className="mb-8 rounded border p-4">
        <h2 className="mb-2 text-lg font-medium">Categories (CSV)</h2>
        <Field label="CSV">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCatCSV(e.target.files?.[0] || null)}
          />
        </Field>
        <div className="flex gap-2">
          <button
            className="rounded bg-blue-600 px-3 py-2 text-white"
            onClick={uploadCats}
            disabled={!catCSV}
          >
            Upload
          </button>
          <button
            className="rounded border px-3 py-2"
            onClick={() => downloadTemplate("categories")}
          >
            Download template
          </button>
        </div>
      </div>

      <div className="mb-8 rounded border p-4">
        <h2 className="mb-2 text-lg font-medium">Sub-categories (CSV)</h2>
        <Field label="CSV">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setSubCSV(e.target.files?.[0] || null)}
          />
        </Field>
        <div className="flex gap-2">
          <button
            className="rounded bg-blue-600 px-3 py-2 text-white"
            onClick={uploadSubs}
            disabled={!subCSV}
          >
            Upload
          </button>
          <button
            className="rounded border px-3 py-2"
            onClick={() => downloadTemplate("subcategories")}
          >
            Download template
          </button>
        </div>
      </div>

      <div className="mb-6 rounded border p-4">
        <h2 className="mb-2 text-lg font-medium">
          Products (CSV + optional images ZIP)
        </h2>
        <Field label="CSV">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setProdCSV(e.target.files?.[0] || null)}
          />
        </Field>
        <Field label="Images ZIP (optional)">
          <input
            type="file"
            accept=".zip"
            onChange={(e) => setProdZIP(e.target.files?.[0] || null)}
          />
        </Field>
        <div className="flex gap-2">
          <button
            className="rounded bg-green-600 px-3 py-2 text-white"
            onClick={uploadProducts}
            disabled={!prodCSV}
          >
            Upload
          </button>
          <button
            className="rounded border px-3 py-2"
            onClick={() => downloadTemplate("products")}
          >
            Download template
          </button>
        </div>
      </div>

      {status && (
        <div className="rounded bg-emerald-50 p-3 text-sm">{status}</div>
      )}

      <div className="mt-6 text-xs text-gray-600">
        <div>Tips:</div>
        <ul className="list-disc pl-5">
          <li>
            Use either names (categoryName/subcategoryName) or IDs
            (categoryId/subcategoryId). Names win.
          </li>
          <li>
            To link images from ZIP, put file names in <code>imageFile</code> or{" "}
            <code>gallery_imgs</code>.
          </li>
          <li>Booleans accept yes/no/true/false/1/0.</li>
        </ul>
      </div>
    </div>
  );
}
