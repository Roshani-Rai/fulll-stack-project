// components/DownloadPrescription.jsx
export default function DownloadPrescription({ prescriptionId }) {
  const handleDownload = () => {
    window.open(`/api/prescription/${prescriptionId}`, '_blank');
  };

  return (
    <button onClick={handleDownload}>
      Download Prescription (PDF)
    </button>
  );
}