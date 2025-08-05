import React from 'react';

export default function CongregationalExecutives() {
    return (
        <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-blue-800 mb-3">Connect With Our Branches</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
                Find contact information for all 10 congregations in our district. Reach out to the local presidents for fellowship, events, and spiritual guidance.
            </p>
            </div>

            <div className="overflow-x-auto rounded-lg shadow-md bg-white">
                <table className="w-full min-w-[900px] border-collapse">
                    <thead className="bg-blue-600 text-white">
                        <tr>
                            <th className="py-3 px-4 text-left min-w-[180px] whitespace-nowrap">Congregation</th>
                            <th className="py-3 px-4 text-left min-w-[140px] whitespace-nowrap">Location</th>
                            <th className="py-3 px-4 text-left min-w-[180px] whitespace-nowrap">President</th>
                            <th className="py-3 px-4 text-left min-w-[160px] whitespace-nowrap">Contact</th>
                            <th className="py-3 px-4 text-left min-w-[220px] whitespace-nowrap">Email</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {/* Emmanuel Congregation */}
                        <tr className="hover:bg-blue-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700 min-w-[180px] whitespace-nowrap">Emmanuel Congregation</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[140px] whitespace-nowrap">Ahinsan</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[180px] whitespace-nowrap">George Atsu Anyira</td>
                            <td className="py-4 px-4 min-w-[160px] whitespace-nowrap">
                                <a href="tel:+233XXXXXXXXX" className="text-blue-600 hover:underline">+233 XX XXX XXXX</a>
                            </td>
                            <td className="py-4 px-4 min-w-[220px] whitespace-nowrap">
                                <a href="mailto:emmanuel@example.com" className="text-blue-600 hover:underline">emmanuel@example.com</a>
                            </td>
                        </tr>
                        {/* Peniel Congregation */}
                        <tr className="hover:bg-blue-50 transition-colors bg-gray-50">
                            <td className="py-4 px-4 font-medium text-gray-700 min-w-[180px] whitespace-nowrap">Peniel Congregation</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[140px] whitespace-nowrap">Esreso No1</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[180px] whitespace-nowrap">Samuel Antwi</td>
                            <td className="py-4 px-4 min-w-[160px] whitespace-nowrap">
                                <a href="tel:+233XXXXXXXXX" className="text-blue-600 hover:underline">+233 XX XXX XXXX</a>
                            </td>
                            <td className="py-4 px-4 min-w-[220px] whitespace-nowrap">
                                <a href="mailto:peniel@example.com" className="text-blue-600 hover:underline">peniel@example.com</a>
                            </td>
                        </tr>
                        {/* Mizpah Congregation */}
                        <tr className="hover:bg-blue-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700 min-w-[180px] whitespace-nowrap">Mizpah Congregation</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[140px] whitespace-nowrap">Odagya No1</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[180px] whitespace-nowrap">Joshua Attipoe</td>
                            <td className="py-4 px-4 min-w-[160px] whitespace-nowrap">
                                <a href="tel:+233XXXXXXXXX" className="text-blue-600 hover:underline">+233 XX XXX XXXX</a>
                            </td>
                            <td className="py-4 px-4 min-w-[220px] whitespace-nowrap">
                                <a href="mailto:mizpah@example.com" className="text-blue-600 hover:underline">mizpah@example.com</a>
                            </td>
                        </tr>
                        {/* Christ Congregation */}
                        <tr className="hover:bg-blue-50 transition-colors bg-gray-50">
                            <td className="py-4 px-4 font-medium text-gray-700 min-w-[180px] whitespace-nowrap">Christ Congregation</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[140px] whitespace-nowrap">Ahinsan Estate</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[180px] whitespace-nowrap">Elizabeth</td>
                            <td className="py-4 px-4 min-w-[160px] whitespace-nowrap">
                                <a href="tel:+233XXXXXXXXX" className="text-blue-600 hover:underline">+233 XX XXX XXXX</a>
                            </td>
                            <td className="py-4 px-4 min-w-[220px] whitespace-nowrap">
                                <a href="mailto:christ@example.com" className="text-blue-600 hover:underline">christ@example.com</a>
                            </td>
                        </tr>
                        {/* Favour Congregation */}
                        <tr className="hover:bg-blue-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700 min-w-[180px] whitespace-nowrap">Favour Congregation</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[140px] whitespace-nowrap">Esreso No2</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[180px] whitespace-nowrap">Reigndolf</td>
                            <td className="py-4 px-4 min-w-[160px] whitespace-nowrap">
                                <a href="tel:+233XXXXXXXXX" className="text-blue-600 hover:underline">+233 XX XXX XXXX</a>
                            </td>
                            <td className="py-4 px-4 min-w-[220px] whitespace-nowrap">
                                <a href="mailto:favour@example.com" className="text-blue-600 hover:underline">favour@example.com</a>
                            </td>
                        </tr>
                        {/* Ebenezer Congregation */}
                        <tr className="hover:bg-blue-50 transition-colors bg-gray-50">
                            <td className="py-4 px-4 font-medium text-gray-700 min-w-[180px] whitespace-nowrap">Ebenezer Congregation</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[140px] whitespace-nowrap">Dompoase Aprabo</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[180px] whitespace-nowrap">Priscilla Asante</td>
                            <td className="py-4 px-4 min-w-[160px] whitespace-nowrap">
                                <a href="tel:+233XXXXXXXXX" className="text-blue-600 hover:underline">+233 XX XXX XXXX</a>
                            </td>
                            <td className="py-4 px-4 min-w-[220px] whitespace-nowrap">
                                <a href="mailto:ebenezer@example.com" className="text-blue-600 hover:underline">ebenezer@example.com</a>
                            </td>
                        </tr>
                        {/* Odagya No2 Congregation */}
                        <tr className="hover:bg-blue-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700 min-w-[180px] whitespace-nowrap">Odagya No2 Congregation</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[140px] whitespace-nowrap">Odagya</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[180px] whitespace-nowrap">[President&apos;s Name]</td>
                            <td className="py-4 px-4 min-w-[160px] whitespace-nowrap">
                                <a href="tel:+233XXXXXXXXX" className="text-blue-600 hover:underline">+233 XX XXX XXXX</a>
                            </td>
                            <td className="py-4 px-4 min-w-[220px] whitespace-nowrap">
                                <a href="mailto:odagya@example.com" className="text-blue-600 hover:underline">odagya@example.com</a>
                            </td>
                        </tr>
                        {/* NOM-Kuwait Congregation */}
                        <tr className="hover:bg-blue-50 transition-colors bg-gray-50">
                            <td className="py-4 px-4 font-medium text-gray-700 min-w-[180px] whitespace-nowrap">NOM-Kuwait Congregation</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[140px] whitespace-nowrap">Kuwait</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[180px] whitespace-nowrap">[President&apos;s Name]</td>
                            <td className="py-4 px-4 min-w-[160px] whitespace-nowrap">
                                <a href="tel:+965XXXXXXXX" className="text-blue-600 hover:underline">+965 XX XXX XXX</a>
                            </td>
                            <td className="py-4 px-4 min-w-[220px] whitespace-nowrap">
                                <a href="mailto:nomkuwait@example.com" className="text-blue-600 hover:underline">nomkuwait@example.com</a>
                            </td>
                        </tr>
                        {/* Kokobriko Congregation */}
                        <tr className="hover:bg-blue-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-gray-700 min-w-[180px] whitespace-nowrap">Kokobriko Congregation</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[140px] whitespace-nowrap">Kokobriko</td>
                            <td className="py-4 px-4 text-gray-700 min-w-[180px] whitespace-nowrap">[President&apos;s Name]</td>
                            <td className="py-4 px-4 min-w-[160px] whitespace-nowrap">
                                <a href="tel:+233XXXXXXXXX" className="text-blue-600 hover:underline">+233 XX XXX XXXX</a>
                            </td>
                            <td className="py-4 px-4 min-w-[220px] whitespace-nowrap">
                                <a href="mailto:kokobriko@example.com" className="text-blue-600 hover:underline">kokobriko@example.com</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Download Contact List
            </button>
            <p className="text-gray-500 text-sm mt-3">
                For updates or corrections, please contact the district office at <a href="mailto:district@example.com" className="text-blue-600">district@example.com</a>
            </p>
            </div>
        </div>
        </section>
    );
};

