// src/features/location/hooks/useAddressSelector.ts
import { useState, useEffect } from "react";
import axios from "@/config/axios";

interface LocationItem { code: string; name: string; }
export function useAddressSelector() {
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards,     setWards]     = useState<LocationItem[]>([]);

  const [province, _setProvince] = useState("");
  const [district, _setDistrict] = useState("");
  const [ward,     setWard]      = useState("");

  useEffect(() => {
    axios.get<LocationItem[]>("/api/location/provinces")
      .then(r => setProvinces(r.data));
  }, []);

  // Khi chọn tỉnh → load huyện ngay, không cần find lại
  const setProvince = (name: string) => {
    _setProvince(name);
    _setDistrict("");
    setWard("");
    setDistricts([]);
    setWards([]);

    const found = provinces.find(p => p.name === name);
    if (!found) return;
    axios.get<LocationItem[]>("/api/location/districts", {
      params: { provinceCode: found.code }
    }).then(r => setDistricts(r.data));
  };

  // Khi chọn huyện → load xã ngay
  const setDistrict = (name: string) => {
    _setDistrict(name);
    setWard("");
    setWards([]);

    const found = districts.find(d => d.name === name);
    if (!found) return;
    axios.get<LocationItem[]>("/api/location/wards", {
      params: { districtCode: found.code }
    }).then(r => setWards(r.data));
  };

  return {
    provinces, districts, wards,
    province, setProvince,
    district, setDistrict,
    ward,     setWard,
  };
}