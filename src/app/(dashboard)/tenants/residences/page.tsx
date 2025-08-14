"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetCurrentResidencesQuery,
  useGetTenantQuery,
} from "@/state/api";
import React from "react";

const Residences = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );

  const {
    data: currentResidences,
    isLoading,
    error,
  } = useGetCurrentResidencesQuery(authUser?.cognitoInfo?.userId || "", {
    skip: !authUser?.cognitoInfo?.userId,
  });

  // Show loading while fetching data
  if (isLoading) return <Loading />;

  return (
    <div className="dashboard-container">
      <Header
        title="Current Residences"
        subtitle="View and manage your current living spaces"
      />

      {/* Show residences if they exist */}
      {currentResidences && currentResidences.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentResidences.map((property) => (
            <Card
              key={property.id}
              property={property}
              isFavorite={tenant?.favorites.includes(property.id) || false}
              onFavoriteToggle={() => {}}
              showFavoriteButton={false}
              propertyLink={`/tenants/residences/${property.id}`}
            />
          ))}
        </div>
      )}

      {/* Show "no residences" message when there are no residences */}
      {(!currentResidences || currentResidences.length === 0) && (
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Current Residences
            </h3>
            <p className="text-gray-600">
              You don&lsquo;t have any current residences at the moment.
            </p>
          </div>
        </div>
      )}

      {/* Show error message only for debugging purposes */}
      {error && (
        <details className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <summary className="text-yellow-800 font-medium cursor-pointer">
            Debug: API Error Details
          </summary>
          <pre className="mt-2 text-sm text-yellow-700 whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default Residences;
