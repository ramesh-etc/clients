import React, { useState } from 'react';
import Loader from "./Loader";

function ProfileVerify() {
  const [url, setUrl] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [cdnLinks, setCdnLinks] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractedLinks, setExtractedLinks] = useState([]);
  const [email, setEmail] = useState([]);
  const [phonenumber, setPhonenumber] = useState([]);
  const [address, setAddress] = useState([]);

  const scrapeWebsite = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL.");
      return;
    }

    setError("");
    setTechnologies([]);
    setMetadata(null);
    setCdnLinks([]);
    setExtractedLinks([]);
    setLoading(true);
    setEmail([]);
    setAddress([]);
    setPhonenumber([]);


    try {
      const response = await fetch(`https://web-scraper-60025258148.development.catalystserverless.in/server/collect-data/scrape-tech?url=${encodeURIComponent(url)}`);
      const result = await response.json();

      if (result.success) {
        const filteredLinks = Array.from(
          new Set(
            result.extractedLinks
              .map(link => {
                if (link.startsWith("mailto:")) {
                  return link; 
                }
                try {
                  const url = new URL(link);
                  return url.hostname; 
                } catch {
                  return null; 
                }
              })
              .filter(Boolean)
          )
        );
        setExtractedLinks(filteredLinks);
        setCdnLinks(result.cdnLinks || []);
        setMetadata(result.metadata);
        setTechnologies(result.technologies || []);
        setAddress(result.addresses || []);
        setEmail(result.emails || []);
        setPhonenumber(result.phoneNumbers || []);
      } else {
        setError("Failed to scrape data.");
      }
    } catch (error) {
      setError("Error fetching data.");
      console.error(error);
    } finally {
        setLoading(false);
    }
  };

  // Clean up links
  const filteredLinks = extractedLinks
    .map(link => {
      if (link.startsWith("mailto:")) {
        return link;
      }
      try {
        const url = new URL(link);
        return url.hostname;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  console.log(filteredLinks);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center bg-grey-200 p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Profile Verification</h2>

      <div className="bg-white shadow-lg rounded-xl p-6 w-full container item-center ">
        <input
          type="text"
          className="w-full p-3 border border-[#197194] rounded-md focus:outline-none mb-[20px] focus:ring-2 focus:ring-[#197194]"
          placeholder="Enter website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={scrapeWebsite}
          className="bg-[#197194] hover:opacity-90 text-white px-6 py-1 rounded-2xl text-md font-semibold shadow-lg transition-all duration-300"
          disabled={loading}
        >
          {loading ? "Scraping..." : "Scrape Website"}
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-[60vh] top-0">
            <Loader />
          </div>
        ) : (
          error && <p className="mt-4 text-red-600 text-sm">{error}</p>
        )}
      </div>

      {(email.length > 0 || phonenumber.length > 0 || address.length > 0) && (
        <div className="mt-6 bg-white shadow-lg rounded-xl p-6 w-full container">
          <h3 className="text-xl font-semibold mb-3">Contact Information</h3>

          {email.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-blue-600">Emails:</h4>
              <ul className="list-disc pl-5 text-gray-700">
                {[...new Set(email)].map((e, index) => (
                  <li key={index}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {phonenumber.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-green-600">Phone Numbers:</h4>
              <ul className="list-disc pl-5 text-gray-700">
                {[...new Set(phonenumber)].map((p, index) => (
                  <li key={index}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {address.length > 0 && (
            <div>
              <h4 className="font-semibold text-purple-600">Addresses:</h4>
              <ul className="list-disc pl-5 text-gray-700 space-y-2">
                {[...new Set(address)].map((a, index) => (
                  <li key={index}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileVerify;
