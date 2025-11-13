import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
const BundleForm = () => {
  const [modules, setModules] = useState([
    {
      Module: "",
      Product: "",
      dependsOn: [],
      Activities: [
        {
          Subtask: "",
          Description: "",
          Basic: false,
          Intermediate: false,
          Advanced: false,
          EstimatedTime: "",
        },
      ],
    },
  ]);

  const handleModuleChange = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  const handleActivityChange = (moduleIndex, activityIndex, field, value) => {
    const updated = [...modules];
    updated[moduleIndex].Activities[activityIndex][field] =
      field.includes("EstimatedTime") ? parseFloat(value) : value;
    setModules(updated);
  };

  const handleCheckboxChange = (moduleIndex, activityIndex, field) => {
    const updated = [...modules];
    updated[moduleIndex].Activities[activityIndex][field] =
      !updated[moduleIndex].Activities[activityIndex][field];
    setModules(updated);
  };

  const addActivity = (moduleIndex) => {
    const updated = [...modules];
    updated[moduleIndex].Activities.push({
      Subtask: "",
      Description: "",
      Basic: false,
      Intermediate: false,
      Advanced: false,
      EstimatedTime: "",
    });
    setModules(updated);
  };

  const addModule = () => {
    setModules([
      ...modules,
      {
        Module: "",
        Product: "",
        dependsOn: [],
        Activities: [
          {
            Subtask: "",
            Description: "",
            Basic: false,
            Intermediate: false,
            Advanced: false,
            EstimatedTime: "",
          },
        ],
      },
    ]);
  };

  const handleSubmit = () => {
    if (modules.length === 0) {
      toast.error("Please add at least one module before submitting.");
      return;
    }

    console.log("Submitted JSON:", JSON.stringify(modules, null, 2));
    toast.success("Bundle form submitted successfully!");
  };


  return (
    <>

      <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6 lg:p-8 w-[90%] lg:w-[100%] md:w-[92%] ">
        {modules.map((mod, i) => (
          <div key={i} className="border p-4 rounded-lg shadow space-y-4">
            <h2 className="text-lg font-bold">Module {i + 1}</h2>

            <input
              type="text"
              placeholder="Module Name"
              value={mod.Module}
              onChange={(e) => handleModuleChange(i, "Module", e.target.value)}
              className="w-full p-2 border rounded"
            />

            <input
              type="text"
              placeholder="Product"
              value={mod.Product}
              onChange={(e) => handleModuleChange(i, "Product", e.target.value)}
              className="w-full p-2 border rounded"
            />

            {mod.Activities.map((act, j) => (
              <div
                key={j}
                className="p-3 border border-dashed rounded space-y-2 bg-gray-50"
              >
                <h3 className="font-semibold">Activity {j + 1}</h3>
                <input
                  type="text"
                  placeholder="Subtask"
                  value={act.Subtask}
                  onChange={(e) =>
                    handleActivityChange(i, j, "Subtask", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
                <textarea
                  placeholder="Description"
                  value={act.Description}
                  onChange={(e) =>
                    handleActivityChange(i, j, "Description", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
                <div className="flex items-center gap-4">
                  {["Basic", "Intermediate", "Advanced"].map((level) => (
                    <label key={level} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={act[level]}
                        onChange={() =>
                          handleCheckboxChange(i, j, level)
                        }
                      />
                      {level}
                    </label>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Estimated Time (hours)"
                  value={act.EstimatedTime}
                  onChange={(e) =>
                    handleActivityChange(i, j, "EstimatedTime", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() => addActivity(i)}
              className="mt-2 bg-[#06A1E3] text-white px-3 py-1 rounded"
            >
              + Add Activity
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addModule}
          className="bg-[#06A1E3] text-white px-4 py-2 rounded me-3"
        >
          + Add Module
        </button>

        <button
          type="submit"
          className="bg-[#06A1E3] text-white px-6 py-2 rounded hover:bg-gray-800 ms-2"
        >
          Submit
        </button>
      </form>
      <ToastContainer />
    </>

  );
};

export default BundleForm;
