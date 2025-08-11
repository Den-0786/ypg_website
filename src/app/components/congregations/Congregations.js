import React, { useState, useEffect } from "react";
import { branchPresidentAPI } from "../../../utils/api";

export default function CongregationalExecutives() {
  const [presidents, setPresidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPresidents();
  }, []);

  const fetchPresidents = async () => {
    try {
      setLoading(true);
      const data = await branchPresidentAPI.getPresidents();
      setPresidents(data);
    } catch (error) {
      console.error("Error fetching presidents:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-blue-800 mb-3">
              Connect With Our Branches
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find contact information for all congregations in our district.
              Reach out to the local presidents for fellowship, events, and
              spiritual guidance.
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-blue-800 mb-3">
            Connect With Our Branches
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find contact information for all congregations in our district.
            Reach out to the local presidents for fellowship, events, and
            spiritual guidance.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg shadow-md bg-white">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left min-w-[180px] whitespace-nowrap">
                  Name
                </th>
                <th className="py-3 px-4 text-left min-w-[180px] whitespace-nowrap">
                  Congregation
                </th>
                <th className="py-3 px-4 text-left min-w-[140px] whitespace-nowrap">
                  Location
                </th>
                <th className="py-3 px-4 text-left min-w-[160px] whitespace-nowrap">
                  Contact
                </th>
                <th className="py-3 px-4 text-left min-w-[220px] whitespace-nowrap">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {presidents.map((president, index) => (
                <tr
                  key={president.id}
                  className={`hover:bg-blue-50 transition-colors ${index % 2 === 1 ? "bg-gray-50" : ""}`}
                >
                  <td className="py-4 px-4 font-medium text-gray-700 min-w-[180px] whitespace-nowrap">
                    {president.president_name}
                  </td>
                  <td className="py-4 px-4 text-gray-700 min-w-[180px] whitespace-nowrap">
                    {president.congregation}
                  </td>
                  <td className="py-4 px-4 text-gray-700 min-w-[140px] whitespace-nowrap">
                    {president.location}
                  </td>
                  <td className="py-4 px-4 min-w-[160px] whitespace-nowrap">
                    <a
                      href={`tel:${president.phone_number}`}
                      className="text-blue-600 hover:underline"
                    >
                      {president.phone_number}
                    </a>
                  </td>
                  <td className="py-4 px-4 min-w-[220px] whitespace-nowrap">
                    <a
                      href={`mailto:${president.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {president.email}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Download Contact List
          </button>
          <p className="text-gray-500 text-sm mt-3">
            For updates or corrections, please contact the district office at{" "}
            <a href="mailto:district@example.com" className="text-blue-600">
              district@example.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
