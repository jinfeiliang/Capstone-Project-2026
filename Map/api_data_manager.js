class DataProcessor {
  constructor(data, version = "versionA") {
    this.data = data;
    this.version = version;

    this.processors = {
      "Directory Of Homeless Drop- In Centers": this.processVersionA.bind(this),
      Food_Pantries_DYCD: this.processVersionB.bind(this),
    };
  }

  async process() {
    const handler = this.processors[this.version];

    if (!handler) {
      throw new Error(`Unknown version: ${this.version}`);
    }

    return await handler();
  }
  normalizeAddress(address) {
    if (!address) return null;

    if (typeof address === "string") {
      console.log("Lol stringy");
      return address;
    }

    if (typeof address === "object") {
      return [address.street, address.city, address.state, address.zip]
        .filter(Boolean)
        .join(", ");
    }

    return null;
  }
  processVersionA() {
    const address = this.normalizeAddress(this.data.address);

    // 🧠 Core metadata (exclude known fields)
    const excludedKeys = new Set([
      "provider",
      "center_name",
      "address",
      "contact",
      "latitude",
      "longitude",
    ]);

    const metadata = {};

    for (const key in this.data) {
      if (!excludedKeys.has(key.toLowerCase())) {
        metadata[key] = this.data[key];
      }
    }

    return {
      center_name:
        this.data.center_name ||
        this.data.provider || // fallback
        null,

      address,

      contact: {
        name: this.data.contact?.name || null,
        phone: this.data.contact?.phone || null,
        email: this.data.contact?.email || null,
        website: this.data.contact?.website || null,
      },

      latitude: this.parseNumber(this.data.latitude),
      longitude: this.parseNumber(this.data.longitude),

      metadata,
    };
  }
  async processVersionB() {
    const address = this.normalizeAddress(this.data.address);

    // 📍 Coordinates
    let latitude = this.parseNumber(this.data.latitude);
    let longitude = this.parseNumber(this.data.longitude);

    if (latitude == null || longitude == null) {
      const coords = await this.fetchCoordinates(address);
      latitude = coords.latitude;
      longitude = coords.longitude;
    }

    // 🧠 Build metadata by excluding known fields
    const excludedKeys = new Set([
      "center_name",
      "provider",
      "address",
      "contact",
      "latitude",
      "longitude",
    ]);

    const metadata = {};

    for (const key in this.data) {
      if (!excludedKeys.has(key.toLowerCase())) {
        metadata[key] = this.data[key];
      }
    }

    return {
      center_name: this.data.center_name || this.data.provider || null,

      address,

      contact: {
        name: null,
        phone: null,
        email: null,
        website: null,
      },

      latitude,
      longitude,

      metadata,
    };
  }
  parseNumber(value) {
    if (value == null) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  formatAddressObject(address) {
    if (!address || typeof address !== "object") return null;

    return [address.street, address.city, address.state, address.zip]
      .filter(Boolean)
      .join(", ");
  }

  async fetchCoordinates(address) {
    if (!address) {
      return { latitude: null, longitude: null };
    }

    // 🧠 Normalize address into a STRING
    let normalizedAddress = address;

    if (typeof address === "object") {
      normalizedAddress = [
        address.street,
        address.city,
        address.state,
        address.zip,
      ]
        .filter(Boolean)
        .join(", ");
    }

    if (typeof normalizedAddress !== "string" || !normalizedAddress.trim()) {
      return { latitude: null, longitude: null };
    }

    const cacheKey = normalizedAddress.toLowerCase().trim();

    // 🔥 SAFE CACHE LOAD
    let cache = {};
    try {
      cache =
        JSON.parse(localStorage.getItem("Address_Coordinates_Cache")) || {};
    } catch (e) {
      cache = {};
    }

    // 🔥 CACHE HIT
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    try {
      const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
        normalizedAddress,
      )}&access_token=${API_KEYS.MAPBOX_API_TOKEN_ACCESS_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      const coords = data?.features?.[0]?.geometry?.coordinates;

      if (!coords) {
        return { latitude: null, longitude: null };
      }

      const result = {
        latitude: coords[1],
        longitude: coords[0],
      };

      // 🔥 SAVE CACHE (IMPORTANT FIX)
      cache[cacheKey] = result;

      localStorage.setItem("Address_Coordinates_Cache", JSON.stringify(cache));

      return result;
    } catch (err) {
      console.error("Mapbox error:", err);
      return { latitude: null, longitude: null };
    }
  }
}
