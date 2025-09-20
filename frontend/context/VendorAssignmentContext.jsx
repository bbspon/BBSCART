import { createContext, useContext, useEffect, useState } from "react";
import instance from "../src/services/axiosInstance";

const Ctx = createContext(null);

export function VendorAssignmentProvider({ children }) {
  const [assigned, setAssigned] = useState(null);
  const [loading, setLoading] = useState(false);

  async function setPincode(pin) {
    setLoading(true);
    try {
      const { data } = await instance.post("/api/geo/pincode", {
        pincode: pin,
      });
      if (data?.success) setAssigned(data.assigned || null);
    } finally {
      setLoading(false);
    }
  }

  // Optional: auto-load from cookie on first render
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )pincode=([^;]+)/);
    const pin = m ? decodeURIComponent(m[1]) : "";
    if (pin) setPincode(pin);
  }, []);

  return (
    <Ctx.Provider value={{ assigned, loading, setPincode }}>
      {children}
    </Ctx.Provider>
  );
}

export function useVendorAssignment() {
  return useContext(Ctx);
}
