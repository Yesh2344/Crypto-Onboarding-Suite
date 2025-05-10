import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function OnboardingFlow({ progress }: { progress: any }) {
  const initializeOnboarding = useMutation(api.onboarding.initializeOnboarding);
  const submitKYC = useMutation(api.onboarding.submitKYC);
  const verifyDocuments = useMutation(api.onboarding.verifyDocuments);
  const connectWallet = useMutation(api.onboarding.connectWallet);

  const [kycData, setKycData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    address: "",
    documentType: "passport",
    documentNumber: "",
    nationality: "",
    phoneNumber: ""
  });

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateKYC = () => {
    const newErrors: Record<string, string> = {};
    
    if (!kycData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!kycData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!kycData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!kycData.address.trim()) newErrors.address = "Address is required";
    if (!kycData.documentNumber.trim()) newErrors.documentNumber = "Document number is required";
    if (!kycData.nationality.trim()) newErrors.nationality = "Nationality is required";
    if (!kycData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if (!/^\+?[\d\s-]{8,}$/.test(kycData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartOnboarding = async () => {
    await initializeOnboarding();
  };

  const handleKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateKYC()) return;
    
    try {
      await submitKYC(kycData);
      toast.success("KYC information submitted");
    } catch (error) {
      toast.error("Failed to submit KYC");
    }
  };

  const handleVerification = async () => {
    try {
      const isVerified = await verifyDocuments();
      if (isVerified) {
        toast.success("Documents verified successfully");
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } catch (error) {
      toast.error("Verification process failed");
    }
  };

  const handleWalletConnect = async () => {
    if (!recoveryEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) {
      setErrors({ recoveryEmail: "Valid recovery email is required" });
      return;
    }

    try {
      const mockAddress = "0x" + Math.random().toString(16).slice(2, 42);
      await connectWallet({ 
        address: mockAddress,
        recoveryEmail 
      });
      toast.success("Wallet connected successfully");
    } catch (error) {
      toast.error("Failed to connect wallet");
    }
  };

  const renderProgressBar = () => {
    const steps = ["kyc", "verification", "wallet", "complete"];
    const currentStepIndex = steps.indexOf(progress?.step ?? "kyc");
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setKycData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold accent-text mb-4">Complete Your Profile</h1>
        {progress && renderProgressBar()}
        {!progress ? (
          <button
            onClick={handleStartOnboarding}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Start Onboarding
          </button>
        ) : progress.step === "kyc" ? (
          <form onSubmit={handleKYCSubmit} className="max-w-md mx-auto space-y-4">
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={kycData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={`w-full p-2 border rounded ${errors.firstName ? 'border-red-500' : ''}`}
              />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Last Name"
                value={kycData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`w-full p-2 border rounded ${errors.lastName ? 'border-red-500' : ''}`}
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
            </div>
            <div>
              <input
                type="date"
                placeholder="Date of Birth"
                value={kycData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                className={`w-full p-2 border rounded ${errors.dateOfBirth ? 'border-red-500' : ''}`}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Address"
                value={kycData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={`w-full p-2 border rounded ${errors.address ? 'border-red-500' : ''}`}
              />
              {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
            </div>
            <div>
              <select
                value={kycData.documentType}
                onChange={(e) => handleInputChange("documentType", e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
                <option value="drivers_license">Driver's License</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                placeholder="Document Number"
                value={kycData.documentNumber}
                onChange={(e) => handleInputChange("documentNumber", e.target.value)}
                className={`w-full p-2 border rounded ${errors.documentNumber ? 'border-red-500' : ''}`}
              />
              {errors.documentNumber && <p className="text-red-500 text-sm">{errors.documentNumber}</p>}
            </div>
            <div>
              <input
                type="text"
                placeholder="Nationality"
                value={kycData.nationality}
                onChange={(e) => handleInputChange("nationality", e.target.value)}
                className={`w-full p-2 border rounded ${errors.nationality ? 'border-red-500' : ''}`}
              />
              {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality}</p>}
            </div>
            <div>
              <input
                type="tel"
                placeholder="Phone Number (e.g., +1234567890)"
                value={kycData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                className={`w-full p-2 border rounded ${errors.phoneNumber ? 'border-red-500' : ''}`}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Submit KYC Information
            </button>
          </form>
        ) : progress.step === "verification" ? (
          <div className="space-y-4">
            <p className="text-amber-600">Verification Required</p>
            {progress.verificationAttempts ? (
              <p className="text-sm text-gray-600">Previous attempts: {progress.verificationAttempts}</p>
            ) : null}
            <button
              onClick={handleVerification}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Verify Documents
            </button>
          </div>
        ) : progress.step === "wallet" ? (
          <div className="space-y-4">
            <p className="text-green-600">KYC Completed ✓</p>
            {progress.riskLevel && (
              <div className={`text-sm ${
                progress.riskLevel === "low" ? "text-green-600" :
                progress.riskLevel === "medium" ? "text-amber-600" :
                "text-red-600"
              }`}>
                Risk Level: {progress.riskLevel.toUpperCase()}
              </div>
            )}
            <div>
              <input
                type="email"
                placeholder="Recovery Email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                className={`w-full p-2 border rounded mb-2 ${errors.recoveryEmail ? 'border-red-500' : ''}`}
              />
              {errors.recoveryEmail && <p className="text-red-500 text-sm">{errors.recoveryEmail}</p>}
            </div>
            <button
              onClick={handleWalletConnect}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-green-600">Onboarding Complete ✓</p>
            <p className="text-sm text-gray-600">Wallet: {progress.walletAddress}</p>
            <p className="text-sm text-gray-600">Recovery Email: {progress.recoveryEmail}</p>
            {progress.backupCodes && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Backup Codes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {progress.backupCodes.map((code: string, i: number) => (
                    <div key={i} className="bg-gray-100 p-2 rounded text-mono">{code}</div>
                  ))}
                </div>
                <p className="text-sm text-red-600 mt-2">
                  Save these codes securely. They won't be shown again.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
