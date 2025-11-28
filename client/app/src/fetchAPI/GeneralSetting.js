import GetBackendURL from "../../src/Components/GetBackendURL";

  const getUserSetting = async () => {
    try {
      const res = await fetch(`${GetBackendURL()}/userSetting/getUserSetting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id: 0 }), 
      });

      if (!res.ok) throw new Error("Nepodařilo se načíst nastavení");

      const data = await res.json();
      console.log("User setting:", data);
      return data;
    } catch (error) {
      console.error("Chyba při získávání nastavení:", error);
      return null;
    }
  };


  export default getUserSetting;

