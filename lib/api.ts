// Firestore REST API utility for solor-garden
const PROJECT_ID = "solor-garden";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Helper to fetch latest sensor data (most recent document in 'sensors')
export async function fetchLatestSensorData() {
  const url = `${BASE_URL}/sensors?pageSize=1&orderBy=timestamp%20desc`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch sensor data");
  const data = await res.json();
  const doc = data.documents?.[0];
  if (!doc) return null;
  const fields = doc.fields || {};
  return {
    temperature: fields.temperature?.doubleValue,
    humidity: fields.humidity?.doubleValue,
    soil_moisture1: fields.soil_moisture1?.integerValue,
    soil_moisture2: fields.soil_moisture2?.integerValue,
    timestamp: fields.timestamp?.timestampValue,
  };
}

// Helper to fetch pump status
export async function fetchPumpStatus() {
  const url = `${BASE_URL}/control/pump`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch pump status");
  const data = await res.json();
  const value = data.fields?.value?.stringValue;
  return {
    status: value === "1",
    last_changed: data.fields?.last_changed?.timestampValue,
  };
}

// Helper to set pump status
export async function setPumpStatus(on: boolean) {
  const url = `${BASE_URL}/control/pump?updateMask.fieldPaths=value`;
  const body = JSON.stringify({
    fields: {
      value: { stringValue: on ? "1" : "0" },
    },
  });
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) throw new Error("Failed to set pump status");
  return await res.json();
}

// Helper to fetch restart trigger
export async function fetchRestartTrigger() {
  const url = `${BASE_URL}/control/restart`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch restart trigger");
  const data = await res.json();
  return { value: data.fields?.value?.stringValue };
}

// Helper to trigger restart
export async function triggerRestart() {
  const url = `${BASE_URL}/control/restart?updateMask.fieldPaths=value`;
  const body = JSON.stringify({
    fields: {
      value: { stringValue: "1" },
    },
  });
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body,
  });
  if (!res.ok) throw new Error("Failed to trigger restart");
  return await res.json();
}

// Helper to fetch historical sensor data (optionally with since/limit)
export async function fetchHistoricalSensorData(params: { since?: string; limit?: number } = {}) {
  const { since, limit = 5000 } = params;
  let url = `${BASE_URL}/sensors?pageSize=${limit}&orderBy=timestamp%20desc`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch historical data");
  const data = await res.json();
  let docs: any[] = data.documents || [];
  if (since) {
    const sinceTime = new Date(since).getTime();
    docs = docs.filter((doc: any) => {
      const t = doc.fields?.timestamp?.timestampValue;
      return t && new Date(t).getTime() >= sinceTime;
    });
  }
  return docs.map((doc: any) => ({
    temperature: doc.fields?.temperature?.doubleValue,
    humidity: doc.fields?.humidity?.doubleValue,
    soil_moisture1: doc.fields?.soil_moisture1?.integerValue,
    soil_moisture2: doc.fields?.soil_moisture2?.integerValue,
    timestamp: doc.fields?.timestamp?.timestampValue,
  }));
} 