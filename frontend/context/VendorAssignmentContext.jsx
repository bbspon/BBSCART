import { createContext, useContext, useEffect, useState } from "react";
import instance from "../src/services/axiosInstance";

const Ctx = createContext(null);

export function VendorAssignmentProvider({ children }) {
  const [assigned, setAssigned] = useState(null);
  const [loading, setLoading] = useState(false);

  async function setPincode(pin) {
    setLoading(true);
    try {
      const { data } = await instance.post("/geo/pincode", {
        pincode: pin,
      });
      if (data?.success) setAssigned(data.assigned || null);
           // persist for the rest of the app
     try { localStorage.setItem("deliveryPincode", String(pin)); } catch {}
    document.cookie = `pincode=${encodeURIComponent(pin)}; Max-Age=${60*60*24*365}; Path=/; SameSite=Lax`;
    // notify any subscribers (AllProducts listens for this)
     window.dispatchEvent(new Event("pincode:changed"));
    } finally {
      setLoading(false);
    }
  }

  // Optional: auto-load from cookie on first render
  useEffect(() => {
    let lsPin = "";
  try { lsPin = localStorage.getItem("deliveryPincode") || ""; } catch {}
  const m = document.cookie.match(/(?:^|;\s*)pincode=([^;]+)/); // allow optional space
 const cookiePin = m ? decodeURIComponent(m[1]) : "";
 if (lsPin) {
   // We already have a pin in LS → just notify listeners; do NOT overwrite via POST    window.dispatchEvent(new Event("pincode:changed"));
 } else if (cookiePin) {
   // First-time visit: promote cookie → LS and inform backend via POST
   setPincode(cookiePin);
 }
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
