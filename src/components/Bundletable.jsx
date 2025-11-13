import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Bundletabel() {
  const [product, setProduct] = useState("");
  const [rows, setRows] = useState([
    {
      products: "",
      module: "",
      depends: "",
      activity: "",
      description: "",
      basic: false,
      intermediate: false,
      advance: false,
      estTime: "",
    },
  ]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        products: "",
        module: "",
        depends: "",
        activity: "",
        description: "",
        basic: false,
        intermediate: false,
        advance: false,
        estTime: "",
      },
    ]);
  };

  const handleChange = (index, key, value) => {
    const updated = [...rows];
    updated[index][key] = value;
    setRows(updated);
  };

  const handleSubmit = () => {
    const transformed = rows.map((row) => ({
      product: product,
      Module: row.module,
      dependsOn: row.depends ? [row.depends] : [],
      Activities: [
        {
          Subtask: row.activity,
          Description: row.description,
          Basic: row.basic,
          Intermediate: row.intermediate,
          Advanced: row.advance,
          EstimatedTime: parseInt(row.estTime),
        },
      ],
      isActive: true,
    }));

    console.log("Transformed JSON:", JSON.stringify(transformed, null, 2));
    toast.success("Submitted successfully!");
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <div>
        <h2 className="text-2xl font-bold">products</h2><br />
        <select
          value="product"
          className="w-[15%] border focus:ring-blue-300"
          onChange={(e) => setProduct(e.target.value)}
          style={{ height: "42px" }}
        >
          <option value="">Select products...</option>
          <option>Zoho Books</option>
          <option>Zoho CRM</option>
          <option>Zoho Catalyst</option>
          <option>Zoho Workplaces</option>
        </select>

      </div>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg mt-4">
        <table className="min-w-full table-auto authors-list">
          <thead className="sticky top-0 bg-gray-200 text-white">
            <tr className="text-gray-500">
              {/* <th className="p-2">Products</th> */}
              <th className="p-2">Module Name</th>
              <th className="p-2">Depends On</th>
              <th className="p-2">Activity</th>
              <th className="p-2">Description</th>
              <th className="p-2">Basic</th>
              <th className="p-2">Intermediate</th>
              <th className="p-2">Advance</th>
              <th className="p-2">EST. time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="text-center border-b">
                {/* <td className="px-4 py-2">
                  <select
                    value={row.products}
                    onChange={(e) => handleChange(index, "products", e.target.value)}
                    style={{ height: "42px" }}
                  >
                    <option value="">Select</option>
                    <option>Zoho Books</option>
                    <option>Zoho CRM</option>
                    <option>Zoho Catalyst</option>
                    <option>Zoho Workplaces</option>
                  </select>
                </td> */}
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.module}
                    placeholder="Module Name"
                    onChange={(e) => handleChange(index, "module", e.target.value)}
                    className="bg-gray-100"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.depends}
                    placeholder="Depends On Details"
                    onChange={(e) => handleChange(index, "depends", e.target.value)}
                    className="bg-gray-100"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.activity}
                    placeholder="Activity Details"
                    onChange={(e) => handleChange(index, "activity", e.target.value)}
                    className="bg-gray-100"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.description}
                    placeholder=" Description Details"
                    onChange={(e) => handleChange(index, "description", e.target.value)}
                    className="bg-gray-100"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={row.basic}
                    onChange={(e) => handleChange(index, "basic", e.target.checked)}
                    className="bg-gray-100"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={row.intermediate}
                    onChange={(e) => handleChange(index, "intermediate", e.target.checked)}
                    className="bg-gray-100"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={row.advance}
                    onChange={(e) => handleChange(index, "advance", e.target.checked)}
                    className="bg-gray-100"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={row.estTime}
                    placeholder="Estimation Time"
                    onChange={(e) => handleChange(index, "estTime", e.target.value)}
                    className="bg-gray-100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <button
          className="bg-[#06A1E3] add-row-button text-white px-4 py-2 rounded mt-4"
          onClick={handleAddRow}
        >
          ADD Row
        </button>
      </div>
      <button className="bg-[#06A1E3] text-white px-4 py-2 rounded" onClick={handleSubmit}>
        Submit as JSON
      </button>
    </div>
  );
}
