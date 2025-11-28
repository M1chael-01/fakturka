import GetBackendURL from "./GetBackendURL";

export class Generate {
  async file(id) {
    try {
      const res = await fetch(`${GetBackendURL()}/invoice/generateFile`, {
        method: "POST",              
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }), 
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      return data;

    } catch (err) {
      console.error("Chyba při generování souboru:", err);
      throw err;
    }
  }
}
