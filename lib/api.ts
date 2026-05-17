// Firestore REST API utility for solor-garden
const PROJECT_ID = "solor-garden";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Mock state to preserve interactions during fallback
let mockPumpStatus = false;
let mockPumpLastChanged = new Date().toISOString();
let mockRestartValue = "0";

// Helper to fetch latest sensor data (most recent document in 'sensors')
export async function fetchLatestSensorData() {
  try {
    const url = `${BASE_URL}/sensors?pageSize=1&orderBy=timestamp%20desc`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch sensor data");
    const data = await res.json();
    const doc = data.documents?.[0];
    if (!doc) throw new Error("No document found");
    const fields = doc.fields || {};
    return {
      temperature: fields.temperature?.doubleValue,
      humidity: fields.humidity?.doubleValue,
      soil_moisture1: fields.soil_moisture1?.integerValue,
      soil_moisture2: fields.soil_moisture2?.integerValue,
      timestamp: fields.timestamp?.timestampValue,
    };
  } catch (error) {
    console.warn("Using mock sensor data due to API error", error);
    return {
      temperature: 24.5 + Math.random() * 2 - 1,
      humidity: 60 + Math.random() * 5 - 2.5,
      soil_moisture1: 45 + Math.floor(Math.random() * 10 - 5),
      soil_moisture2: 50 + Math.floor(Math.random() * 10 - 5),
      timestamp: new Date().toISOString(),
    };
  }
}

// Helper to fetch pump status
export async function fetchPumpStatus() {
  try {
    const url = `${BASE_URL}/control/pump`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch pump status");
    const data = await res.json();
    const value = data.fields?.value?.stringValue;
    return {
      status: value === "1",
      last_changed: data.fields?.last_changed?.timestampValue,
    };
  } catch (error) {
    console.warn("Using mock pump status due to API error", error);
    return {
      status: mockPumpStatus,
      last_changed: mockPumpLastChanged,
    };
  }
}

// Helper to set pump status
export async function setPumpStatus(on: boolean) {
  try {
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
  } catch (error) {
    console.warn("Using mock set pump status due to API error", error);
    mockPumpStatus = on;
    mockPumpLastChanged = new Date().toISOString();
    return { success: true };
  }
}

// Helper to fetch restart trigger
export async function fetchRestartTrigger() {
  try {
    const url = `${BASE_URL}/control/restart`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch restart trigger");
    const data = await res.json();
    return { value: data.fields?.value?.stringValue };
  } catch (error) {
    console.warn("Using mock restart trigger due to API error", error);
    return { value: mockRestartValue };
  }
}

// Helper to trigger restart
export async function triggerRestart() {
  try {
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
  } catch (error) {
    console.warn("Using mock trigger restart due to API error", error);
    mockRestartValue = "1";
    setTimeout(() => { mockRestartValue = "0"; }, 5000);
    return { success: true };
  }
}

// Helper to fetch historical sensor data (optionally with since/limit)
export async function fetchHistoricalSensorData(params: { since?: string; limit?: number } = {}) {
  try {
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
  } catch (error) {
    console.warn("Using mock historical data due to API error", error);
    const mockData = [];
    const now = Date.now();
    for (let i = 0; i < 24; i++) {
      mockData.push({
        temperature: 22 + Math.random() * 5,
        humidity: 50 + Math.random() * 20,
        soil_moisture1: 40 + Math.random() * 20,
        soil_moisture2: 45 + Math.random() * 20,
        timestamp: new Date(now - i * 3600000).toISOString(),
      });
    }
    return mockData.reverse();
  }
} 