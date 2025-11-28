import GetBackendURL from "../Components/GetBackendURL";

export class ReadInvoice {
  async fetchedData(type) {
    try {
      const res = await fetch(`${GetBackendURL()}/invoice/getInvoices?type=${encodeURIComponent(type)}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Chyba při načítání faktur:", err);
      return null; 
    }
  }
}
